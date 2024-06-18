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
    booking.booking_date = data.get('booking_date', booking.booking_date)
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
    bookings = Booking.query.filter_by(client_id=user_id).all()
    booking_list = [
        {
            "booking_id": booking.booking_id,
            "service_id": booking.service_id,
            "provider_id": booking.provider_id,
            "booking_date": booking.booking_date,
            "status": booking.status,
            "location": booking.location
        }
        for booking in bookings
    ]
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

    if new_status not in ["accepted", "declined"]:
        return jsonify({"error": "Invalid status"}), 400

    booking.status = new_status
    db.session.commit()
    return jsonify({"message": "Booking status updated successfully"}), 200
