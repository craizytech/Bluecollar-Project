from flask import Blueprint

locations = Blueprint('locations', __name__)

from . import routes
