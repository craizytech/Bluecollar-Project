from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)  # Enable CORS for the app

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
