from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Booking, Service, User, Permissions, Notification
from app.extensions import db, socketio
from app.utils.decorators import permission_required
from datetime import datetime
from app.bookings import bookings_bp
from dateutil import parser


@bookings_bp.route('/create', methods=['POST'])
@jwt_required()
@permission_required(Permissions.BOOK_SERVICE)
def create_booking():
    data = request.get_json()
    service_id = data.get('service_id')
    provider_id = data.get('provider_id')
    booking_date_str = data.get('booking_date')
    start_time_str = data.get('start_time')      # Time in 'HH:MM:SS' format
    end_time_str = data.get('end_time') 
    location = data.get('location')
    service_description = data.get('description')  # Added field

    if not service_id or not provider_id or not booking_date_str or not start_time_str or not end_time_str or not location:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Parse date and time separately
        booking_date = parser.isoparse(booking_date_str).date()
        start_time = parser.isoparse(start_time_str).time()
        end_time = parser.isoparse(end_time_str).time()
        
        if start_time >= end_time:
            return jsonify({"error": "End time must be after start time"}), 400

        # Check for existing bookings for the same provider on the same day
        existing_booking = Booking.query.filter(
            Booking.provider_id == provider_id,
            Booking.booking_date == booking_date,
            Booking.start_time < end_time,
            Booking.end_time > start_time,
            Booking.status != "canceled"
        ).first()

        if existing_booking:
            return jsonify({"error": "Service provider is already booked for the selected time"}), 409


        client_id = get_jwt_identity()
        client = User.query.get(client_id)
        
        booking = Booking(
            service_id=service_id,
            client_id=client_id,
            provider_id=provider_id,
            booking_date=booking_date,
            start_time=start_time,
            end_time=end_time,
            location=location,
            description=service_description,  # Include description
            status="pending"
        )

        db.session.add(booking)
        db.session.commit()
        
         # Create a notification for the provider
        notification_message = f"You have a new booking from {client.user_name} for {service_description}."
        notification = Notification(
            user_id=provider_id,
            type='booking',  # or any type that represents a booking
            message=notification_message
        )
        db.session.add(notification)  # Use add instead of save
        db.session.commit()  # Commit the notification

        # Emit notification to the provider
        socketio.emit('notification', {
            'userId': provider_id,
            'type': 'booking',
            'message': notification_message,
        }, room=provider_id)  # Emit to specific user

        return jsonify({"message": "Booking created successfully"}), 201
    except ValueError:
        return jsonify({"error": "Invalid date or time format"}), 400
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
        start_time_str = data.get('start_time')
        end_time_str = data.get('end_time')
        
        if booking_date_str:
            booking.booking_date = datetime.fromisoformat(booking_date_str).date()
        if start_time_str:
            booking.start_time = datetime.strptime(start_time_str, "%H:%M:%S").time()
        if end_time_str:
            booking.end_time = datetime.strptime(end_time_str, "%H:%M:%S").time()

        booking.location = data.get('location', booking.location)
        booking.description = data.get('description', booking.description)
        
        # Ensure start and end times are valid
        if booking.start_time >= booking.end_time:
            return jsonify({"error": "End time must be after start time"}), 400

        db.session.commit()
        return jsonify({"message": "Booking updated successfully"}), 200
    except ValueError:
        return jsonify({"error": "Invalid date or time format"}), 400
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
            "booking_date": booking.booking_date.isoformat(),
            "start_time": booking.start_time.isoformat(),  # Include start time
            "end_time": booking.end_time.isoformat(),
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
            "booking_date": booking.booking_date.isoformat(),
            "start_time": booking.start_time.isoformat(),  # Include start time
            "end_time": booking.end_time.isoformat(),
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
        
         # Get the client and provider details
        client = User.query.get(booking.client_id)
        provider = User.query.get(booking.provider_id)

        # Define notification message based on status
        if new_status == "accepted":
            notification_message = f"Your booking for {booking.description} has been accepted by {provider.user_name}."
        elif new_status == "declined":
            notification_message = f"Your booking for {booking.description} was declined by {provider.user_name}."
        elif new_status == "completed":
            notification_message = f"Your booking for {booking.description} has been marked as completed by {provider.user_name}."

        # Create a notification record for the client
        notification = Notification(
            user_id=client.user_id,
            type='booking_status',
            message=notification_message
        )
        db.session.add(notification)
        db.session.commit()

        # Emit notification to the client
        socketio.emit('notification', {
            'userId': client.user_id,
            'type': 'booking_status',
            'message': notification_message
        }, room=client.user_id)

        return jsonify({"message": "Booking status updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
