from flask import Blueprint, jsonify

users = Blueprint('users', __name__)

@users.route('/users', methods=['GET'])
def get_users():
    # Add logic to retrieve users here
    return jsonify({"users": []}), 200