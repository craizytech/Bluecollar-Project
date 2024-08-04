from flask import Blueprint, jsonify
from app.models import ServiceCategory, Service
from app.main import main_bp

# Route to get all categories
@main_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = ServiceCategory.query.all()
        categories_list = [{'category_id': category.category_id, 'category_name': category.category_name} for category in categories]
        return jsonify(categories_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to get all services
@main_bp.route('/', methods=['GET'])
def get_services():
    try:
        services = Service.query.all()
        services_list = [{
            'service_id': service.service_id,
            'service_name': service.service_name,
            'service_description': service.service_description,
            'category_id': service.category_id
        } for service in services]
        return jsonify(services_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
