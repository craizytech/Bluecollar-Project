from app import create_app, db
from app.models import Role, Permissions, ServiceCategory, Service

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
    
    db.session.add(admin_role)
    db.session.add(specialized_role)
    db.session.add(general_role)
    db.session.commit()

    # Creating Categories and services
    electrical_category = ServiceCategory(category_name="Electrical")
    plumbing_category = ServiceCategory(category_name="Plumbing")
    cleaning_category = ServiceCategory(category_name="Cleaning")
    masonry_category = ServiceCategory(category_name="Masonry")

    db.session.add(electrical_category)
    db.session.add(plumbing_category)
    db.session.add(cleaning_category)
    db.session.add(masonry_category)
    db.session.commit()

    #Creating Services based on the categories
    home_cleaning = Service(service_name="home_cleaning", service_description="Cleaning the whole house exclusive of the compound", category_id=3)
    electric_installation = Service(service_name="Electric installation", service_description="Installing electricity at your home", category_id=1)
    broken_pipes = Service(service_name="Pipe Repairs", service_description="Fixing broken or clogged pipes", category_id=2)
    broken_furniture = Service(service_name="Broken Furniture", service_description="Fixing broken furniture anything from tables, chairs to beds", category_id=4)

    db.session.add(home_cleaning)
    db.session.add(electric_installation)
    db.session.add(broken_pipes)
    db.session.add(broken_pipes)
    db.session.commit()



    db.session.commit()
