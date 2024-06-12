from flask import Blueprint, request, jsonify

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # Add login logic here
    return jsonify({"message": "Login successful"}), 200

@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    # Add registration logic here
    return jsonify({"message": "Registration successful"}), 201