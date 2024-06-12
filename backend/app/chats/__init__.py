from flask import Blueprint

chats = Blueprint('chats', __name__)

from . import routes