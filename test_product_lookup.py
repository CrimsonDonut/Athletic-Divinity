import requests
import sqlite3

print("="*70)
print("TESTING PRODUCT LOOKUP")
print("="*70)

# Test 1: Check database directly
print("\n✓ DATABASE CHECK:")
conn = sqlite3.connect('products.db')
cursor = conn.cursor()
cursor.execute('SELECT id, name, category FROM products LIMIT 20')
products = cursor.fetchall()
print(f"  Found {len(products)} products in database:")
for product_id, name, category in products:
    print(f"    - ID {product_id}: {name} (category: {category})")
conn.close()

# Test 2: Test API list endpoint
print("\n✓ API /api/products ENDPOINT:")
response = requests.get('http://localhost:9090/api/products')
data = response.json()
print(f"  Status: {response.status_code}")
print(f"  Total products returned: {len(data.get('products', []))}")
if data.get('products'):
    for p in data['products'][:3]:
        print(f"    - ID {p['id']}: {p['name']}")

# Test 3: Test API category filter
print("\n✓ API /api/products?category=men ENDPOINT:")
response = requests.get('http://localhost:9090/api/products?category=men')
data = response.json()
print(f"  Status: {response.status_code}")
print(f"  Men's products returned: {len(data.get('products', []))}")
if data.get('products'):
    for p in data['products']:
        print(f"    - ID {p['id']}: {p['name']}")

# Test 4: Test API single product lookup
print("\n✓ API /api/products/1 ENDPOINT (test product ID 1):")
response = requests.get('http://localhost:9090/api/products/1')
data = response.json()
print(f"  Status: {response.status_code}")
if data.get('success'):
    p = data['product']
    print(f"  ✓ Found: ID {p['id']} - {p['name']}")
else:
    print(f"  ✗ NOT FOUND: {data.get('error')}")

print("\n" + "="*70)
