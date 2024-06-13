from flask import Blueprint

locations_bp = Blueprint('locations', __name__)

from . import routes
