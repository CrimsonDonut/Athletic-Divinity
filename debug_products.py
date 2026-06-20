"""
Debug script to check what products are in the database and their categories
"""
import sqlite3
import json

db_path = 'products.db'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all products
    cursor.execute('SELECT id, name, category FROM products')
    products = cursor.fetchall()
    
    print(f"\n✓ Total products in database: {len(products)}\n")
    print("Product ID | Name | Category")
    print("-" * 60)
    
    categories = {}
    for pid, name, category in products:
        print(f"{pid:<10} | {name:<25} | {category}")
        if category not in categories:
            categories[category] = 0
        categories[category] += 1
    
    print("\n" + "=" * 60)
    print("CATEGORY BREAKDOWN:")
    print("=" * 60)
    for cat, count in sorted(categories.items()):
        print(f"{cat}: {count} products")
    
    # Test the filtering logic
    print("\n" + "=" * 60)
    print("FILTER TEST:")
    print("=" * 60)
    
    men_products = [p for p in products if p[2] == "men"]
    women_products = [p for p in products if p[2] == "women"]
    accessory_products = [p for p in products if p[2] == "accessories"]
    
    print(f"Men products: {len(men_products)}")
    print(f"Women products: {len(women_products)}")
    print(f"Accessories products: {len(accessory_products)}")
    
    if men_products:
        print(f"\n✓ Can pick from men: {men_products[0][1]}")
    if women_products:
        print(f"✓ Can pick from women: {women_products[0][1]}")
    if accessory_products:
        print(f"✓ Can pick from accessories: {accessory_products[0][1]}")
    
    if not (men_products and women_products and accessory_products):
        print("\n⚠️ PROBLEM: Missing category data needed for 'Choose For Me' feature!")
        print("   Men products needed: " + ("✓" if men_products else "✗"))
        print("   Women products needed: " + ("✓" if women_products else "✗"))
        print("   Accessories products needed: " + ("✓" if accessory_products else "✗"))
    
    conn.close()
    
except Exception as e:
    print(f"✗ Error: {e}")
