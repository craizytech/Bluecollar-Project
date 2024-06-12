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
    app.register_blueprint(auth)
    app.register_blueprint(users)
    app.register_blueprint(services)
    app.register_blueprint(chats)
    app.register_blueprint(invoices)
    app.register_blueprint(bookings)
    app.register_blueprint(locations)
    app.register_blueprint(reviews)

    return app
