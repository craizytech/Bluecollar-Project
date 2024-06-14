from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Service, ServiceCategory, User, Permissions
from app.extensions import db
from app.utils.decorators import permission_required

services_bp = Blueprint('services', __name__)

# Route to create a new service
@services_bp.route('/create', methods=['POST'])
@jwt_required()
@permission_required(Permissions.ACCEPT_BOOKING_REQUESTS)
def create_service():
    data = request.get_json()
    service_name = data.get('service_name')
    service_description = data.get('service_description')
    category_id = data.get('category_id')

    if not service_name or not category_id:
        return jsonify({"error": "Missing required fields"}), 400

    service = Service(
        service_name=service_name,
        service_description=service_description,
        category_id=category_id
    )

    db.session.add(service)
    db.session.commit()

    return jsonify({"message": "Service created successfully"}), 201

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

    db.session.commit()
    return jsonify({"message": "Service updated successfully"}), 200

# Route to delete a service
@services_bp.route('/<int:service_id>', methods=['DELETE'])
@jwt_required()
@permission_required(Permissions.ACCEPT_BOOKING_REQUESTS)
def delete_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404

    db.session.delete(service)
    db.session.commit()
    return jsonify({"message": "Service deleted successfully"}), 200

# Route to view services by category
@services_bp.route('/category/<int:category_id>', methods=['GET'])
def view_services_by_category(category_id):
    services = Service.query.filter_by(category_id=category_id).all()
    service_list = [
        {
            "service_id": service.service_id,
            "service_name": service.service_name,
            "service_description": service.service_description,
            "category_id": service.category_id
        }
        for service in services
    ]
    return jsonify(service_list), 200

# Route to view all services
@services_bp.route('/all', methods=['GET'])
def view_all_services():
    services = Service.query.all()
    service_list = [
        {
            "service_id": service.service_id,
            "service_name": service.service_name,
            "service_description": service.service_description,
            "category_id": service.category_id
        }
        for service in services
    ]
    return jsonify(service_list), 200
