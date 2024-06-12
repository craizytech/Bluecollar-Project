from flask import Blueprint

invoices = Blueprint('invoices', __name__)

from . import routes