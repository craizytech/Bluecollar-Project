import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a_hard_to_guess_string'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_HEADERS = 'Content-Type'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'super-secret-key'
    SHORT_CODE = "174379"
    PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
    CONSUMER_KEY = "1O1lSMa6wDIf5ymXEB6mTiWr2E3MwDbbCebC8rjDvO84DZdG"
    CONSUMER_SECRET = "CGmcveiwMdGLt2d081Ied7vWMTYZtNqxQaIT5G0sa1yLRvS88okA1NfqqILHo8SK"
    CALLBACK_URL = "https://aee9-41-89-227-171.ngrok-free.app/api/mpesa/callback"
    TRANSACTION_TYPE = "CustomerPayBillOnline"
    ACCOUNT_REFERENCE = "Bluecollar app"
    TRANSACTION_DESC = "test"


class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}