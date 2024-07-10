from flask import Blueprint, jsonify

from app.models import ServiceCategory

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/api/categories/all', methods=['GET'])
def get_categories():
    categories = ServiceCategory.query.all()
    categories_list = [{'id': category.category_id, 'name': category.category_name} for category in categories]
    return jsonify(categories_list)