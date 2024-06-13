from flask import Blueprint

bookings_bp = Blueprint('bookings', __name__)

from . import routes
