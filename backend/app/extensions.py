from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS


db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
jwt = JWTManager()

# Initialize JWT with the app
def init_jwt(app):
    jwt.init_app(app)

@jwt.token_in_blocklist_loader
def check_if_token_in_blocklist(jwt_header, jwt_payload):
    from app.models import TokenBlockList
    jti = jwt_payload['jti']
    token = TokenBlockList.query.filter_by(jti=jti).first()
    return token is not None