from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Permissions, Booking, Chat, Notification
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

#Route to delete user profile
@users_bp.route('/profile/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    # Update bookings to set client_id to a default value or NULL
    bookings = Booking.query.filter_by(client_id=user_id).all()
    for booking in bookings:
        booking.client_id = ''  # or some default value
    db.session.commit()
    # Update chats to set sent_to to a default value or NULL
    chats = Chat.query.filter_by(sent_to=user_id).all()
    for chat in chats:
        chat.sent_to = ''  # or some default value
    db.session.commit()
    
    # Delete notifications associated with the user
    notifications = Notification.query.filter_by(user_id=user_id).all()
    for notification in notifications:
        db.session.delete(notification)
    db.session.commit()

    # Now delete the user
    user = User.query.get(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204



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

# Route to perform an admin action
@users_bp.route('/admin-action', methods=['POST'])
@jwt_required()
@permission_required(Permissions.ADD_USERS)
def admin_action():
    # Your admin action here
    return jsonify({"message": "Admin action performed"}), 200

#Route to get all users
@users_bp.route('/all', methods=['GET'])
def get_users():
    users = User.query.all()
    users_data = [
        {
            "user_id": user.user_id,
            "user_name": user.user_name,
            "user_email": user.user_email,
            "user_phone_number": user.user_phone_number,
            "user_address": user.user_address,
            "user_location": user.user_location,
            "user_profile_picture": user.user_profile_picture,
            "role_id": user.role_id
        } for user in users
    ]
    
    return jsonify(users_data), 200

#Route to make admin
@users_bp.route('/<int:user_id>/make-admin', methods=['POST'])
def assign_admin_role(user_id):
    # Get user by id
    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user.role_id = 1
    db.session.commit()
    
    return jsonify({"message": "User role updated successfully"}), 200

#Route to make general user
@users_bp.route('/<int:user_id>/make-general-user', methods=['POST'])
def assign_general_user_role(user_id):
    # Get user by id
    user = User.query.filter_by(user_id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user.role_id = 3
    db.session.commit()
    
    return jsonify({"message": "User role updated successfully"}), 200

# Route to get the count of users with role id 3 (Customers)
@users_bp.route('/count/customers', methods=['GET'])
def count_customers():
    count = User.query.filter_by(role_id=3).count()
    return jsonify({"count": count}), 200

# Route to get the count of users with role id 2 (Employees)
@users_bp.route('/count/employees', methods=['GET'])
def count_employees():
    count = User.query.filter_by(role_id=2).count()
    return jsonify({"count": count}), 200

