from app import create_app, db
from app.models import Role, Permissions

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
    
    # Creating Categories and services
    
    db.session.add(admin_role)
    db.session.add(specialized_role)
    db.session.add(general_role)
    db.session.commit()
