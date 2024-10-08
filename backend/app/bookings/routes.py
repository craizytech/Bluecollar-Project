from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Booking, Service, User, Permissions
from app.extensions import db
from app.utils.decorators import permission_required
from datetime import datetime
from app.bookings import bookings_bp

@bookings_bp.route('/create', methods=['POST'])
@jwt_required()
@permission_required(Permissions.BOOK_SERVICE)
def create_booking():
    data = request.get_json()
    service_id = data.get('service_id')
    provider_id = data.get('provider_id')
    booking_date_str = data.get('booking_date')
    location = data.get('location')
    service_description = data.get('description')  # Added field

    if not service_id or not provider_id or not booking_date_str or not location:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Convert the date string to a datetime object
        booking_date = datetime.fromisoformat(booking_date_str).date()
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    # Check for existing bookings for the same provider on the same day
    existing_booking = Booking.query.filter(
        Booking.provider_id == provider_id,
        db.func.date(Booking.booking_date) == booking_date,
        Booking.status != "canceled"
    ).first()

    if existing_booking:
        return jsonify({"error": "Service provider is already booked for the selected day"}), 409

    try:
        client_id = get_jwt_identity()
        booking = Booking(
            service_id=service_id,
            client_id=client_id,
            provider_id=provider_id,
            booking_date=datetime.fromisoformat(booking_date_str),
            location=location,
            description=service_description,  # Include description
            status="pending"
        )

        db.session.add(booking)
        db.session.commit()

        return jsonify({"message": "Booking created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

# Route to update a booking
@bookings_bp.route('/<int:booking_id>', methods=['PUT'])
@jwt_required()
@permission_required(Permissions.BOOK_SERVICE)
def update_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    data = request.get_json()

    try:
        booking_date_str = data.get('booking_date')
        if booking_date_str:
            booking.booking_date = datetime.fromisoformat(booking_date_str)

        booking.location = data.get('location', booking.location)

        db.session.commit()
        return jsonify({"message": "Booking updated successfully"}), 200
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to cancel a booking
@bookings_bp.route('/<int:booking_id>', methods=['DELETE'])
@jwt_required()
@permission_required(Permissions.CANCEL_BOOKING)
def cancel_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    try:
        booking.status = "canceled"
        db.session.commit()
        return jsonify({"message": "Booking canceled successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

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
            "description": booking.description,  # Include description
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
            "client_name": client.user_name if client else "Unknown Client",
            "booking_date": booking.booking_date,
            "status": booking.status,
            "location": booking.location,
            "description": booking.description,  # Include description
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

    try:
        booking.status = new_status
        db.session.commit()
        return jsonify({"message": "Booking status updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
