import requests

print("Testing product lookup by ID:")
for product_id in [1, 5, 6, 7, 8]:
    response = requests.get(f'http://localhost:9090/api/products/{product_id}')
    data = response.json()
    status = "✓ FOUND" if data.get('success') else "✗ NOT FOUND"
    product_name = data.get('product', {}).get('name', 'N/A') if data.get('success') else data.get('error', 'Unknown error')
    print(f"  ID {product_id}: {status} - {product_name}")
