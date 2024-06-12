from flask import Flask
from app.extensions import db, migrate
from app.main.routes import main
from app.auth.routes import auth
from app.users.routes import users
from app.services.routes import services
from app.chats.routes import chats
from app.invoices.routes import invoices
from app.bookings.routes import bookings
from app.locations.routes import locations
from app.reviews.routes import reviews

def create_app(config_class='config.Config'):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    app.register_blueprint(main)
    app.register_blueprint(auth, url_prefix='/auth')
    app.register_blueprint(users, url_prefix='/users')
    app.register_blueprint(services, url_prefix='/services')
    app.register_blueprint(chats, url_prefix='/chats')
    app.register_blueprint(invoices, url_prefix='/invoices')
    app.register_blueprint(bookings, url_prefix='/bookings')
    app.register_blueprint(locations, url_prefix='/locations')
    app.register_blueprint(reviews, url_prefix='/reviews')

    return app
