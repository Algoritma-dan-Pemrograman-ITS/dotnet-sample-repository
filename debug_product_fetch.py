import requests
import json
import random

BASE_URL = "http://localhost:5000/api/v1"

def debug_product_fetch():
    print("1. Listing Products (GetProductsView)...")
    try:
        # Assuming open endpoint or needs auth. Products usually public?
        # Endpoints configs said MapGetProductsViewEndpoint.
        # Let's try without auth first, then with auth if 401.
        response = requests.get(f"{BASE_URL}/catalogs/products?Page=1&PageSize=10")
        if response.status_code == 401:
            print("Auth required. Logging in...")
            # Login logic... (Reusing from debug_auth.py)
            login_payload = {"userNameOrEmail": "mehdi@test.com", "password": "123456"}
            auth_res = requests.post(f"{BASE_URL}/identity/login", json=login_payload)
            auth_res.raise_for_status()
            token = auth_res.json().get("accessToken")
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{BASE_URL}/catalogs/products?Page=1&PageSize=10", headers=headers)
        
        response.raise_for_status()
        data = response.json()
        print(f"List response: {json.dumps(data, indent=2)}")
        
        print(f"List response keys: {data.keys()}")
        
        # Handle different potential response structures
        if "products" in data:
            if isinstance(data["products"], dict) and "products" in data["products"]:
                # Nested structure: { "products": { "products": [...] } }
                products = data["products"]["products"]
                print("Found nested product list.")
            elif isinstance(data["products"], list):
                products = data["products"]
            elif isinstance(data["products"], dict) and "items" in data["products"]:
                products = data["products"]["items"]
            else:
                 # Last resort: try to find a list in values
                 products = []
                 for k, v in data["products"].items():
                     if isinstance(v, list):
                         products = v
                         print(f"Found products list in key: {k}")
                         break
        elif "items" in data: # Common paged result key
            products = data["items"]
        else:
            # Maybe it's just the list?
            if isinstance(data, list):
                products = data
            else:
                products = []

        if not products:
            print("No products found in list (or could not parse).")
            return

        target_product = products[0]
        # target_id = target_product.get("id")
        # Handle case sensitivity
        target_id = target_product.get("id") or target_product.get("Id") or target_product.get("productId")
        
        print(f"Targeting Product ID: {target_id}")

        if not target_id:
             print("Could not determine ID from product object.")
             return

        print(f"2. Fetching Product Details (GetProductById) for ID: {target_id}...")
        detail_url = f"{BASE_URL}/catalogs/products/{target_id}"
        
        # Check if auth needed
        detail_res = requests.get(detail_url)
        if detail_res.status_code == 401:
             print("Auth required for details.")
             detail_res = requests.get(detail_url, headers=headers)
        
        print(f"Status Code: {detail_res.status_code}")
        print(f"Response: {detail_res.text}")

        if detail_res.status_code == 404:
            print("FATAL: Product found in list but returned 404 on details.")
        elif detail_res.status_code == 200:
             # Validate product is in response
             d_json = detail_res.json()
             if "product" in d_json or "id" in d_json:
                print("SUCCESS: Product details fetched.")
             else:
                print(f"WARNING: 200 OK but response structure unexpected: {d_json.keys()}")

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_product_fetch()
