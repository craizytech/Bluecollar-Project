from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Service, ServiceCategory, Review, User, Permissions, ServiceProviderApplication, Notification
from app.extensions import db, socketio
from app.utils.decorators import permission_required
from app.services import services_bp
import requests
import re
from math import radians, cos, sin, sqrt, atan2

# Function to calculate distance between two coordinates using the Haversine formula
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in kilometers
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

# Helper function to validate required fields
def validate_fields(data, required_fields):
    for field in required_fields:
        if not data.get(field):
            return False, f"Missing required field: {field}"
    return True, None

# Route to create a new service
@services_bp.route('/create', methods=['POST'])
def create_service():
    # Check for required fields
    if 'name' not in request.form or 'description' not in request.form or 'category_id' not in request.form:
        return jsonify({'error': 'Missing required fields'}), 400

    # Get the form data
    service_name = request.form.get('name').lower()
    service_description = request.form.get('description')
    category_id = request.form.get('category_id')
    provider_id = ''

    # Validate category
    category = ServiceCategory.query.filter_by(category_id=category_id).first()
    if not category:
        return jsonify({'error': 'Invalid category ID'}), 400

    # Create the new service
    new_service = Service(
        service_name=service_name,
        service_description=service_description,
        category_id=category_id,
        provider_id=provider_id
    )

    try:
        db.session.add(new_service)
        db.session.commit()
        return jsonify({
            'message': 'Service created successfully',
            'service': {
                'name': new_service.service_name,
                'description': new_service.service_description,
                'category_id': new_service.category_id,
                'provider_id': new_service.provider_id,
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Route to update a service
@services_bp.route('/update/<int:service_id>', methods=['PUT'])
def update_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404

    data = request.get_json()
    service.service_name = data.get('service_name', service.service_name)
    service.service_description = data.get('service_description', service.service_description)
    service.category_id = data.get('category_id', service.category_id)
    service.provider_id = ''

    try:
        db.session.commit()
        return jsonify({"message": "Service updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to delete a service
@services_bp.route('/delete/<int:service_id>', methods=['DELETE'])
def delete_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404

    try:
        db.session.delete(service)
        db.session.commit()
        return jsonify({"message": "Service deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to view services by category
@services_bp.route('/category/<int:category_id>', methods=['GET'])
def view_services_by_category(category_id):
    try:
        services = Service.query.filter_by(category_id=category_id).all()
        service_list = [
            {
                "service_id": service.service_id,
                "service_name": service.service_name,
                "service_description": service.service_description,
                "category_id": service.category_id,
                "provider_id": service.provider_id
            }
            for service in services
        ]
        return jsonify(service_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to view all services
@services_bp.route('/all', methods=['GET'])
def view_all_services():
    try:
        services = Service.query.all()
        service_list = [
            {
                "service_id": service.service_id,
                "service_name": service.service_name,
                "service_description": service.service_description,
                "category_id": service.category_id,
                "provider_id": service.provider_id
            }
            for service in services
        ]
        return jsonify(service_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to view a specific service with detailed information
@services_bp.route('/<int:service_id>', methods=['GET'])
def view_service_details(service_id):
    try:
        service = Service.query.get(service_id)
        if not service:
            return jsonify({"error": "Service not found"}), 404

        category = ServiceCategory.query.get(service.category_id)
        provider = User.query.get(service.provider_id)
        reviews = Review.query.filter_by(service_id=service.service_id).all()
        
        reviews_list = [
            {
                "review_id": review.review_id,
                "client_id": review.client_id,
                "client_name": User.query.get(review.client_id).user_name,
                "rating": review.rating,
                "comment": review.comment,
                "date_of_creation": review.date_of_creation
            }
            for review in reviews
        ]
        
        average_rating = sum(review.rating for review in reviews) / len(reviews) if reviews else None

        service_details = {
            "service_id": service.service_id,
            "service_name": service.service_name,
            "service_description": service.service_description,
            "service_duration": service.service_duration,
            "category_id": category.category_id,
            "category_name": category.category_name if category else None,
            "provider_id": service.provider_id,
            "provider_name": provider.user_name if provider else None,
            "provider_location": provider.user_location if provider else None,
            "reviews": reviews_list,
            "average_rating": average_rating
        }
        
        return jsonify(service_details), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
  
    
# Route to search services by location and term
@services_bp.route('/search', methods=['GET'])
def search_services():
    term = request.args.get('term')
    address = request.args.get('location')
    search_radius = 10  # Radius in kilometers

    if not term or not address:
        return jsonify({"error": "Search term and location are required"}), 400

    try:
        # Use a geocoding API (e.g., OpenStreetMap Nominatim) to convert address to latitude and longitude
        geocode_url = f"https://nominatim.openstreetmap.org/search?format=json&q={address}&countrycodes=KE"
        headers = {'User-Agent': 'MyApp/1.0'}
        response = requests.get(geocode_url, headers=headers)

        if response.status_code != 200:
            return jsonify({"error": f"Geocoding API request failed with status code {response.status_code}"}), 500

        geocode_data = response.json()

        if not geocode_data:
            return jsonify({"error": "Invalid address or address not found"}), 400
        
        latitude = float(geocode_data[0]['lat'])
        longitude = float(geocode_data[0]['lon'])

        print(f"Searching for term: {term} near address: {address} (Lat: {latitude}, Lng: {longitude})")

        # Fetch all services and their locations
        all_services = db.session.query(Service, User.user_location).join(
            User, Service.provider_id == User.user_id).filter(
                Service.service_name.ilike(f'%{term}%')
            ).all()

        # Filter services within the specified search radius by extracting lat/lng from user_location
        nearby_services = []
        location_pattern = r"([-+]?\d*\.\d+|\d+),\s*([-+]?\d*\.\d+|\d+)"  # Regex to match latitude and longitude

        for service, user_location in all_services:
            match = re.search(location_pattern, user_location)
            if match:
                user_lat, user_lon = float(match.group(1)), float(match.group(2))
                distance = haversine_distance(latitude, longitude, user_lat, user_lon)

                if distance <= search_radius:
                    # Reverse-geocode the provider's location
                    reverse_geocode_url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={user_lat}&lon={user_lon}"
                    reverse_response = requests.get(reverse_geocode_url, headers=headers)

                    if reverse_response.status_code == 200:
                        reverse_data = reverse_response.json()
                        provider_address = reverse_data.get('display_name', 'Address not found')
                    else:
                        provider_address = "Address not found"
                    nearby_services.append({
                        "service_id": service.service_id,
                        "service_name": service.service_name,
                        "service_description": service.service_description,
                        "category_id": service.category_id,
                        "provider_id": service.provider_id,
                        "provider_location": provider_address,
                        "distance_km": round(distance, 2)
                    })

        print(f"Found {len(nearby_services)} services within {search_radius} km")

        return jsonify({"services": nearby_services}), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Error making request to geocoding API: {str(e)}"}), 500
    except ValueError as e:
        return jsonify({"error": f"Error parsing JSON response: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error during search: {str(e)}"}), 500

@services_bp.route('/apply_service', methods=['POST'])
@jwt_required()
def apply_service():
    data = request.get_json()
    email = data.get('email')
    service_category_id = data.get('service_category_id')
    service_id = data.get('service_id')
    duration = data.get('service_duration')

    if not email or not service_category_id or not service_id or not duration:
        return jsonify({"error": "Missing required fields"}), 400

    new_application = ServiceProviderApplication(
        email=email,
        service_category_id=service_category_id,
        service_id=service_id,
        duration=duration
    )

    try:
        db.session.add(new_application)
        db.session.commit()
        return jsonify({"message": "Application submitted successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@services_bp.route('/applications', methods=['GET'])
def get_applications():
    applications = ServiceProviderApplication.query.all()
    applications_data = []
    
    for application in applications:
        applications_data.append({
            'application_id': application.application_id,
            'email': application.email,
            'service_category': application.service_category.category_name,
            'service': application.service.service_name,
            'status': application.status,
            'date_of_application': application.date_of_application,
            'service_duration': application.duration
        })

    return jsonify(applications_data), 200



@services_bp.route('/applications/<int:application_id>/approve', methods=['POST'])
def approve_application(application_id):
    application = ServiceProviderApplication.query.get_or_404(application_id)

    if application.status == 'approved':
        return jsonify({"error": "Application is already approved"}), 400

    application.status = 'approved'
    
    # Create a new service entry for the approved provider
    new_service = Service(
        service_name=application.service.service_name,
        service_description=application.service.service_description,
        category_id=application.service_category_id,
        provider_id=User.query.filter_by(user_email=application.email).first().user_id,
        service_duration=application.duration
    )

    try:
        db.session.add(new_service)
        db.session.commit()
        
        # Notify the applicant about the approval
        user = User.query.filter_by(user_email=application.email).first()
        notification_message = "Congratulations! Your application to become a service provider has been approved."

        notification = Notification(
            user_id=user.user_id,
            type='service_application_status',
            message=notification_message
        )
        db.session.add(notification)
        db.session.commit()

        # Emit notification to the applicant
        socketio.emit('notification', {
            'userId': user.user_id,
            'type': 'service_application_status',
            'message': notification_message
        }, room=user.user_id)
        
        return jsonify({"message": "Application approved successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
    
@services_bp.route('/applications/<int:application_id>/update-role', methods=['POST'])
def update_user_role(application_id):
        # Get the application
    application = ServiceProviderApplication.query.get(application_id)
    if not application:
        return jsonify({"error": "Application not found"}), 404

    # Get the user by email
    user = User.query.filter_by(user_email=application.email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Update the user's role_id to 2
    user.role_id = 2
    db.session.commit()

    return jsonify({"message": "User role updated successfully"}), 200


@services_bp.route('/applications/<int:application_id>/decline', methods=['POST'])
def decline_application(application_id):
    application = ServiceProviderApplication.query.get_or_404(application_id)

    if application.status == 'declined':
        return jsonify({"error": "Application is already declined"}), 400

    application.status = 'declined'

    try:
        db.session.commit()
        
        # Notify the applicant about the decline
        user = User.query.filter_by(user_email=application.email).first()
        notification_message = "We regret to inform you that your application to become a service provider has been declined."

        notification = Notification(
            user_id=user.user_id,
            type='service_application_status',
            message=notification_message
        )
        db.session.add(notification)
        db.session.commit()

        # Emit notification to the applicant
        socketio.emit('notification', {
            'userId': user.user_id,
            'type': 'service_application_status',
            'message': notification_message
        }, room=user.user_id)

        return jsonify({"message": "Application declined successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@services_bp.route('/applications/<int:application_id>/downgrade-role', methods=['POST'])
def downgrade_user_role(application_id):
        # Get the application
    application = ServiceProviderApplication.query.get(application_id)
    if not application:
        return jsonify({"error": "Application not found"}), 404

    # Get the user by email
    user = User.query.filter_by(user_email=application.email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Update the user's role_id to 3
    user.role_id = 3
    db.session.commit()

    return jsonify({"message": "User role updated successfully"}), 200

@services_bp.route('/count/services', methods=['GET'])
def count_services():
    count = Service.query.count()
    return jsonify({"count": count}), 200
