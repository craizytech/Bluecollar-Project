from flask import request, jsonify
import requests
import base64
from datetime import datetime
from app.mpesa import mpesa_bp
from app.extensions import db
from app.config import Config
import time
from app.models import User, Transaction, Invoice
from flask_jwt_extended import jwt_required, get_jwt_identity

# Constants
SHORT_CODE = Config.SHORT_CODE
PASSKEY = Config.PASSKEY
CONSUMER_KEY = Config.CONSUMER_KEY
CONSUMER_SECRET = Config.CONSUMER_SECRET
CALLBACK_URL = Config.CALLBACK_URL
TRANSACTION_TYPE = Config.TRANSACTION_TYPE
ACCOUNT_REFERENCE = Config.ACCOUNT_REFERENCE
TRANSACTION_DESC = Config.TRANSACTION_DESC

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

def confirm_pay(access_token, checkout_request_id):
    payload = {
        "BusinessShortCode": SHORT_CODE,
        "Password": generate_stk_password(SHORT_CODE, PASSKEY, get_timestamp()),
        "Timestamp": get_timestamp(),
        "CheckoutRequestID": checkout_request_id
    }
    headers = {'Authorization': f"Bearer {access_token}", 'Content-Type': "application/json"}
    saf_url = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query"
    try:
        response = requests.post(saf_url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

@mpesa_bp.route('/')
def home():
    return "M-Pesa Integration with Flask"

@mpesa_bp.route('/pay', methods=['POST'])
@jwt_required()
def pay():
    try:
        data = request.get_json()
        phone_number = data['phone_number']
        amount = data['amount']
        invoice_id = data.get('invoice_id')
        
        access_token = generate_access_token(CONSUMER_KEY, CONSUMER_SECRET)
        response = stk_push_payment(access_token, phone_number, amount, CALLBACK_URL, SHORT_CODE, PASSKEY)
        time.sleep(15)

        if response.get("ResponseCode") == "0":
            checkout_request_id = response.get("CheckoutRequestID")
            confirm_response = confirm_pay(access_token, checkout_request_id)
            
            # Get user details and invoice information
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            invoice = Invoice.query.get(invoice_id)
            
            if not user or not invoice:
                return jsonify({"error": "Invalid user or invoice information"}), 400
            
            if confirm_response.get("ResultCode") == "0":
                status = "paid"
            elif confirm_response.get("ResultCode") == "1032":
                status = "cancelled"
            else:
                status = "failed"
            
            # Record transaction
            transaction = Transaction(
                payer_name=user.user_name,
                payer_phone_number=phone_number,
                amount_paid=amount,
                status=status,
                invoice_id=invoice_id
            )
            
            try:
                db.session.add(transaction)
                db.session.commit()
                return jsonify(confirm_response)
            except Exception as e:
                db.session.rollback()
                return jsonify({"error": str(e)}), 500
        
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
