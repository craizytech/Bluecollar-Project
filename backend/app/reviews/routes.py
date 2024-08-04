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
        return jsonify({"msg": "Service ID, Provider ID, and Rating are required"}), 400

    client_id = get_jwt_identity()
    
     # Check if the user has already reviewed this service
    existing_review = Review.query.filter_by(service_id=service_id, provider_id=provider_id, client_id=client_id).first()
    if existing_review:
        return jsonify({"msg": "You have already submitted a review for this service"}), 400
    
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
    if not reviews:
        return jsonify({"message": "No reviews found for this service"}), 404

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

# Route to view reviews by a client
@reviews_bp.route('/client', methods=['GET'])
@jwt_required()
def view_client_reviews():
    client_id = get_jwt_identity()
    reviews = Review.query.filter_by(client_id=client_id).all()
    if not reviews:
        return jsonify({"message": "No reviews found for this client"}), 404

    review_list = [
        {
            "review_id": review.review_id,
            "service_id": review.service_id,
            "provider_id": review.provider_id,
            "rating": review.rating,
            "comment": review.comment,
            "date_of_creation": review.date_of_creation
        }
        for review in reviews
    ]
    return jsonify(review_list), 200

# Route to update a review
@reviews_bp.route('/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review(review_id):
    review = Review.query.get_or_404(review_id)
    client_id = get_jwt_identity()

    if review.client_id != client_id:
        return jsonify({"error": "You can only update your own reviews"}), 403

    data = request.get_json()
    review.rating = data.get('rating', review.rating)
    review.comment = data.get('comment', review.comment)

    db.session.commit()
    return jsonify({"message": "Review updated successfully"}), 200

# Route to delete a review
@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    review = Review.query.get_or_404(review_id)
    client_id = get_jwt_identity()

    if review.client_id != client_id:
        return jsonify({"error": "You can only delete your own reviews"}), 403

    db.session.delete(review)
    db.session.commit()
    return jsonify({"message": "Review deleted successfully"}), 200
