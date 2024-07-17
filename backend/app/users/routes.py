from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Permissions
from app.extensions import db
from app.utils.decorators import permission_required

users_bp = Blueprint('users', __name__)

# Route to get user profile
@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user_data = {
        'user_id': user.user_id,
        'user_name': user.user_name,
        'user_email': user.user_email,
        'user_phone_number': user.user_phone_number,
        'user_address': user.user_address,
        'user_location': user.user_location,
        'user_profile_picture': user.user_profile_picture,
        'role_id': user.role_id
    }
    return jsonify({"user": user_data}), 200

# Route to update user profile
@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    user.user_name = data.get('user_name', user.user_name)
    user.user_email = data.get('user_email', user.user_email)
    user.user_phone_number = data.get('user_phone_number', user.user_phone_number)
    user.user_address = data.get('user_address', user.user_address)
    user.user_location = data.get('user_location', user.user_location)
    user.user_profile_picture = data.get('user_profile_picture', user.user_profile_picture)

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"}), 200


# admin action routes
# DELETE A USER
@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
@permission_required(Permissions.ADMIN)
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200