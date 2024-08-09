from app import create_app, db
from app.models import Role, Permissions, ServiceCategory, Service, User, Chat, Booking, Invoice, Review, ServiceProviderApplication, Transaction
from werkzeug.security import generate_password_hash
from datetime import datetime, date
import random

app = create_app()

with app.app_context():
    db.create_all()

    # Create roles and assign permissions
    admin_role = Role(role_name='Admin', permissions=(
        Permissions.REGISTER_LOGIN | Permissions.SEARCH_SERVICE | Permissions.CHAT |
        Permissions.BOOK_SERVICE | Permissions.CANCEL_BOOKING | Permissions.VIEW_BOOKINGS |
        Permissions.PAY_SERVICE | Permissions.ACCEPT_BOOKING_REQUESTS | Permissions.DECLINE_BOOKING_REQUESTS |
        Permissions.GENERATE_INVOICE | Permissions.ADD_USERS | Permissions.REMOVE_USER |
        Permissions.MEDIATE | Permissions.APPROVE_SPECIALIZED_USERS
    ))

    specialized_role = Role(role_name='Specialized User', permissions=(
        Permissions.REGISTER_LOGIN | Permissions.SEARCH_SERVICE | Permissions.CHAT |
        Permissions.BOOK_SERVICE | Permissions.CANCEL_BOOKING | Permissions.VIEW_BOOKINGS |
        Permissions.PAY_SERVICE | Permissions.ACCEPT_BOOKING_REQUESTS | Permissions.DECLINE_BOOKING_REQUESTS |
        Permissions.GENERATE_INVOICE
    ))

    general_role = Role(role_name='General User', permissions=(
        Permissions.REGISTER_LOGIN | Permissions.SEARCH_SERVICE | Permissions.CHAT |
        Permissions.BOOK_SERVICE | Permissions.CANCEL_BOOKING | Permissions.VIEW_BOOKINGS |
        Permissions.PAY_SERVICE
    ))

    db.session.add_all([admin_role, specialized_role, general_role])
    db.session.commit()

    # Create users
    def create_user(user_name, user_phone_number, user_address, user_email, role_id, user_location):
        return User(
            user_name=user_name,
            user_phone_number=user_phone_number,
            user_address=user_address,
            user_email=user_email,
            role_id=role_id,
            user_password=generate_password_hash("password"),
            user_location=user_location,
            user_profile_picture="base64_image_encoded"
        )

    admin_user = create_user("testadmin", "0700000000", "Nairobi", "testadmin@example.com", admin_role.role_id, "Nairobi, Kenya")
    general_user1 = create_user("testuser1", "0711111111", "Mombasa", "testuser1@example.com", general_role.role_id, "Mombasa, Kenya")
    general_user2 = create_user("testuser2", "0722222222", "Kisumu", "testuser2@example.com", general_role.role_id, "Kisumu, Kenya")
    general_user3 = create_user("testuser3", "0733333333", "Nakuru", "testuser3@example.com", general_role.role_id, "Nakuru, Kenya")

    service_providers = []
    counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Nyeri", "Meru", "Embu", "Eldoret", "Garissa", "Kitale"]

    for county in counties:
        for i in range(1, 11):  # Create 10 service providers for each category
            service_providers.append(create_user(f"provider_{county}_{i}", f"07{i}0000000", county, f"provider_{county}_{i}@example.com", specialized_role.role_id, county))

    db.session.add_all([admin_user, general_user1, general_user2, general_user3] + service_providers)
    db.session.commit()

    # Create service categories
    electrical_category = ServiceCategory(category_name="Electrical", date_of_creation=datetime.utcnow())
    plumbing_category = ServiceCategory(category_name="Plumbing", date_of_creation=datetime.utcnow())
    cleaning_category = ServiceCategory(category_name="Cleaning", date_of_creation=datetime.utcnow())
    masonry_category = ServiceCategory(category_name="Masonry", date_of_creation=datetime.utcnow())

    db.session.add_all([electrical_category, plumbing_category, cleaning_category, masonry_category])
    db.session.commit()

    # Create services and assign to providers
    def create_service(service_name, service_description, category, provider):
        return Service(
            service_name=service_name,
            service_description=service_description,
            category_id=category.category_id,
            provider_id=provider.user_id
        )

    services = []

    for i in range(10):
        services.append(create_service("Electric Installation", "Installing electricity at your home", electrical_category, service_providers[i]))
        services.append(create_service("Pipe Repairs", "Fixing broken or clogged pipes", plumbing_category, service_providers[i + 10]))
        services.append(create_service("Home Cleaning", "Cleaning the whole house", cleaning_category, service_providers[i + 20]))
        services.append(create_service("Wall Painting", "Painting interior and exterior walls", masonry_category, service_providers[i + 30]))

    db.session.add_all(services)
    db.session.commit()

    # Simulate interactions
    def create_chat(sender, receiver, message):
        return Chat(
            sent_from=sender.user_id,
            sent_to=receiver.user_id,
            message=message,
            status='sent'
        )

    def create_booking(service, client, provider, location):
        return Booking(
            service_id=service.service_id,
            client_id=client.user_id,
            provider_id=provider.user_id,
            booking_date=date.today(),
            status='completed',
            location=location,
            description=f"Booking for {service.service_name} in {location}"
        )

    def create_invoice(booking, service_cost):
        return Invoice(
            user_id=booking.client_id,
            service_cost=service_cost,
            booking_id=booking.booking_id,
            status='paid'
        )

    def create_transaction(invoice, payer_name, payer_phone_number, amount_paid):
        return Transaction(
            payer_name=payer_name,
            payer_phone_number=payer_phone_number,
            amount_paid=amount_paid,
            status='completed',
            invoice_id=invoice.invoice_id
        )

    def create_review(service, client, provider, rating, comment):
        return Review(
            service_id=service.service_id,
            client_id=client.user_id,
            provider_id=provider.user_id,
            rating=rating,
            comment=comment
        )

    # Generate chats, bookings, invoices, transactions, and reviews
    for i in range(3):
        for service in services:
            chat = create_chat(general_user1, service.provider, "Hello, I need this service.")
            booking = create_booking(service, general_user1, service.provider, "Nairobi, Kenya")
            invoice = create_invoice(booking, random.uniform(50, 500))
            transaction = create_transaction(invoice, general_user1.user_name, general_user1.user_phone_number, invoice.service_cost)
            review = create_review(service, general_user1, service.provider, random.randint(1, 5), "Good service")

            db.session.add_all([chat, booking, invoice, transaction, review])

    # Create a service provider application
    application = ServiceProviderApplication(
        email=general_user2.user_email,
        service_category_id=plumbing_category.category_id,
        service_id=services[10].service_id,  # Assuming the first plumbing service
        status='pending'
    )

    db.session.add(application)
    db.session.commit()

    print("Database seeded successfully!")
