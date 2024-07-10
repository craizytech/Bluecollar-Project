from flask import Blueprint

categories_bp = Blueprint('categories', __name__)


from .routes import categories_bp

def register_categories_blueprint(app):
    app.register_blueprint(categories_bp)

def register_categories_blueprint(app):
    app.register_blueprint(categories_bp)