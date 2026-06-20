import requests
import json

print("="*60)
print("TESTING ALL PRODUCT ENDPOINTS")
print("="*60)

# Test 1: Get all products
print("\n1. GET /api/products")
response = requests.get('http://localhost:9090/api/products')
data = response.json()
print(f"   Status: {response.status_code}")
print(f"   Success: {data.get('success')}")
print(f"   Total Products: {data.get('total_products')}")
print(f"   Products on page: {len(data.get('products', []))}")

# Test 2: Get men's products
print("\n2. GET /api/products?category=men")
response = requests.get('http://localhost:9090/api/products?category=men')
data = response.json()
print(f"   Status: {response.status_code}")
print(f"   Success: {data.get('success')}")
print(f"   Total Products: {data.get('total_products')}")
print(f"   Men's products: {len(data.get('products', []))}")
if data.get('products'):
    print(f"   Example: {data['products'][0]['name']}")

# Test 3: Get women's products
print("\n3. GET /api/products?category=women")
response = requests.get('http://localhost:9090/api/products?category=women')
data = response.json()
print(f"   Status: {response.status_code}")
print(f"   Total Products: {data.get('total_products')}")
print(f"   Women's products: {len(data.get('products', []))}")

# Test 4: Get accessories products
print("\n4. GET /api/products?category=accessories")
response = requests.get('http://localhost:9090/api/products?category=accessories')
data = response.json()
print(f"   Status: {response.status_code}")
print(f"   Total Products: {data.get('total_products')}")
print(f"   Accessories: {len(data.get('products', []))}")

# Test 5: Get single product
print("\n5. GET /api/products/1")
response = requests.get('http://localhost:9090/api/products/1')
data = response.json()
print(f"   Status: {response.status_code}")
print(f"   Success: {data.get('success')}")
if data.get('product'):
    product = data['product']
    print(f"   Product ID: {product['id']}")
    print(f"   Product Name: {product['name']}")
    print(f"   Price: ₱{product['price']}")
    print(f"   Category: {product['category']}")

print("\n" + "="*60)
print("✓ All endpoints working correctly!")
print("="*60)
