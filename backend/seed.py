from app import create_app, db
from app.models import Role, Permissions, ServiceCategory, Service, User, Chat, Invoice, Booking, Review, ServiceProviderApplication, Transaction
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

    # Create test users
    admin_user = User(
        user_name="Test Admin",
        user_phone_number="0712345678",
        user_address="Nairobi, Kenya",
        user_email="testadmin@example.com",
        role_id=admin_role.role_id,
        user_password=generate_password_hash("password"),
        user_location="Nairobi",
        user_profile_picture="admin_profile_pic.png"
    )

    general_users = []
    for i in range(1, 4):
        general_users.append(User(
            user_name=f"Test User {i}",
            user_phone_number=f"071234567{i}",
            user_address=f"Nairobi, Kenya",
            user_email=f"testuser{i}@example.com",
            role_id=general_role.role_id,
            user_password=generate_password_hash("password"),
            user_location="Nairobi",
            user_profile_picture=f"user{i}_profile_pic.png"
        ))

    service_providers = []
    counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Machakos', 'Nyeri', 'Meru', 'Kakamega']
    
    service_provider_data = [
        {"name": "Plumber", "category": "Plumbing", "services": ["Pipe Repairs", "Leak Detection", "Water Heater Installation", "Drain Cleaning", "Toilet Installation", "Faucet Replacement", "Shower Installation", "Bathroom Renovation", "Sewer Line Repair", "Water Softener Installation"]},
        {"name": "Electrician", "category": "Electrical", "services": ["Electric Installation", "Wiring", "Circuit Breaker Installation", "Lighting Installation", "Generator Installation", "Electrical Troubleshooting", "Ceiling Fan Installation", "Appliance Wiring", "Surge Protection", "Outdoor Lighting"]},
        {"name": "Cleaner", "category": "Cleaning", "services": ["Home Cleaning", "Laundry", "Car Cleaning", "Office Cleaning", "Carpet Cleaning", "Window Cleaning", "Post-construction Cleaning", "Move-in/Move-out Cleaning", "Tile and Grout Cleaning", "Upholstery Cleaning"]},
        {"name": "Mason", "category": "Masonry", "services": ["Bricklaying", "Stone Masonry", "Concrete Work", "Tile Installation", "Foundation Repair", "Chimney Repair", "Patio Construction", "Retaining Wall Construction", "Fireplace Construction", "Concrete Finishing"]}
    ]
    
    for provider in service_provider_data:
        for i in range(1, 11):
            county = counties[i % len(counties)]
            user = User(
                user_name=f"{provider['name']} {i}",
                user_phone_number=f"072345678{i}",
                user_address=f"{county}, Kenya",
                user_email=f"{provider['name'].lower()}{i}@example.com",
                role_id=specialized_role.role_id,
                user_password=generate_password_hash("password"),
                user_location=county,
                user_profile_picture=f"{provider['name'].lower()}{i}_profile_pic.png"
            )
            service_providers.append(user)
            db.session.add(user)
    
    db.session.add_all([admin_user] + general_users + service_providers)
    db.session.commit()

    # Create service categories
    categories = []
    for provider in service_provider_data:
        category = ServiceCategory(category_name=provider["category"], date_of_creation=datetime.utcnow())
        categories.append(category)
        db.session.add(category)
    
    db.session.commit()

    # Create services
    for provider in service_provider_data:
        category = next((c for c in categories if c.category_name == provider["category"]), None)
        if category:
            for i, service_name in enumerate(provider["services"]):
                service = Service(
                    service_name=service_name,
                    service_description=f"{service_name} services provided by experienced {provider['name'].lower()}s.",
                    category_id=category.category_id,
                    provider_id=service_providers[i].user_id
                )
                db.session.add(service)
    
    db.session.commit()

    # Simulate interactions (chats, bookings, invoices, reviews, transactions)
    def simulate_interactions(user, provider, service):
        # Create a chat
        chat = Chat(
            sent_from=user.user_id,
            sent_to=provider.user_id,
            message=f"Hello {provider.user_name}, I am interested in your {service.service_name} service.",
            status="read",
            date_of_creation=datetime.utcnow()
        )
        db.session.add(chat)

        # Create a booking
        booking = Booking(
            service_id=service.service_id,
            client_id=user.user_id,
            provider_id=provider.user_id,
            booking_date=date.today(),
            status="confirmed",
            location=user.user_location,
            description=f"Please provide the {service.service_name} at my location."
        )
        db.session.add(booking)
        db.session.commit()

        # Create an invoice
        invoice = Invoice(
            user_id=user.user_id,
            service_cost=random.uniform(1000, 5000),
            booking_id=booking.booking_id,
            status="pending",
            date_of_creation=datetime.utcnow()
        )
        db.session.add(invoice)
        db.session.commit()

        # Create a transaction
        transaction = Transaction(
            payer_name=user.user_name,
            payer_phone_number=user.user_phone_number,
            amount_paid=invoice.service_cost,
            status="completed",
            invoice_id=invoice.invoice_id,
            date_of_transaction=datetime.utcnow()
        )
        db.session.add(transaction)

        # Create multiple reviews for each service
        for _ in range(5):
            review = Review(
                service_id=service.service_id,
                client_id=user.user_id,
                provider_id=provider.user_id,
                rating=random.randint(1, 5),
                comment=random.choice([
                    f"Excellent {service.service_name} by {provider.user_name}. Highly recommended!",
                    f"{service.service_name} by {provider.user_name} was okay, but could be improved.",
                    f"Terrible experience with {provider.user_name}. The {service.service_name} was unsatisfactory.",
                    f"{service.service_name} provided by {provider.user_name} was good, but not the best.",
                    f"Outstanding {service.service_name} service from {provider.user_name}. Will use again!"
                ]),
                date_of_creation=datetime.utcnow()
            )
            db.session.add(review)

    for i, user in enumerate(general_users):
        provider = service_providers[i]
        service = next((s for s in provider.services_provided), None)
        if service:
            simulate_interactions(user, provider, service)
    
    db.session.commit()

    print("Database fully seeded with users, services, and interactions!")
