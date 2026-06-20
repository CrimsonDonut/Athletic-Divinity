import requests
import json

print("Testing Women's Products API...")
response = requests.get('http://localhost:9090/api/products?category=women')
data = response.json()

print(f"Status Code: {response.status_code}")
print(f"Success: {data.get('success')}")
print(f"Total Products: {data.get('total_products')}")
print(f"Products returned: {len(data.get('products', []))}")
print(f"\nProducts:")
for product in data.get('products', []):
    print(f"  - ID {product['id']}: {product['name']} (${product['price']})")
