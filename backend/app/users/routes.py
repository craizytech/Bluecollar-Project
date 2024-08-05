from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Permissions
from app.extensions import db
from app.utils.decorators import permission_required
from app.users import users_bp

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route to get logged-in user profile
@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user:
        user_data = {
            "user_id": user.user_id,
            "user_name": user.user_name,
            "user_email": user.user_email,
            "user_phone_number": user.user_phone_number,
            "user_address": user.user_address,
            "user_location": user.user_location,
            "user_profile_picture": user.user_profile_picture,
            "role_id": user.role_id
        }
        return jsonify(user_data), 200
    return jsonify({"error": "User not found"}), 404

# Route to get user profile by user ID
@users_bp.route('/profile/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_profile(user_id):
    user = User.query.get(user_id)
    if user:
        user_data = {
            "user_id": user.user_id,
            "user_name": user.user_name,
            "user_email": user.user_email,
            "user_phone_number": user.user_phone_number,
            "user_address": user.user_address,
            "user_location": user.user_location,
            "user_profile_picture": user.user_profile_picture,
            "role_id": user.role_id
        }
        return jsonify(user_data), 200
    return jsonify({"error": "User not found"}), 404

# Route to update user profile
@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user:
        data = request.get_json()
        user.user_name = data.get('user_name', user.user_name)
        user.user_phone_number = data.get('user_phone_number', user.user_phone_number)
        user.user_address = data.get('user_address', user.user_address)
        user.user_location = data.get('user_location', user.user_location)
       
        # Update user_profile_picture only if provided
        user_profile_picture = data.get('user_profile_picture')
        if user_profile_picture is not None:
            user.user_profile_picture = user_profile_picture
            
        db.session.commit()
        return jsonify({"message": "Profile updated successfully"}), 200
    return jsonify({"error": "User not found"}), 404
