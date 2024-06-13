from flask import Blueprint, request, jsonify

services_bp = Blueprint('services', __name__)

@services_bp.route('/services', methods=['GET'])
def get_services():
    # Add logic to retrieve services here
    return jsonify({"services": []}), 200

@services_bp.route('/services', methods=['POST'])
def add_service():
    data = request.get_json()
    # Add logic to add a new service here
    return jsonify({"message": "Service added successfully"}), 201