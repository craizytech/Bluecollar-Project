from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from app.extensions import db
from app.models import TokenBlockList, User
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate data
    required_fields = ['user_name', 'user_email', 'user_password', 'user_phone_number', 'user_address', 'user_location', 'user_profile_picture', 'role_id']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400
        
    # Check if user already exists
    if User.query.filter_by(user_email=data.get('user_email')).first():
        return jsonify({"error": "User already exists"}), 409

    # Create new user
    new_user = User(
        user_name=data.get('user_name'),
        user_email=data.get('user_email'),
        user_password=generate_password_hash(data.get('user_password')),
        user_phone_number=data.get('user_phone_number', ''),
        user_address=data.get('user_address', ''),
        user_location=data.get('user_location', ''),
        user_profile_picture=data.get('user_profile_picture', ''),
        role_id=data.get('role_id', 2)  # Assuming 2 is the role ID for a normal user
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Registration successful"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Validate data
    if not data or not data.get('user_email') or not data.get('user_password'):
        return jsonify({"error": "Missing required fields"}), 400

    # Find user
    user = User.query.filter_by(user_email=data.get('user_email')).first()

    if user and check_password_hash(user.user_password, data.get('user_password')):
        access_token = create_access_token(identity=user.user_id)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401
    
@auth_bp.route('/logout', methods=['POST'])
def logout():
    jti = get_jwt()['jti']
    token = TokenBlockList(jti=jti)
    db.session.add(token)
    db.session.commit()
    return jsonify({"message": "Successfully logged out"}), 200
