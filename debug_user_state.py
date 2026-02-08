import requests
import json
import uuid

BASE_URL = "http://localhost:5000/api/v1"

def debug_user_state():
    # 1. Login as Admin
    print("Logging in as Admin...")
    login_payload = {
        "userNameOrEmail": "mehdi@test.com",
        "password": "123456"
    }
    try:
        response = requests.post(f"{BASE_URL}/identity/login", json=login_payload)
        response.raise_for_status()
        data = response.json()
        token = data.get("accessToken")
        print(f"Login successful. Token obtained.")
    except Exception as e:
        print(f"Login failed: {e}")
        return

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 2. Register a Test User (Target)
    # Database has varchar(50) limit. UUID is 36 chars.
    # "target-" + UUID + "@test.com" > 50.
    # Let's use a shorter random string or just a shorter prefix/suffix.
    short_id = str(uuid.uuid4())[:8]
    test_user_email = f"user-{short_id}@test.com"
    register_payload = {
        "firstName": "Test",
        "lastName": "Target",
        "userName": test_user_email,
        "email": test_user_email,
        "password": "Password123!",
        "confirmPassword": "Password123!"
    }
    
    # We need the user ID of the registered user. Usually register returns it or we login to get it.
    # But register endpoint might return 201 Created or 204 No Content.
    # Let's try register endpoint.
    print(f"Registering test user: {test_user_email}")
    try:
        # Correct URL for registration: api/v1/identity/users
        reg_response = requests.post(f"{BASE_URL}/identity/users", json=register_payload)
        reg_response.raise_for_status()
        print("Registration successful.")
        
        # We need the user ID. The endpoint returns 201 Created and the location header or body might have it.
        # Let's check the response body.
        reg_data = reg_response.json()
        # Based on RegisterUserEndpoint.cs: return Results.Created(..., result);
        # result is RegisterUserResponse. Let's see if it has Id.
        # Assuming it does (RegisterUserResponse usually has just Id).
        # Let's try to get it from 'userIdentity.id' or look at the structure.
        # RegisterUserResponse.cs likely wraps UserIdentity.
        # Let's inspect the response content in the script.
        print(f"Registration Response: {reg_data}")
        # Assuming we can get the ID from the response or just fail over to admin test.
        # Let's try to extract ID from response if possible, else skip.
        try:
             # Just a guess based on typical patterns, will debug if wrong.
             test_user_id = reg_data.get("userIdentity", {}).get("id")
             if test_user_id:
                 print(f"Test User ID: {test_user_id}")
                 
                 # 3. Attempt to update Test User State (Expect Success)
                 print(f"Attempting to update Test User state (ID: {test_user_id})...")
                 update_test_payload = {"userState": 2} # Locked
                 update_test_res = requests.put(f"{BASE_URL}/identity/users/{test_user_id}/state", json=update_test_payload, headers=headers)
                 update_test_res.raise_for_status()
                 print("Successfully updated Test User state.")
        except Exception as e:
            print(f"Failed to extract ID or update test user: {e}")

        # ... login logic skipped as we have admin token ...

    except Exception as e:
        print(f"Registration failed: {e}")
        try:
             print(reg_response.text)
        except:
             pass
        admin_user_id = "85c4196f-b5ea-498a-ac39-3aa2678de542"

    # 4. Attempt to update Admin State (Expect Failure)
    admin_user_id = "85c4196f-b5ea-498a-ac39-3aa2678de542" 
    print(f"Attempting to update Admin state (ID: {admin_user_id})...")
    update_payload = {
        "userState": 2 # Locked
    }
    
    try:
        # Correct URL: api/v1/identity/users/{id}/state
        update_res = requests.put(f"{BASE_URL}/identity/users/{admin_user_id}/state", json=update_payload, headers=headers)
        print(f"Update Status Code: {update_res.status_code}")
        print(f"Update Response: {update_res.text}")
    except Exception as e:
        print(f"Update request failed: {e}")

if __name__ == "__main__":
    debug_user_state()
