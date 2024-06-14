from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Review, Service, User
from app.extensions import db

reviews_bp = Blueprint('reviews', __name__)

# Route to write a review
@reviews_bp.route('/write', methods=['POST'])
@jwt_required()
def write_review():
    data = request.get_json()
    service_id = data.get('service_id')
    provider_id = data.get('provider_id')
    rating = data.get('rating')
    comment = data.get('comment', '')

    if not service_id or not provider_id or not rating:
        return jsonify({"error": "Missing required fields"}), 400

    client_id = get_jwt_identity()
    review = Review(
        service_id=service_id,
        client_id=client_id,
        provider_id=provider_id,
        rating=rating,
        comment=comment
    )

    db.session.add(review)
    db.session.commit()

    return jsonify({"message": "Review submitted successfully"}), 201

# Route to view reviews for a service
@reviews_bp.route('/service/<int:service_id>', methods=['GET'])
def view_service_reviews(service_id):
    reviews = Review.query.filter_by(service_id=service_id).all()
    review_list = [
        {
            "review_id": review.review_id,
            "client_id": review.client_id,
            "provider_id": review.provider_id,
            "rating": review.rating,
            "comment": review.comment,
            "date_of_creation": review.date_of_creation
        }
        for review in reviews
    ]
    return jsonify(review_list), 200
