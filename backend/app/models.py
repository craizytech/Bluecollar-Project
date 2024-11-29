from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
import re

class Permissions:
    # All users
    REGISTER_LOGIN = 0b000000000000001  # Register
    SEARCH_SERVICE = 0b000000000000010  # Search for service
    CHAT = 0b000000000000100  # Chat with other users
    BOOK_SERVICE = 0b000000000001000  # Book a service
    CANCEL_BOOKING = 0b000000000010000  # Cancel a booking
    VIEW_BOOKINGS = 0b000000000100000  # View bookings
    PAY_SERVICE = 0b000000001000000  # Pay for service

    # Specialized user (does all of the above)
    ACCEPT_BOOKING_REQUESTS = 0b000000010000000  # Accept a booking
    DECLINE_BOOKING_REQUESTS = 0b000000100000000  # Decline a booking
    GENERATE_INVOICE = 0b000001000000000  # User generates an invoice
    
    # Admin user (does all of the above)
    ADD_USERS = 0b000010000000000  # Add users
    REMOVE_USER = 0b000100000000000  # Delete a user
    MEDIATE = 0b001000000000000  # Mediates the users
    APPROVE_SPECIALIZED_USERS = 0b010000000000000  # Approves the service providers

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    notification_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE',  name='fk_notifications_user_id'), nullable=False)
    message = db.Column(db.String(256), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='user_notifications', lazy=True)
    
class Role(db.Model):
    __tablename__ = 'roles'
    role_id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(64), nullable=False)
    permissions = db.Column(db.Integer, default=0)

    users = db.relationship('User', backref='role', lazy="dynamic")

class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(64), nullable=False)
    user_phone_number = db.Column(db.String(20), nullable=False)
    user_address = db.Column(db.String(128), nullable=False)
    user_email = db.Column(db.String(128), unique=True, nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.role_id'), nullable=False)
    date_of_creation = db.Column(db.DateTime, default=datetime.utcnow)
    user_password = db.Column(db.String(128), nullable=False)
    user_location = db.Column(db.String(256), nullable=False)
    user_profile_picture = db.Column(db.String(256), nullable=False)
    
    # One-to-Many relationships
    sent_chats = db.relationship('Chat', foreign_keys='Chat.sent_from', backref='sender', lazy=True)
    received_chats = db.relationship('Chat', foreign_keys='Chat.sent_to', backref='receiver', lazy=True)
    client_bookings = db.relationship('Booking', foreign_keys='Booking.client_id', backref='client', lazy=True)
    provider_bookings = db.relationship('Booking', foreign_keys='Booking.provider_id', backref='provider', lazy=True)
    reviews_written = db.relationship('Review', foreign_keys='Review.client_id', backref='client', lazy=True)
    reviews_received = db.relationship('Review', foreign_keys='Review.provider_id', backref='provider', lazy=True)
    notifications = db.relationship('Notification', backref='user_notifications', lazy=True)
    
    # One-to-Many relationship with Services (as a provider)
    services_provided = db.relationship('Service', backref='provider', lazy=True)
    invoices = db.relationship('Invoice', foreign_keys='Invoice.user_id', backref='user', lazy=True)

    @validates('user_email')
    def validate_email(self, key, address):
        assert '@' in address, "Provided email is not valid"
        return address
    
class ServiceCategory(db.Model):
    __tablename__ = 'service_categories'
    category_id = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String(64), nullable=False)
    date_of_creation = db.Column(db.DateTime, default=datetime.utcnow)
    
    # One-to-Many relationship with Services
    services = db.relationship('Service', backref='category', lazy=True)

class Service(db.Model):
    __tablename__ = 'services'
    service_id = db.Column(db.Integer, primary_key=True)
    service_name = db.Column(db.String(64), nullable=False)
    service_description = db.Column(db.String(256), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('service_categories.category_id'), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    service_duration = db.Column(db.String(50), nullable=True)
    
    # One-to-Many relationships
    bookings = db.relationship('Booking', backref='service', lazy=True)
    reviews = db.relationship('Review', backref='service', lazy=True)

class Chat(db.Model):
    __tablename__ = 'chats'
    chat_id = db.Column(db.Integer, primary_key=True)
    date_of_creation = db.Column(db.DateTime, default=datetime.utcnow)
    sent_from = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    sent_to = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    message = db.Column(db.String(512), nullable=False)
    type = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(20), nullable=False)

class Invoice(db.Model):
    __tablename__ = 'invoices'
    invoice_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    service_cost = db.Column(db.Float, nullable=False)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.booking_id'), nullable=False)
    status = db.Column(db.String(50), default='pending')
    date_of_creation = db.Column(db.DateTime, default=datetime.utcnow)
    
    # One-to-One relationship with Booking
    booking = db.relationship('Booking', back_populates='invoice', uselist=False)

class Booking(db.Model):
    __tablename__ = 'bookings'
    booking_id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.service_id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    booking_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    location = db.Column(db.String(256), nullable=False)
    description = db.Column(db.Text)
    
    # One-to-One relationship with Invoice
    invoice = db.relationship('Invoice', back_populates='booking', uselist=False)

class Review(db.Model):
    __tablename__ = 'reviews'
    review_id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.service_id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.String(512), nullable=True)
    date_of_creation = db.Column(db.DateTime, default=datetime.utcnow)

class ServiceProviderApplication(db.Model):
    __tablename__ = 'service_provider_applications'
    application_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(128), nullable=False)
    service_category_id = db.Column(db.Integer, db.ForeignKey('service_categories.category_id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.service_id'), nullable=False)
    status = db.Column(db.String(20), default='pending')
    date_of_application = db.Column(db.DateTime, default=datetime.utcnow)
    duration = db.Column(db.Integer, nullable=False) 

    # Relationships
    service_category = db.relationship('ServiceCategory', backref=db.backref('applications', lazy=True))
    service = db.relationship('Service', backref=db.backref('applications', lazy=True))

class Transaction(db.Model):
    __tablename__ = 'transactions'
    transaction_id = db.Column(db.Integer, primary_key=True)
    payer_name = db.Column(db.String(128), nullable=False)
    payer_phone_number = db.Column(db.String(20), nullable=False)
    amount_paid = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.invoice_id'), nullable=False)
    date_of_transaction = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    invoice = db.relationship('Invoice', backref=db.backref('transactions', lazy=True))