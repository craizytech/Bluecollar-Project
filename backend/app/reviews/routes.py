from flask import Blueprint, request, jsonify

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/reviews', methods=['GET'])
def get_reviews():
    # Add logic to retrieve reviews here
    return jsonify({"reviews": []}), 200

@reviews_bp.route('/reviews', methods=['POST'])
def add_review():
    data = request.get_json()
    # Add logic to add a new review here
    return jsonify({"message": "Review added successfully"}), 201
