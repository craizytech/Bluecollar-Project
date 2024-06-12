from flask import Blueprint

bookings = Blueprint('bookings', __name__)

from . import routes
