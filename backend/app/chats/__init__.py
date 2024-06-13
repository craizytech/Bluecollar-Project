from flask import Blueprint

chats_bp = Blueprint('chats', __name__)

from . import routes