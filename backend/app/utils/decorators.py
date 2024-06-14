from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models import User

def permission_required(permission):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if user and user.role.permissions & permission == permission:
                return f(*args, **kwargs)
            return jsonify({"error": "Permission denied"}), 403
        return decorated_function
    return decorator
