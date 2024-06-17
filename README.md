                                BLUECOLLAR PROJECT
Authors: Eammon Kiprotich
         Lennox Kabo
         Praise Waweru
                                PROJECT DESCRIPTION
The Bluecollar Project is a service booking platform that connects clients with service providers. The application allows users to register, search for services, chat with providers, book services, and leave reviews.

Table of Contents
User Types and Roles
Database Schema
Modules
Service Management
Booking Management
Review and Rating System
Installation
Configuration
Database Migration
Running the Application
API Endpoints
Testing with Postman
License
User Types and Roles
Admin Account
Roles:

Controls all the activities of all the users.
Can remove any user.
Can mediate in case users disagree.
Can add or remove a service.
Can perform all actions that other users can do.
Approves specialized users.
Normal User
Roles:

Can create an account and log in.
Can search for a service provider on the app.
Can access the map to find services nearest to them.
Can chat with the service provider, generate an invoice, and pay within the system.
Can book the service provider for the day.
Can cancel a booking.
Can view the bookings they have made.
Specialized User (Service Provider)
Roles:

Can do everything a normal user can do.
Can view their booked appointments.
Can book an appointment with another user providing another service.
Can accept or deny a booking request.
Can generate invoices for payment.
Database Schema
Users Table
user_id (Primary Key)
user_name (String)
user_phone_number (String)
user_address (String)
user_email (String)
role_id (Foreign Key to Roles)
date_of_creation (Date)
user_password (String)
user_location (String)
user_profile_picture (String URL)
Roles Table
role_id (Primary Key)
role_name (String)
Service Category Table
category_id (Primary Key)
category_name (String)
Services Table
service_id (Primary Key)
service_name (String)
service_description (String)
service_category (Foreign Key to Service Category)
Chats Table
chat_id (Primary Key)
date_of_creation (Date)
sent_from (Foreign Key to Users)
sent_to (Foreign Key to Users)
message (String)
status (String, e.g., read/unread)
Invoices Table
invoice_id (Primary Key)
date_of_creation (Date)
service_cost (Float)
booking_id (Foreign Key to Bookings)
Bookings Table
booking_id (Primary Key)
service_id (Foreign Key to Services)
client_id (Foreign Key to Users)
provider_id (Foreign Key to Users)
booking_date (Date)
status (String, e.g., pending/confirmed/completed/declined)
location (String)
Reviews Table
review_id (Primary Key)
service_id (Foreign Key to Services)
client_id (Foreign Key to Users)
provider_id (Foreign Key to Users)
rating (Integer, e.g., 1-5)
comment (String)
date_of_creation (Date)
Permissions Class
All users:
REGISTER_LOGIN = 0b000000000000001
SEARCH_SERVICE = 0b000000000000010
CHAT = 0b000000000000100
BOOK_SERVICE = 0b000000000001000
CANCEL_BOOKING = 0b000000000010000
VIEW_BOOKINGS = 0b000000000100000
PAY_SERVICE = 0b000000001000000
Specialized user (does all of the above):
ACCEPT_BOOKING_REQUESTS = 0b000000010000000
DECLINE_BOOKING_REQUESTS = 0b000000100000000
GENERATE_INVOICE = 0b000001000000000
Admin user (does all of the above):
ADD_USERS = 0b000010000000000
REMOVE_USER = 0b000100000000000
MEDIATE = 0b001000000000000
APPROVE_SPECIALIZED_USERS = 0b010000000000000
Modules
Main Module
Handles general routes and views.
Includes homepage and other static pages.
Folder: app/main/
Auth Module
Handles user authentication (login, registration, password reset).
Folder: app/auth/
Users Module
Manages user profiles, roles, and related functionalities.
Folder: app/users/
Services Module
Manages services offered by the users.
Includes service creation, listing, and management.
Folder: app/services/
Chats Module
Manages chat functionality between users.
Folder: app/chats/
Invoices Module
Handles invoice creation, management, and payment processing.
Folder: app/invoices/
Bookings Module
Manages booking of services.
Includes booking creation, status updates, and cancellations.
Folder: app/bookings/
Locations Module
Handles real-time location updates of service providers.
Folder: app/locations/
Reviews Module
Manages user reviews and ratings for services.
Folder: app/reviews/
Service Management
Routes:
Create a Service
Update a Service
Delete a Service
View Services by Category
View All Services
Booking Management
Routes:
Create a Booking
Update a Booking
Cancel a Booking
View User Bookings
Accept/Decline a Booking (for service providers)
Review and Rating System
Routes:
Write a Review
View Reviews for a Service
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/Bluecollar-Project.git
cd Bluecollar-Project/backend
Create a virtual environment and activate it:

