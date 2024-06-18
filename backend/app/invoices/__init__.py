from flask import Blueprint

invoices_bp = Blueprint('invoices', __name__)

from app.invoices.routes import *