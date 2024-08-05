import base64
import json
import requests
from datetime import datetime

def generate_access_token():
    consumer_key = "1O1lSMa6wDIf5ymXEB6mTiWr2E3MwDbbCebC8rjDvO84DZdG"
    consumer_secret = "CGmcveiwMdGLt2d081Ied7vWMTYZtNqxQaIT5G0sa1yLRvS88okA1NfqqILHo8SK"

    #choose one depending on you development environment
    #sandbox
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

    try:
        
        encoded_credentials = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()

        
        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/json"
        }

        # Send the request and parse the response
        response = requests.get(url, headers=headers).json()

        # Check for errors and return the access token
        if "access_token" in response:
            return response["access_token"]
        else:
            raise Exception("Failed to get access token: " + response["error_description"])
    except Exception as e:
        raise Exception("Failed to get access token: " + str(e)) 

