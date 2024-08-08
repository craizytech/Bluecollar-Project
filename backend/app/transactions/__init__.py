from flask import Blueprint

transactions_bp = Blueprint('transactions', __name__)

from .routes import transactions_bp