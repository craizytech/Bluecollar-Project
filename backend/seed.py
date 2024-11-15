from app import create_app, db
from app.models import Role, Permissions, ServiceCategory, Service, User, Chat, Invoice, Booking, Review, ServiceProviderApplication, Transaction
from werkzeug.security import generate_password_hash
from datetime import datetime, date, time
from random import randint
import random

app = create_app()

with app.app_context():
    db.session.query(Chat).delete()
    db.session.query(Transaction).delete()
    db.session.query(Review).delete()
    db.session.query(Invoice).delete()
    db.session.query(Booking).delete()
    db.session.query(Service).delete()
    db.session.query(ServiceCategory).delete()
    db.session.query(User).delete()
    db.session.query(Role).delete()
    db.session.commit()
    print("Cleared data in all tables.")

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

    # Define a helper function for random latitude and longitude
    def generate_random_coordinates():
        # These coordinates are for Kenya, adjust as needed for other locations
        latitude = random.uniform(-4.6, 4.5)   # Random latitude within Kenya's approximate bounds
        longitude = random.uniform(33.9, 41.9) # Random longitude within Kenya's approximate bounds
        return latitude, longitude

    # Create test users
    admin_user = User(
        user_name="Test Admin",
        user_phone_number="0712345678",
        user_address="Nairobi, Kenya",
        user_email="testadmin@example.com",
        role_id=admin_role.role_id,
        user_password=generate_password_hash("password"),
        user_location="Nairobi Kenya",
        user_profile_picture="admin_profile_pic.png",
        latitude= -1.286389,
        longitude=36.817223
    )

    general_users = []
    for i in range(1, 4):
        lat, lon = generate_random_coordinates()
        general_users.append(User(
            user_name=f"Test User {i}",
            user_phone_number=f"071234567{i}",
            user_address="Nairobi, Kenya",
            user_email=f"testuser{i}@example.com",
            role_id=general_role.role_id,
            user_password=generate_password_hash("password"),
            user_location="Nairobi Kenya",
            user_profile_picture=f"user{i}_profile_pic.png",
            latitude=lat,
            longitude=lon
        ))

    service_providers = []
    counties = [
        ('Nairobi Kenya', -1.286389, 36.817223),
        ('Mombasa Kenya', -4.043477, 39.668206),
        ('Kisumu Kenya', -0.091702, 34.767956),
        ('Nakuru Kenya', -0.303099, 36.080026),
        ('Eldoret Kenya', 0.520360, 35.269779),
        ('Thika Kenya', -1.03326, 37.06933),
        ('Machakos Kenya', -1.518024, 37.26343),
        ('Nyeri Kenya', -0.427780, 36.959980),
        ('Meru Kenya', 0.047035, 37.649803),
        ('Kakamega Kenya', 0.282730, 34.752058)
    ]
    
    service_provider_data = [
        {"name": "Plumber", "category": "Plumbing", "services": ["Pipe Repairs", "Leak Detection", "Water Heater Installation", "Drain Cleaning", "Toilet Installation", "Faucet Replacement", "Shower Installation", "Bathroom Renovation", "Sewer Line Repair", "Water Softener Installation"]},
        {"name": "Electrician", "category": "Electrical", "services": ["Electric Installation", "Wiring", "Circuit Breaker Installation", "Lighting Installation", "Generator Installation", "Electrical Troubleshooting", "Ceiling Fan Installation", "Appliance Wiring", "Surge Protection", "Outdoor Lighting"]},
        {"name": "Cleaner", "category": "Cleaning", "services": ["Home Cleaning", "Laundry", "Car Cleaning", "Office Cleaning", "Carpet Cleaning", "Window Cleaning", "Post-construction Cleaning", "Move-in/Move-out Cleaning", "Tile and Grout Cleaning", "Upholstery Cleaning"]},
        {"name": "Mason", "category": "Masonry", "services": ["Bricklaying", "Stone Masonry", "Concrete Work", "Tile Installation", "Foundation Repair", "Chimney Repair", "Patio Construction", "Retaining Wall Construction", "Fireplace Construction", "Concrete Finishing"]}
    ]
    
    for provider in service_provider_data:
        for i in range(1, 11):
            county, lat, lon = counties[i % len(counties)]
            user = User(
                user_name=f"{provider['name']} {i}",
                user_phone_number=f"072345678{i}",
                user_address=f"{county}",
                user_email=f"{provider['name'].lower()}{i}@example.com",
                role_id=specialized_role.role_id,
                user_password=generate_password_hash("password"),
                user_location=county,
                user_profile_picture=f"{provider['name'].lower()}{i}_profile_pic.png",
                latitude=lat,
                longitude=lon
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
                    provider_id=service_providers[i].user_id,
                    service_duration=randint(60, 600)
                )
                db.session.add(service)
    
    db.session.commit()

    # Simulate interactions (chats, bookings, invoices, reviews, transactions)
    def simulate_interactions(user, provider, service):
        start_time = time(10, 0)  # 10:00 AM
        end_time = time(12, 0)
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
            start_time = start_time,
            end_time = end_time,
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
                comment=random.choice(["Great service!", "Very satisfied.", "Could be better.", "Highly recommended!"]),
                date_of_creation=datetime.utcnow()
            )
            db.session.add(review)

        db.session.commit()

    for user in general_users:
        for provider in service_providers[:4]:  # Limit interactions to the first four providers
            service = db.session.query(Service).filter_by(provider_id=provider.user_id).order_by(db.func.random()).first()
            if service:
                simulate_interactions(user, provider, service)

    print("Seeding complete.")
