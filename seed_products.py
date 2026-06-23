"""
Seed script to populate database.db with the product catalog.
Run this once (or any time you want to reset the catalog back to its
defaults) — it deletes existing rows in the `products` table and
re-inserts the full catalog, including description, sizes, and rating.
"""

import sqlite3
import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

APPAREL_SIZES = json.dumps(["S", "M", "L", "XL", "XXL"])
SOCK_SIZES = json.dumps(["S", "M", "L"])
WRAP_SIZES = json.dumps(["S/M", "L/XL"])
ONE_SIZE = json.dumps(["One Size"])


def seed_products():
    """Seed the products table with the full catalog (name, brand, price,
    image, category, images, rating, description, sizes)."""

    # Product format: (id, name, brand, price, image, category, images_json, rating, description, sizes_json)
    products_data = [
        # Men's Products
        (1, 'Blissful Thunder', 'Athletic Divinity', 450.00, 'img/products/fnb2.png', 'men',
         json.dumps([
            {'src': 'img/products/fnb2.png', 'label': 'Blissful Thunder'},
            {'src': 'img/products/fnb3.png', 'label': 'Eternal Sky'},
            {'src': 'img/products/fnb4.png', 'label': 'Midnight Flame'},
            {'src': 'img/products/fnb5.png', 'label': 'Blood Moon'}
         ]),
         4.5,
         'Lightweight performance tee built for explosive training sessions. Moisture-wicking fabric keeps you dry from warm-up to the last rep.',
         APPAREL_SIZES),
        (2, 'Eternal Sky', 'Athletic Divinity', 450.00, 'img/products/fnb3.png', 'men',
         json.dumps([
            {'src': 'img/products/fnb3.png', 'label': 'Eternal Sky'},
            {'src': 'img/products/fnb2.png', 'label': 'Blissful Thunder'},
            {'src': 'img/products/fnb4.png', 'label': 'Midnight Flame'},
            {'src': 'img/products/fnb5.png', 'label': 'Blood Moon'}
         ]),
         5.0,
         'A breathable, four-way stretch tee with a clean minimalist cut, designed to move with you through every set.',
         APPAREL_SIZES),
        (3, 'Midnight Flame', 'Athletic Divinity', 450.00, 'img/products/fnb4.png', 'men',
         json.dumps([
            {'src': 'img/products/fnb4.png', 'label': 'Midnight Flame'},
            {'src': 'img/products/fnb3.png', 'label': 'Eternal Sky'},
            {'src': 'img/products/fnb2.png', 'label': 'Blissful Thunder'},
            {'src': 'img/products/fnb5.png', 'label': 'Blood Moon'}
         ]),
         4.0,
         'Bold, dark-toned training tee with reinforced stitching at the seams for durability under heavy lifts.',
         APPAREL_SIZES),
        (4, 'Blood Moon', 'Athletic Divinity', 450.00, 'img/products/fnb5.png', 'men',
         json.dumps([
            {'src': 'img/products/fnb5.png', 'label': 'Blood Moon'},
            {'src': 'img/products/fnb4.png', 'label': 'Midnight Flame'},
            {'src': 'img/products/fnb2.png', 'label': 'Blissful Thunder'},
            {'src': 'img/products/fnb3.png', 'label': 'Eternal Sky'}
         ]),
         4.5,
         'Deep crimson training tee with a soft-touch finish, made to handle the most intense Athletic Divinity sessions.',
         APPAREL_SIZES),

        # Women's Products
        (5, 'Light Crimson', 'Athletic Divinity', 450.00, 'img/products/w1.png', 'women',
         json.dumps([
            {'src': 'img/products/w1.png', 'label': 'Light Crimson'},
            {'src': 'img/products/w2.png', 'label': 'Lightning Swipe'},
            {'src': 'img/products/w3.png', 'label': 'Crimson Hour'},
            {'src': 'img/products/w4.png', 'label': 'Golden Haze'}
         ]),
         5.0,
         'Sculpted compression top with a soft crimson finish, designed to support you through every rep and run.',
         APPAREL_SIZES),
        (6, 'Lightning Swipe', 'Athletic Divinity', 450.00, 'img/products/w2.png', 'women',
         json.dumps([
            {'src': 'img/products/w2.png', 'label': 'Lightning Swipe'},
            {'src': 'img/products/w1.png', 'label': 'Light Crimson'},
            {'src': 'img/products/w3.png', 'label': 'Crimson Hour'},
            {'src': 'img/products/w4.png', 'label': 'Golden Haze'}
         ]),
         4.5,
         'Dynamic compression top with a bold lightning-inspired print, built for speed and full range of motion.',
         APPAREL_SIZES),
        (7, 'Crimson Hour', 'Athletic Divinity', 450.00, 'img/products/w3.png', 'women',
         json.dumps([
            {'src': 'img/products/w3.png', 'label': 'Crimson Hour'},
            {'src': 'img/products/w2.png', 'label': 'Lightning Swipe'},
            {'src': 'img/products/w1.png', 'label': 'Light Crimson'},
            {'src': 'img/products/w4.png', 'label': 'Golden Haze'}
         ]),
         4.0,
         'Versatile training top that transitions seamlessly from the gym floor to everyday wear.',
         APPAREL_SIZES),
        (8, 'Golden Haze', 'Athletic Divinity', 450.00, 'img/products/w4.png', 'women',
         json.dumps([
            {'src': 'img/products/w4.png', 'label': 'Golden Haze'},
            {'src': 'img/products/w3.png', 'label': 'Crimson Hour'},
            {'src': 'img/products/w2.png', 'label': 'Lightning Swipe'},
            {'src': 'img/products/w1.png', 'label': 'Light Crimson'}
         ]),
         5.0,
         'Soft gold-toned compression top with breathable side panels for ventilation during high-intensity training.',
         APPAREL_SIZES),

        # Accessories Products
        (9, 'Silicone Chain Wrist Wraps', 'Athletic Divinity', 450.00, 'img/products/a1.png', 'accessories',
         json.dumps([
            {'src': 'img/products/a1.png', 'label': 'Silicone Chain Wrist Wraps'},
            {'src': 'img/products/a2.png', 'label': 'Chalice of Zeus'},
            {'src': 'img/products/a3.png', 'label': 'Socks Of Hermes'},
            {'src': 'img/products/a4.png', 'label': 'Bracers of Olympus'}
         ]),
         4.5,
         'Durable silicone-chain wrist wraps that add extra wrist support for heavy pulls and presses.',
         WRAP_SIZES),
        (10, 'Chalice Of Zeus', 'Athletic Divinity', 450.00, 'img/products/a2.png', 'accessories',
         json.dumps([
            {'src': 'img/products/a2.png', 'label': 'Chalice Of Zeus'},
            {'src': 'img/products/a1.png', 'label': 'Silicone Chain Wrist Wraps'},
            {'src': 'img/products/a3.png', 'label': 'Socks of Hermes'},
            {'src': 'img/products/a4.png', 'label': 'Bracers of Olympus'}
         ]),
         5.0,
         'Insulated shaker bottle inspired by divine craftsmanship, keeping your pre-workout cold and ready.',
         ONE_SIZE),
        (11, 'Socks of Hermes', 'Athletic Divinity', 249.00, 'img/products/a3.png', 'accessories',
         json.dumps([
            {'src': 'img/products/a1.png', 'label': 'Silicone Chain Wrist Wraps'},
            {'src': 'img/products/a2.png', 'label': 'Chalice Of Zeus'},
            {'src': 'img/products/a3.png', 'label': 'Socks of Hermes'},
            {'src': 'img/products/a4.png', 'label': 'Bracers of Olympus'}
         ]),
         4.0,
         'Cushioned, breathable training socks built for speed — light as a messenger god, tough as the road ahead.',
         SOCK_SIZES),
        (12, 'Bracers of Olympus', 'Athletic Divinity', 799.00, 'img/products/a4.png', 'accessories',
         json.dumps([
            {'src': 'img/products/a3.png', 'label': 'Socks of Hermes'},
            {'src': 'img/products/a1.png', 'label': 'Silicone Chain Wrist Wraps'},
            {'src': 'img/products/a2.png', 'label': 'Chalice Of Zeus'},
            {'src': 'img/products/a4.png', 'label': 'Bracers of Olympus'}
         ]),
         5.0,
         'Heavy-duty wrist and forearm bracers for maximum stability under your toughest lifts.',
         WRAP_SIZES),

        # Additional products
        (15, 'Cloudy Night', 'Athletic Divinity', 549.00, 'img/products/t3.png', 'accessories',
         json.dumps([
            {'src': 'img/products/t3.png', 'label': 'Cloudy Night'},
            {'src': 'img/products/t1.png', 'label': 'Silent Midnight'},
            {'src': 'img/products/t2.png', 'label': 'Crown of Night'},
            {'src': 'img/products/t4.png', 'label': 'Seething Blood'}
         ]),
         4.5,
         'Cool-toned overlay piece with a relaxed fit, perfect for warming up or cooling down between sets.',
         APPAREL_SIZES),
        (16, 'Seething Blood', 'Athletic Divinity', 300.00, 'img/products/t4.png', 'accessories',
         json.dumps([
            {'src': 'img/products/t4.png', 'label': 'Seething Blood'},
            {'src': 'img/products/t3.png', 'label': 'Cloudy Night'},
            {'src': 'img/products/t2.png', 'label': 'Crown of Night'},
            {'src': 'img/products/t1.png', 'label': 'Silent Midnight'}
         ]),
         4.0,
         'Striking deep-red accent piece designed to layer easily over your training gear.',
         APPAREL_SIZES),
        (19, 'Flame Crest', 'Athletic Divinity', 649.00, 'img/products/anb.png', 'men',
         json.dumps([
            {'src': 'img/products/anb.png', 'label': 'Flame Crest'},
            {'src': 'img/products/anb2.png', 'label': 'Divine Flames'},
            {'src': 'img/products/anb3.png', 'label': 'Cursed Flames'},
            {'src': 'img/products/anb4.png', 'label': 'The Sun'}
         ]),
         5.0,
         'Premium heavyweight tee with a flame crest graphic, built for athletes who train like it matters.',
         APPAREL_SIZES),
    ]

    database_db = os.path.join(BASE_DIR, 'database.db')
    conn = sqlite3.connect(database_db)
    cursor = conn.cursor()

    # Delete existing products to avoid duplicates
    cursor.execute('DELETE FROM products')

    # Insert all products with images array, rating, description, and sizes
    for product_id, name, brand, price, image, category, images_json, rating, description, sizes_json in products_data:
        cursor.execute('''
            INSERT INTO products (id, name, brand, price, image, category, images, rating, description, sizes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (product_id, name, brand, price, image, category, images_json, rating, description, sizes_json))

    conn.commit()
    conn.close()
    print(f"✓ Seeded {len(products_data)} products into database.db")


if __name__ == '__main__':
    seed_products()
