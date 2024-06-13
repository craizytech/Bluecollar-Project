from flask import Blueprint

reviews_bp = Blueprint('reviews', __name__)

from . import routes
