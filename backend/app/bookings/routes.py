from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Booking, Service, User, Permissions
from app.extensions import db
from app.utils.decorators import permission_required
from datetime import datetime

bookings_bp = Blueprint('bookings', __name__)

# Route to create a new booking
@bookings_bp.route('/create', methods=['POST'])
@jwt_required()
@permission_required(Permissions.BOOK_SERVICE)
def create_booking():
    data = request.get_json()
    service_id = data.get('service_id')
    provider_id = data.get('provider_id')
    booking_date_str = data.get('booking_date')
    location = data.get('location')

    if not service_id or not provider_id or not booking_date_str or not location:
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        # Convert the date string to a datetime object
        booking_date = datetime.fromisoformat(booking_date_str)
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    client_id = get_jwt_identity()
    booking = Booking(
        service_id=service_id,
        client_id=client_id,
        provider_id=provider_id,
        booking_date=booking_date,
        location=location,
        status="pending"
    )

    db.session.add(booking)
    db.session.commit()

    return jsonify({"message": "Booking created successfully"}), 201

# Route to update a booking
@bookings_bp.route('/<int:booking_id>', methods=['PUT'])
@jwt_required()
@permission_required(Permissions.BOOK_SERVICE)
def update_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    data = request.get_json()
    
     # Convert ISO date string to a Python date object
    booking_date_str = data.get('booking_date')
    if booking_date_str:
        try:
            # Parse the ISO string into a datetime object and extract the date
            booking_date = datetime.fromisoformat(booking_date_str.replace('Z', '+00:00')).date()
            booking.booking_date = booking_date
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400
        
    booking.location = data.get('location', booking.location)
    

    db.session.commit()
    return jsonify({"message": "Booking updated successfully"}), 200

# Route to cancel a booking
@bookings_bp.route('/<int:booking_id>', methods=['DELETE'])
@jwt_required()
@permission_required(Permissions.CANCEL_BOOKING)
def cancel_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    booking.status = "canceled"
    db.session.commit()
    return jsonify({"message": "Booking canceled successfully"}), 200

# Route to view user bookings
@bookings_bp.route('/my-bookings', methods=['GET'])
@jwt_required()
@permission_required(Permissions.VIEW_BOOKINGS)
def view_user_bookings():
    user_id = get_jwt_identity()
    bookings_as_client = Booking.query.filter_by(client_id=user_id).all()
    bookings_as_provider = Booking.query.filter_by(provider_id=user_id).all()
    booking_list = []
    for booking in bookings_as_client:
        service = Service.query.get(booking.service_id)
        provider = User.query.get(booking.provider_id)
        booking_list.append({
            "booking_id": booking.booking_id,
            "service_id": booking.service_id,
            "service_name": service.service_name if service else "Unknown Service",
            "provider_id": booking.provider_id,
            "provider_name": provider.user_name if provider else "Unknown Provider",
            "booking_date": booking.booking_date,
            "status": booking.status,
            "location": booking.location,
            "role": "client"
        })
        
        for booking in bookings_as_provider:
            service = Service.query.get(booking.service_id)
            client = User.query.get(booking.client_id)
            booking_list.append({
                "booking_id": booking.booking_id,
                "service_id": booking.service_id,
                "service_name": service.service_name if service else "Unknown Service",
                "client_id": booking.client_id,
                "client_name": client.user_name if client else "Unkown Client",
                "booking_date": booking.booking_date,
                "status": booking.status,
                "location": booking.location,
                "role": "provider"
            })
    return jsonify(booking_list), 200

# Route for providers to accept/decline a booking
@bookings_bp.route('/<int:booking_id>/status', methods=['PATCH'])
@jwt_required()
@permission_required(Permissions.ACCEPT_BOOKING_REQUESTS)
def update_booking_status(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    data = request.get_json()
    new_status = data.get('status')

    if new_status not in ["accepted", "declined", "completed"]:
        return jsonify({"error": "Invalid status"}), 400

    booking.status = new_status
    db.session.commit()
    return jsonify({"message": "Booking status updated successfully"}), 200


# Route to fetch all booked dates for a specific provider
@bookings_bp.route('/booked-dates', methods=['GET'])
@jwt_required()
def get_booked_dates():
    provider_id = request.args.get('providerId')
    
    if not provider_id:
        return jsonify({"error": "Missing providerId parameter"}), 400

    bookings = Booking.query.with_entities(Booking.booking_date).filter_by(provider_id=provider_id).all()
    booked_dates = [booking.booking_date.isoformat() for booking in bookings]
    return jsonify({"bookedDates": booked_dates}), 200

# Route to check if a date is booked
@bookings_bp.route('/check', methods=['GET'])
@jwt_required()
def check_date_booked():
    date_str = request.args.get('date')
    
    if not date_str:
        return jsonify({"error": "Missing date parameter"}), 400

    try:
        # Convert the date string to a datetime object
        date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    # Query to check if there's any booking on the given date
    is_booked = Booking.query.filter_by(booking_date=date).first() is not None

    return jsonify({"isBooked": is_booked}), 200