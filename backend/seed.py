import random
from app import create_app, db
from app.models import Role, Permissions, ServiceCategory, Service, User, Chat, Invoice, Booking, Review, ServiceProviderApplication, Transaction
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
from random import randint, uniform, choice
import re

app = create_app()

def location_in_nairobi():
    latitude = round(uniform(-1.2921, -1.2925), 6)
    longitude = round(uniform(36.8219, 36.8274), 6)
    return f"{latitude}, {longitude}"

def location_in_kiambu():
    latitude = round(uniform(-1.1833, -1.1245), 6)
    longitude = round(uniform(36.5667, 37.0667), 6)
    return f"{latitude}, {longitude}"

def location_in_nyeri():
    latitude = round(uniform(-0.4273, -0.4339), 6)
    longitude = round(uniform(36.9519, 36.9794), 6)
    return f"{latitude}, {longitude}"

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

    # Create roles and assign permissions (unchanged)
    admin_role = Role(role_name='Admin', permissions=(Permissions.REGISTER_LOGIN | Permissions.SEARCH_SERVICE | Permissions.CHAT |
                                                      Permissions.BOOK_SERVICE | Permissions.CANCEL_BOOKING | Permissions.VIEW_BOOKINGS |
                                                      Permissions.PAY_SERVICE | Permissions.ACCEPT_BOOKING_REQUESTS | Permissions.DECLINE_BOOKING_REQUESTS |
                                                      Permissions.GENERATE_INVOICE | Permissions.ADD_USERS | Permissions.REMOVE_USER |
                                                      Permissions.MEDIATE | Permissions.APPROVE_SPECIALIZED_USERS))
    
    specialized_role = Role(role_name='Specialized User', permissions=(Permissions.REGISTER_LOGIN | Permissions.SEARCH_SERVICE | Permissions.CHAT |
                                                                      Permissions.BOOK_SERVICE | Permissions.CANCEL_BOOKING | Permissions.VIEW_BOOKINGS |
                                                                      Permissions.PAY_SERVICE | Permissions.ACCEPT_BOOKING_REQUESTS | Permissions.DECLINE_BOOKING_REQUESTS |
                                                                      Permissions.GENERATE_INVOICE))

    general_role = Role(role_name='General User', permissions=(Permissions.REGISTER_LOGIN | Permissions.SEARCH_SERVICE | Permissions.CHAT |
                                                              Permissions.BOOK_SERVICE | Permissions.CANCEL_BOOKING | Permissions.VIEW_BOOKINGS |
                                                              Permissions.PAY_SERVICE))

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
        user_location=location_in_nairobi(),
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
            user_location=location_in_nairobi() if i % 2 == 0 else location_in_nyeri(),
            user_profile_picture=f"user{i}_profile_pic.png"
        ))

    service_providers = []
    counties = ['Nairobi Kenya', 'Kiambu Kenya', 'Nyeri Kenya']

    service_provider_data = [
    {"name": "Plumber", "category": "Plumbing", "services": [
        "Pipe Repairs", "Leak Detection", "Water Heater Installation", "Drain Cleaning", "Toilet Installation", 
        "Faucet Replacement", "Shower Installation", "Bathroom Renovation", "Sewer Line Repair", "Water Softener Installation",
        "Water Filtration System Installation", "Pipe Insulation", "Gas Pipe Installation", "Bathtub Installation", "Emergency Plumbing"
    ]},
    {"name": "Electrician", "category": "Electrical", "services": [
        "Electric Installation", "Wiring", "Circuit Breaker Installation", "Lighting Installation", "Generator Installation", 
        "Electrical Troubleshooting", "Ceiling Fan Installation", "Appliance Wiring", "Surge Protection", "Outdoor Lighting",
        "Smart Home System Installation", "Electric Vehicle Charging Station Installation", "Rewiring Services", "Electrical Safety Inspections", "Electrical Panel Upgrade"
    ]},
    {"name": "Cleaner", "category": "Cleaning", "services": [
        "Home Cleaning", "Laundry", "Car Cleaning", "Office Cleaning", "Carpet Cleaning", "Window Cleaning", 
        "Post-construction Cleaning", "Move-in/Move-out Cleaning", "Tile and Grout Cleaning", "Upholstery Cleaning",
        "Pressure Washing", "Floor Polishing", "Air Duct Cleaning", "Deep Kitchen Cleaning", "Green Cleaning Services"
    ]},
    {"name": "Mason", "category": "Masonry", "services": [
        "Bricklaying", "Stone Masonry", "Concrete Work", "Tile Installation", "Foundation Repair", "Chimney Repair", 
        "Patio Construction", "Retaining Wall Construction", "Fireplace Construction", "Concrete Finishing",
        "Stone Wall Construction", "Brick Paving", "Mortar Repair", "Structural Repair", "Masonry Waterproofing"
    ]}
    ]

    for provider in service_provider_data:
        for i in range(1, 16):
            county = counties[i % len(counties)]
            if county == 'Nairobi Kenya':
                location = location_in_nairobi()
            elif county == 'Kiambu Kenya':
                location = location_in_kiambu()
            else:
                location = location_in_nyeri()

            user = User(
                user_name=f"{provider['name']} {i}",
                user_phone_number=f"072345678{i}",
                user_address=f"{county}",
                user_email=f"{provider['name'].lower()}{i}@example.com",
                role_id=specialized_role.role_id,
                user_password=generate_password_hash("password"),
                user_location=location,
                user_profile_picture=f"{provider['name'].lower()}{i}_profile_pic.png"
            )
            service_providers.append(user)
            db.session.add(user)

    db.session.add_all([admin_user] + general_users + service_providers)
    db.session.commit()

    # Create service categories (unchanged)
    categories = []
    for provider in service_provider_data:
        category = ServiceCategory(category_name=provider["category"], date_of_creation=datetime.utcnow())
        categories.append(category)
        db.session.add(category)

    db.session.commit()

    # Create services (unchanged)
    for provider in service_provider_data:
        print(f"Looking for category: {provider['category']}")
        category = next((c for c in categories if c.category_name == provider["category"]), None)
        if category:
            matching_providers = [p for p in service_providers if re.match(f"(?i)^{provider['name']}\s\d+$", p.user_name)]
            if matching_providers:
                provider_index = 0
            for service_name in provider["services"]:
                print(f"Looking for provider: {provider['name']}")
                correct_provider = matching_providers[provider_index]
                print(f"Found provider: {correct_provider.user_name}")
                if correct_provider:
                    print(f"Found provider: {correct_provider.user_name}")
                    service = Service(
                        service_name=service_name,
                        service_description=f"{service_name} services provided by experienced {provider['name'].lower()}s.",
                        category_id=category.category_id,
                        provider_id=correct_provider.user_id,
                        service_duration=randint(60, 600)
                    )
                    print(f"Adding service {service_name} with category_id={category.category_id} and provider_id={correct_provider.user_id}")
                    print(f"Creating service: {service_name} for provider: {correct_provider.user_name}")
                    db.session.add(service)
                    
                    provider_index = (provider_index + 1) % len(matching_providers)
                else:
                    print(f"No matching providers found for {provider['category']}")
                    
    try:
        db.session.commit()
        print(f"Committed {len(service_provider_data)} services to the database.")
    except Exception as e:
        print(f"Error committing to database: {e}")

    # Simulate interactions (unchanged)
    def simulate_interactions(user, provider, service):
        if random.choice([True, False]):
            if service.provider_id == provider.user_id:
                # Create a chat (unchanged)
                chat = Chat(
                    sent_from=user.user_id,
                    sent_to=provider.user_id,
                    message=f"Hello {provider.user_name}, I am interested in your {service.service_name} service.",
                    status="read",
                    date_of_creation=datetime.utcnow()
                )
                db.session.add(chat)

                # Create a booking (unchanged)
                booking = Booking(
                    service_id=service.service_id,
                    client_id=user.user_id,
                    provider_id=provider.user_id,
                    booking_date=datetime.now().date(),
                    start_time=datetime.now().time(),  # Use current datetime as placeholder
                    end_time=(datetime.now() + timedelta(hours=1)).time(),  # 1 hour later as placeholder
                    status='pending',
                    location=user.user_location,
                    description=f"Please provide the {service.service_name} at my location."
                )
                db.session.add(booking)
                db.session.commit()

                # Create an invoice (unchanged)
                invoice = None
                if random.choice([True, False]):
                    invoice = Invoice(
                        user_id=user.user_id,
                        service_cost=random.uniform(1000, 5000),
                        booking_id=booking.booking_id,
                        status="pending",
                        date_of_creation=datetime.utcnow()
                    )
                if invoice:
                    db.session.add(invoice)
                    db.session.commit()

                # Create a transaction (unchanged)
                if invoice:
                    transaction = Transaction(
                        payer_name=user.user_name,
                        payer_phone_number=user.user_phone_number,
                        amount_paid=invoice.service_cost,
                        status="completed",
                        invoice_id=invoice.invoice_id,
                        date_of_transaction=datetime.utcnow()
                    )
                    db.session.add(transaction)

                # Create multiple reviews for each service (unchanged)
                review=None
                if random.choice([True, False]):
                    review = Review(
                        service_id=service.service_id,
                        client_id=random.choice(general_users).user_id,
                        provider_id=provider.user_id,
                        rating=random.randint(1, 5),
                        comment=random.choice([
                            f"Excellent service. Highly recommended!",
                            f"The service was okay, but could be improved.",
                            f"Terrible experience. The service was subpar.",
                            f"Wouldn't recommend"
                        ]),
                        date_of_creation=datetime.utcnow()
                    )
                    if 'review' in locals() and review:
                        db.session.add(review)
                        db.session.commit()
            
    # Call simulate_interactions (unchanged)
    for user in random.sample(general_users, k=min(len(general_users), 5)):  # Limit to 2 random general users
        for provider in random.sample(service_providers, k=min(len(service_providers), 15)):  # Limit to 3 random providers
            for service in random.sample(db.session.query(Service).all(), k=20):  # Limit to 5 random services
                simulate_interactions(user, provider, service)

    db.session.commit()

    print("Populated the database with sample data.")
