from app import create_app, db
from app.models import Role, Permissions, ServiceCategory, Service, User
from werkzeug.security import generate_password_hash

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
    admin_user = User(
        user_name="Eammon Kiprotich",
        user_phone_number="123456789",
        user_address="Nyeri Kenya",
        user_email="craizytech@gmail.com",
        role_id=admin_role.role_id,
        user_password=generate_password_hash("testpassword"),
        user_location="Nyeri Kenya",
        user_profile_picture="base64 image encoded"
    )

    plumber_user = User(
        user_name="John Plumber",
        user_phone_number="1256789",
        user_address="Mathari Kenya",
        user_email="johnplumber@gmail.com",
        role_id=specialized_role.role_id,
        user_password=generate_password_hash("testpassword"),
        user_location="Nyeri Kenya",
        user_profile_picture="base64 image encoded"
    )

    electrician_user = User(
        user_name="John Electrician",
        user_phone_number="1256789",
        user_address="Mathari Kenya",
        user_email="johnelectrician@gmail.com",
        role_id=specialized_role.role_id,
        user_password=generate_password_hash("testpassword"),
        user_location="Nyeri Kenya",
        user_profile_picture="base64 image encoded"
    )

    mason_user = User(
        user_name="John Mason",
        user_phone_number="1256789",
        user_address="Mathari Kenya",
        user_email="johnmason@gmail.com",
        role_id=specialized_role.role_id,
        user_password=generate_password_hash("testpassword"),
        user_location="Nyeri Kenya",
        user_profile_picture="base64 image encoded"
    )

    cleaner_user = User(
        user_name="John Cleaner",
        user_phone_number="1256789",
        user_address="Mathari Kenya",
        user_email="johncleaner@gmail.com",
        role_id=specialized_role.role_id,
        user_password=generate_password_hash("testpassword"),
        user_location="Nyeri Kenya",
        user_profile_picture="base64 image encoded"
    )

    general_user = User(
        user_name="Jane Doe",
        user_phone_number="56789212",
        user_address="Kimathi Kenya",
        user_email="janedoe@gmail.com",
        role_id=general_role.role_id,
        user_password=generate_password_hash("testpassword"),
        user_location="Nyeri Kenya",
        user_profile_picture="base64 image encoded"
    )

    db.session.add_all([admin_user, plumber_user, electrician_user, mason_user, cleaner_user, general_user])
    db.session.commit()

    # Create service categories
    electrical_category = ServiceCategory(category_name="Electrical")
    plumbing_category = ServiceCategory(category_name="Plumbing")
    cleaning_category = ServiceCategory(category_name="Cleaning")
    masonry_category = ServiceCategory(category_name="Masonry")

    db.session.add_all([electrical_category, plumbing_category, cleaning_category, masonry_category])
    db.session.commit()

    # Create services
    home_cleaning = Service(
        service_name="Home Cleaning",
        service_description="Cleaning the whole house exclusive of the compound",
        category_id=cleaning_category.category_id,
        provider_id=cleaner_user.user_id
    )

    laundry_cleaning = Service(
        service_name="Laundry Cleaning",
        service_description="Cleaning clothes and beddings",
        category_id=cleaning_category.category_id,
        provider_id=cleaner_user.user_id
    )

    electric_installation = Service(
        service_name="Electric Installation",
        service_description="Installing electricity at your home",
        category_id=electrical_category.category_id,
        provider_id=electrician_user.user_id
    )

    pipe_repairs = Service(
        service_name="Pipe Repairs",
        service_description="Fixing broken or clogged pipes",
        category_id=plumbing_category.category_id,
        provider_id=plumber_user.user_id
    )

    broken_furniture = Service(
        service_name="Broken Furniture",
        service_description="Fixing broken furniture anything from tables, chairs to beds",
        category_id=masonry_category.category_id,
        provider_id=mason_user.user_id
    )

    db.session.add_all([home_cleaning, laundry_cleaning, electric_installation, pipe_repairs, broken_furniture])
    db.session.commit()

    print("Database seeded successfully!")
