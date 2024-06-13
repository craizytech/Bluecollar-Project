import os
from dotenv import load_dotenv

from flask import Flask
from app.extensions import db, migrate, cors
from app.config import config

def create_app(config_name='default'):
    load_dotenv()  # Load environment variables from .env file

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)  # Enable CORS for the app

    # Register blueprints with /api prefix
    from app.auth import auth_bp
    from app.users import users_bp
    from app.main import main_bp
    from app.services import services_bp
    from app.chats import chats_bp
    from app.invoices import invoices_bp
    from app.bookings import bookings_bp
    from app.locations import locations_bp
    from app.reviews import reviews_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(main_bp, url_prefix='/api/main')
    app.register_blueprint(services_bp, url_prefix='/api/services')
    app.register_blueprint(chats_bp, url_prefix='/api/chats')
    app.register_blueprint(invoices_bp, url_prefix='/api/invoices')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(locations_bp, url_prefix='/api/locations')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')

    return app