bash
Copy code
python3 -m venv venv
source venv/bin/activate
Install the dependencies:

bash
Copy code
pip install -r requirements.txt
Configuration
Create a .env file in the backend directory and add the following configurations:

makefile
Copy code
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your_secret_key
SQLALCHEMY_DATABASE_URI=sqlite:///instance/app.db
JWT_SECRET_KEY=your_jwt_secret_key
Database Migration
Initialize the database:

bash
Copy code
flask db init
Create migration scripts:

bash
Copy code
flask db migrate -m "Initial migration"
Apply the migrations:

bash
Copy code
flask db upgrade
Running the Application
Run the Flask application:

bash
Copy code
flask run
Access the application:

Open your browser and go to http://127.0.0.1:5000.

API Endpoints
Authentication
Register:

POST /api/auth/register
Request Body:
json
Copy code
{
  "user_name": "testuser",
  "user_email": "test@example.com",
  "user_password": "testpassword",
  "user_phone_number": "1234567890",
  "user_address": "123 Test St",
  "user_location": "Test City",
  "user_profile_picture": "http://example.com/profile.jpg",
  "role_id": 2
}
Login:

POST /api/auth/login
Request Body:
json
Copy code
{
  "user_email": "test@example.com",
  "user_password": "testpassword"
}
Bookings
Create Booking:

POST /api/bookings/create
Request Body:
json
Copy code
{
  "service_id": 1,
  "provider_id": 2,
  "booking_date": "2024-06-20",
  "location": "address"
}
Update Booking:

PUT /api/bookings/<int:booking_id>
Request Body:
json
Copy code
{
  "booking_date": "2024-06-21",
  "location": "new address"
}
Cancel Booking:

DELETE /api/bookings/<int:booking_id>
View User Bookings:

GET /api/bookings/my-bookings
Update Booking Status:

PATCH /api/bookings/<int:booking_id>/status
Request Body:
json
Copy code
{
  "status": "confirmed"
}
Chats
Send Message:

POST /api/chats/send
Request Body:
json
Copy code
{
  "sent_to": 2,
  "message": "Hello"
}
Chat History:

GET /api/chats/history/<int:user_id>
Reviews
Write Review:

POST /api/reviews/write
Request Body:
json
Copy code
{
  "service_id": 1,
  "provider_id": 2,
  "rating": 5,
  "comment": "Excellent service"
}
View Service Reviews:

GET /api/reviews/service/<int:service_id>
View Client Reviews:

GET /api/reviews/client
Update Review:

PUT /api/reviews/<int:review_id>
Request Body:
json
Copy code
{
  "rating": 4,
  "comment": "Good service"
}
Delete Review:

DELETE /api/reviews/<int:review_id>
Services
Create Service:

POST /api/services/create
Request Body:
json
Copy code
{
  "service_name": "Plumbing",
  "service_description": "Fixing pipes",
  "service_category": "Home Repair"
}
Update Service:

PUT /api/services/<int:service_id>
Request Body:
json
Copy code
{
  "service_name": "Advanced Plumbing",
  "service_description": "Fixing pipes and more"
}
Delete Service:

DELETE /api/services/<int:service_id>
View All Services:

GET /api/services/all
View Services by Category:

GET /api/services/category/<int:category_id>
Testing with Postman
To test the API endpoints, you can use Postman or any other API testing tool. Import the provided Postman collection or create your own requests based on the endpoints described above.

License
This project is licensed under the MIT License. See the LICENSE file for details.





