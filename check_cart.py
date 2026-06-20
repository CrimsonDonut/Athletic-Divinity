import sqlite3

conn = sqlite3.connect('cart.db')
cursor = conn.cursor()
cursor.execute('SELECT product_id, product_name, product_image FROM cart LIMIT 10')
cart_items = cursor.fetchall()

print("=" * 70)
print("CHECKING CART ITEM IMAGE PATHS")
print("=" * 70)

for product_id, name, image_path in cart_items:
    print(f"\nProduct ID {product_id}: {name}")
    print(f"  Image path stored: {image_path}")
    print(f"  Expected path: /static/img/products/[filename].png")

conn.close()
