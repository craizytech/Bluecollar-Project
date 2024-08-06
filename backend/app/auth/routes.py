from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from app.extensions import db
from app.models import User, Role
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from app.auth import auth_bp

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Validate data
    required_fields = ['user_name', 'user_email', 'user_password', 'user_phone_number', 'user_address', 'user_location', 'user_profile_picture']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Check if user already exists
    if User.query.filter_by(user_email=data.get('user_email')).first():
        return jsonify({"error": "User already exists"}), 409

    try:
        # Get default role for a normal user
        role = Role.query.filter_by(role_name='General User').first()
        if not role:
            return jsonify({"error": "Default role not found"}), 500

        # Create new user
        new_user = User(
            user_name=data.get('user_name'),
            user_email=data.get('user_email'),
            user_password=generate_password_hash(data.get('user_password')),
            user_phone_number=data.get('user_phone_number', ''),
            user_address=data.get('user_address', ''),
            user_location=data.get('user_location', ''),
            user_profile_picture=data.get('user_profile_picture', ''),
            role_id=role.role_id  # Using dynamically fetched role ID
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "Registration successful"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Validate data
    if not data or not data.get('user_email') or not data.get('user_password'):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Find user
        user = User.query.filter_by(user_email=data.get('user_email')).first()

        if user and check_password_hash(user.user_password, data.get('user_password')):
            access_token = create_access_token(identity=user.user_id)
            return jsonify(
                access_token=access_token,
                user_role=user.role_id,
                user_id=user.user_id
            ), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500
