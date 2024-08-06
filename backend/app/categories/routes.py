from flask import Blueprint, jsonify
from app.models import ServiceCategory
from app.categories import categories_bp

@categories_bp.route('/all', methods=['GET'])
def get_categories():
    categories = ServiceCategory.query.all()
    categories_list = [{'id': category.category_id, 'name': category.category_name, 'creation_date': category.date_of_creation} for category in categories]
    return jsonify(categories_list)