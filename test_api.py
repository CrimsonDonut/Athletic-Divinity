import requests
import json

try:
    response = requests.get('http://localhost:9090/api/products')
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Success: {data.get('success')}")
    print(f"Total Products: {data.get('total_products')}")
    print(f"Products Count: {len(data.get('products', []))}")
    if data.get('products'):
        print(f"\nFirst Product:")
        print(json.dumps(data['products'][0], indent=2))
except Exception as e:
    print(f"Error: {e}")
