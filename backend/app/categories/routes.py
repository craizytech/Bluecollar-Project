from flask import Blueprint, jsonify
from app.models import ServiceCategory
from app.categories import categories_bp

@categories_bp.route('/all', methods=['GET'])
def get_categories():
    try:
        categories = ServiceCategory.query.all()
        categories_list = [{'id': category.category_id, 'name': category.category_name} for category in categories]
        return jsonify(categories_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
