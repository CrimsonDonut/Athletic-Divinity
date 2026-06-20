import sqlite3
import json
import os

conn = sqlite3.connect('products.db')
cursor = conn.cursor()
cursor.execute('SELECT id, name, image, images FROM products')
products = cursor.fetchall()

print("=" * 70)
print("CHECKING ALL PRODUCT IMAGES IN DATABASE")
print("=" * 70)

for product_id, name, image_path, images_json in products:
    print(f"\nProduct ID {product_id}: {name}")
    print(f"  Primary image: {image_path}")
    
    if images_json:
        try:
            images = json.loads(images_json)
            print(f"  Thumbnails: {len(images)} images")
            for img in images:
                print(f"    - {img['src']}")
                # Check if file exists
                full_path = f"static/{img['src']}"
                exists = "✓" if os.path.exists(full_path) else "✗ MISSING"
                print(f"      {exists}")
        except:
            print(f"  Error parsing images JSON")
    else:
        print(f"  No thumbnail images")

conn.close()
