from flask import Blueprint, jsonify

users_bp = Blueprint('users', __name__)

@users_bp.route('/users', methods=['GET'])
def get_users():
    # Add logic to retrieve users here
    return jsonify({"users": []}), 200