"""
One-time migration utility: consolidates the legacy accounts.db, cart.db,
checkedout.db, and products.db files into a single database.db.

This was run once during the database-consolidation refactor described in
the project notes. It's kept here for transparency/audit purposes — there's
no need to run it again on a fresh checkout, since app.py's init_db() will
just create empty tables in database.db from now on. Re-running this script
on a project that no longer has the four legacy .db files is a harmless
no-op (each block is skipped if its source file is missing).
"""

import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
NEW_DB = os.path.join(BASE_DIR, 'database.db')


def _table_exists(cursor, table_name):
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table_name,)
    )
    return cursor.fetchone() is not None


def migrate():
    new_conn = sqlite3.connect(NEW_DB)
    new_conn.row_factory = sqlite3.Row
    new_cursor = new_conn.cursor()

    # --- users (from accounts.db) ---
    old_path = os.path.join(BASE_DIR, 'accounts.db')
    if os.path.exists(old_path):
        old_conn = sqlite3.connect(old_path)
        old_conn.row_factory = sqlite3.Row
        old_cursor = old_conn.cursor()
        if _table_exists(old_cursor, 'users'):
            old_cursor.execute('SELECT id, full_name, email, password, phone, dob, gender, created_at FROM users')
            rows = old_cursor.fetchall()
            for row in rows:
                new_cursor.execute('''
                    INSERT OR IGNORE INTO users (id, full_name, email, password, phone, dob, gender, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', tuple(row))
            print(f"✓ Migrated {len(rows)} users")
        old_conn.close()

    # --- cart (from cart.db) ---
    old_path = os.path.join(BASE_DIR, 'cart.db')
    if os.path.exists(old_path):
        old_conn = sqlite3.connect(old_path)
        old_conn.row_factory = sqlite3.Row
        old_cursor = old_conn.cursor()
        if _table_exists(old_cursor, 'cart'):
            old_cursor.execute('SELECT id, product_id, product_name, product_image, price, quantity, user_email, created_at, updated_at FROM cart')
            rows = old_cursor.fetchall()
            for row in rows:
                new_cursor.execute('''
                    INSERT OR IGNORE INTO cart (id, product_id, product_name, product_image, price, quantity, user_email, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', tuple(row))
            print(f"✓ Migrated {len(rows)} cart items")
        old_conn.close()

    # --- orders (from checkedout.db) ---
    old_path = os.path.join(BASE_DIR, 'checkedout.db')
    if os.path.exists(old_path):
        old_conn = sqlite3.connect(old_path)
        old_conn.row_factory = sqlite3.Row
        old_cursor = old_conn.cursor()
        if _table_exists(old_cursor, 'orders'):
            old_cursor.execute('SELECT id, user_email, user_name, total_amount, delivery_type, delivery_fee, status, items, created_at FROM orders')
            rows = old_cursor.fetchall()
            for row in rows:
                new_cursor.execute('''
                    INSERT OR IGNORE INTO orders (id, user_email, user_name, total_amount, delivery_type, delivery_fee, status, items, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', tuple(row))
            print(f"✓ Migrated {len(rows)} orders")
        old_conn.close()

    # Note: products are intentionally NOT migrated row-for-row here.
    # seed_products.py is the source of truth for the catalog (it now
    # also populates the new description/sizes columns), so run that
    # script after this one to (re)populate the products table.

    new_conn.commit()
    new_conn.close()
    print("✓ Migration complete. Run seed_products.py next to populate the product catalog.")


if __name__ == '__main__':
    migrate()
