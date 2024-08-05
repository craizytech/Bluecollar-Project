from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
import base64
from datetime import datetime
from app.mpesa import mpesa_bp
from app.utils.decorators import permission_required
from app.extensions import db

# Constants
SHORT_CODE = "174379"
PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
CONSUMER_KEY = "1O1lSMa6wDIf5ymXEB6mTiWr2E3MwDbbCebC8rjDvO84DZdG"
CONSUMER_SECRET = "CGmcveiwMdGLt2d081Ied7vWMTYZtNqxQaIT5G0sa1yLRvS88okA1NfqqILHo8SK"
CALLBACK_URL = "https://aee9-41-89-227-171.ngrok-free.app/api/mpesa/callback"
TRANSACTION_TYPE = "CustomerPayBillOnline"
ACCOUNT_REFERENCE = "Bluecollar app"
TRANSACTION_DESC = "test"

def get_timestamp():
    return datetime.now().strftime('%Y%m%d%H%M%S')

def generate_stk_password(short_code, passkey, timestamp):
    data_to_encode = short_code + passkey + timestamp
    encoded_string = base64.b64encode(data_to_encode.encode('utf-8')).decode('utf-8')
    return encoded_string

def generate_access_token(consumer_key, consumer_secret):
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    try:
        credentials = f"{consumer_key}:{consumer_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        headers = {"Authorization": f"Basic {encoded_credentials}"}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()["access_token"]
    except requests.exceptions.RequestException as e:
        raise SystemExit(f"Failed to get access token: {e}")

def stk_push_payment(access_token, phone_number, amount, callback_url, business_short_code, passkey):
    url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
    timestamp = get_timestamp()
    password = generate_stk_password(business_short_code, passkey, timestamp)
    
    payload = {
        "BusinessShortCode": business_short_code,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": TRANSACTION_TYPE,
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": business_short_code,
        "PhoneNumber": phone_number,
        "CallBackURL": callback_url,
        "AccountReference": ACCOUNT_REFERENCE,
        "TransactionDesc": TRANSACTION_DESC
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

@mpesa_bp.route('/')
def home():
    return "M-Pesa Integration with Flask"

@mpesa_bp.route('/pay', methods=['POST'])
def pay():
    data = request.get_json()
    phone_number = data['phone_number']
    amount = data['amount']
    
    access_token = generate_access_token(CONSUMER_KEY, CONSUMER_SECRET)
    response = stk_push_payment(access_token, phone_number, amount, CALLBACK_URL, SHORT_CODE, PASSKEY)

    return jsonify(response)