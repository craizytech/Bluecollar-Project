from flask import Blueprint

mpesa_bp = Blueprint('mpesa', __name__)

from . import routes