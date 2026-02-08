import requests
import json

BASE_URL = "http://localhost:5000/api/v1"

def debug_auth():
    # 1. Login
    print("Logging in...")
    login_payload = {
        "userNameOrEmail": "mehdi@test.com",
        "password": "123456"
    }
    try:
        response = requests.post(f"{BASE_URL}/identity/login", json=login_payload)
        response.raise_for_status()
        data = response.json()
        token = data.get("accessToken")
        print(f"Login successful. Token obtained: {token}")
    except Exception as e:
        print(f"Login failed: {e}")
        print(response.text)
        return

    # 2. Try Admin Action (Create Product)
    print("\nAttempting Admin Action (Create Product)...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    # Payload doesn't matter much if auth fails before validation, but let's send something valid-ish
    product_payload = {
        "name": "Debug Product",
        "categoryId": 1,
        "price": 100,
        "description": "Test"
    }
    
    try:
        # Use a random endpoint that requires Admin. 
        # Looking at previous files, CreateProductEndpoint matches POST /api/v1/catalogs/products
        response = requests.post(f"http://localhost:5000/api/v1/catalogs/products", json=product_payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    debug_auth()
