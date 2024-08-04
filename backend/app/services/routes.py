from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Service, ServiceCategory, Review, User, Permissions
from app.extensions import db
from app.utils.decorators import permission_required
from app.services import services_bp

# Helper function to validate required fields
def validate_fields(data, required_fields):
    for field in required_fields:
        if not data.get(field):
            return False, f"Missing required field: {field}"
    return True, None

# Route to create a new service
@services_bp.route('/create', methods=['POST'])
@jwt_required()
@permission_required(Permissions.ACCEPT_BOOKING_REQUESTS)
def create_service():
    data = request.get_json()
    required_fields = ['service_name', 'category_id', 'provider_id', 'service_description']
    is_valid, error_message = validate_fields(data, required_fields)
    
    if not is_valid:
        return jsonify({"error": error_message}), 400

    service = Service(
        service_name=data['service_name'],
        service_description=data['service_description'],
        category_id=data['category_id'],
        provider_id=data['provider_id']
    )

    try:
        db.session.add(service)
        db.session.commit()
        return jsonify({"message": "Service created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to update a service
@services_bp.route('/<int:service_id>', methods=['PUT'])
@jwt_required()
@permission_required(Permissions.ACCEPT_BOOKING_REQUESTS)
def update_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404

    data = request.get_json()
    service.service_name = data.get('service_name', service.service_name)
    service.service_description = data.get('service_description', service.service_description)
    service.category_id = data.get('category_id', service.category_id)
    service.provider_id = data.get('provider_id', service.provider_id)

    try:
        db.session.commit()
        return jsonify({"message": "Service updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to delete a service
@services_bp.route('/<int:service_id>', methods=['DELETE'])
@jwt_required()
@permission_required(Permissions.ACCEPT_BOOKING_REQUESTS)
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
