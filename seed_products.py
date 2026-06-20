"""
Seed script to populate products.db with hardcoded product data from templates
Run this once to populate the database, then templates can fetch from API
"""

import sqlite3
import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def seed_products():
    """Seed the products database with all hardcoded products from templates"""
    
    # Product format: (id, name, brand, price, image, category, images_json)
    products_data = [
        # Men's Products
        (1, 'Blissful Thunder', 'Athletic Divinity', 450.00, 'img/products/fnb2.png', 'men', 
         json.dumps([
            {'src': 'img/products/fnb2.png', 'label': 'Blissful Thunder'},
            {'src': 'img/products/fnb3.png', 'label': 'Eternal Sky'},
            {'src': 'img/products/fnb4.png', 'label': 'Midnight Flame'},
            {'src': 'img/products/fnb5.png', 'label': 'Blood Moon'}
         ])),
        (2, 'Eternal Sky', 'Athletic Divinity', 450.00, 'img/products/fnb3.png', 'men',
         json.dumps([
            {'src': 'img/products/fnb3.png', 'label': 'Eternal Sky'},
            {'src': 'img/products/fnb2.png', 'label': 'Blissful Thunder'},
            {'src': 'img/products/fnb4.png', 'label': 'Midnight Flame'},
            {'src': 'img/products/fnb5.png', 'label': 'Blood Moon'}
         ])),
        (3, 'Midnight Flame', 'Athletic Divinity', 450.00, 'img/products/fnb4.png', 'men',
         json.dumps([
            {'src': 'img/products/fnb4.png', 'label': 'Midnight Flame'},
            {'src': 'img/products/fnb3.png', 'label': 'Eternal Sky'},
            {'src': 'img/products/fnb2.png', 'label': 'Blissful Thunder'},
            {'src': 'img/products/fnb5.png', 'label': 'Blood Moon'}
         ])),
        (4, 'Blood Moon', 'Athletic Divinity', 450.00, 'img/products/fnb5.png', 'men',
         json.dumps([
            {'src': 'img/products/fnb5.png', 'label': 'Blood Moon'},
            {'src': 'img/products/fnb4.png', 'label': 'Midnight Flame'},
            {'src': 'img/products/fnb2.png', 'label': 'Blissful Thunder'},
            {'src': 'img/products/fnb3.png', 'label': 'Eternal Sky'}
         ])),
        
        # Women's Products
        (5, 'Light Crimson', 'Athletic Divinity', 450.00, 'img/products/w1.png', 'women',
         json.dumps([
            {'src': 'img/products/w1.png', 'label': 'Light Crimson'},
            {'src': 'img/products/w2.png', 'label': 'Lightning Swipe'},
            {'src': 'img/products/w3.png', 'label': 'Crimson Hour'},
            {'src': 'img/products/w4.png', 'label': 'Golden Haze'}
         ])),
        (6, 'Lightning Swipe', 'Athletic Divinity', 450.00, 'img/products/w2.png', 'women',
         json.dumps([
            {'src': 'img/products/w2.png', 'label': 'Lightning Swipe'},
            {'src': 'img/products/w1.png', 'label': 'Light Crimson'},
            {'src': 'img/products/w3.png', 'label': 'Crimson Hour'},
            {'src': 'img/products/w4.png', 'label': 'Golden Haze'}
         ])),
        (7, 'Crimson Hour', 'Athletic Divinity', 450.00, 'img/products/w3.png', 'women',
         json.dumps([
            {'src': 'img/products/w3.png', 'label': 'Crimson Hour'},
            {'src': 'img/products/w2.png', 'label': 'Lightning Swipe'},
            {'src': 'img/products/w1.png', 'label': 'Light Crimson'},
            {'src': 'img/products/w4.png', 'label': 'Golden Haze'}
         ])),
        (8, 'Golden Haze', 'Athletic Divinity', 450.00, 'img/products/w4.png', 'women',
         json.dumps([
            {'src': 'img/products/w4.png', 'label': 'Golden Haze'},
            {'src': 'img/products/w3.png', 'label': 'Crimson Hour'},
            {'src': 'img/products/w2.png', 'label': 'Lightning Swipe'},
            {'src': 'img/products/w1.png', 'label': 'Light Crimson'}
         ])),
        
        # Accessories Products
        (9, 'Silicone Chain Wrist Wraps', 'Athletic Divinity', 450.00, 'img/products/a1.png', 'accessories',
         json.dumps([
            {'src': 'img/products/a1.png', 'label': 'Silicone Chain Wrist Wraps'},
            {'src': 'img/products/a2.png', 'label': 'Chalice of Zeus'},
            {'src': 'img/products/a3.png', 'label': 'Socks Of Hermes'},
            {'src': 'img/products/a4.png', 'label': 'Bracers of Olympus'}
         ])),
        (10, 'Chalice Of Zeus', 'Athletic Divinity', 450.00, 'img/products/a2.png', 'accessories',
         json.dumps([
            {'src': 'img/products/a2.png', 'label': 'Chalice Of Zeus'},
            {'src': 'img/products/a1.png', 'label': 'Silicone Chain Wrist Wraps'},
            {'src': 'img/products/a3.png', 'label': 'Socks of Hermes'},
            {'src': 'img/products/a4.png', 'label': 'Bracers of Olympus'}
         ])),
        (11, 'Socks of Hermes', 'Athletic Divinity', 249.00, 'img/products/a3.png', 'accessories',
         json.dumps([
            {'src': 'img/products/a1.png', 'label': 'Silicone Chain Wrist Wraps'},
            {'src': 'img/products/a2.png', 'label': 'Chalice Of Zeus'},
            {'src': 'img/products/a3.png', 'label': 'Socks of Hermes'},
            {'src': 'img/products/a4.png', 'label': 'Bracers of Olympus'}
         ])),
        (12, 'Bracers of Olympus', 'Athletic Divinity', 799.00, 'img/products/a4.png', 'accessories',
         json.dumps([
            {'src': 'img/products/a3.png', 'label': 'Socks of Hermes'},
            {'src': 'img/products/a1.png', 'label': 'Silicone Chain Wrist Wraps'},
            {'src': 'img/products/a2.png', 'label': 'Chalice Of Zeus'},
            {'src': 'img/products/a4.png', 'label': 'Bracers of Olympus'}
         ])),
        
        # Additional products
        (15, 'Cloudy Night', 'Athletic Divinity', 549.00, 'img/products/t3.png', 'accessories',
         json.dumps([
            {'src': 'img/products/t3.png', 'label': 'Cloudy Night'},
            {'src': 'img/products/t1.png', 'label': 'Silent Midnight'},
            {'src': 'img/products/t2.png', 'label': 'Crown of Night'},
            {'src': 'img/products/t4.png', 'label': 'Seething Blood'}
         ])),
        (16, 'Seething Blood', 'Athletic Divinity', 300.00, 'img/products/t4.png', 'accessories',
         json.dumps([
            {'src': 'img/products/t4.png', 'label': 'Seething Blood'},
            {'src': 'img/products/t3.png', 'label': 'Cloudy Night'},
            {'src': 'img/products/t2.png', 'label': 'Crown of Night'},
            {'src': 'img/products/t1.png', 'label': 'Silent Midnight'}
         ])),
        (19, 'Flame Crest', 'Athletic Divinity', 649.00, 'img/products/anb.png', 'men',
         json.dumps([
            {'src': 'img/products/anb.png', 'label': 'Flame Crest'},
            {'src': 'img/products/anb2.png', 'label': 'Divine Flames'},
            {'src': 'img/products/anb3.png', 'label': 'Cursed Flames'},
            {'src': 'img/products/anb4.png', 'label': 'The Sun'}
         ])),
    ]
    
    products_db = os.path.join(BASE_DIR, 'products.db')
    conn = sqlite3.connect(products_db)
    cursor = conn.cursor()
    
    # Delete existing products to avoid duplicates
    cursor.execute('DELETE FROM products')
    
    # Insert all products with images array
    for product_id, name, brand, price, image, category, images_json in products_data:
        cursor.execute('''
            INSERT INTO products (id, name, brand, price, image, category, images, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (product_id, name, brand, price, image, category, images_json, 5.0))
    
    conn.commit()
    conn.close()
    print(f"✓ Seeded {len(products_data)} products into products.db")


if __name__ == '__main__':
    seed_products()
