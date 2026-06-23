# A simple web application.
from flask import Flask, render_template, request, jsonify
import os
import sqlite3
import json
import logging
from datetime import datetime
import hashlib
from dotenv import load_dotenv

# Load environment variables from .env (PORT, SECRET_KEY, any future API keys)
# so credentials never have to live directly in source code.
load_dotenv()

# Basic logging configuration. Use logging.debug(...) instead of print(...)
# for development diagnostics — this can be silenced in production by
# raising the level (or routed to a file) without touching application code.
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Read the secret key from the environment (.env in development). Flask
# sessions need this to be set; 'changeme' is only a placeholder fallback
# and should always be overridden via SECRET_KEY in production.
app.secret_key = os.environ.get('SECRET_KEY', 'changeme')

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# ===== DATABASE PATH HELPERS =====
# All data now lives in a single database.db file (users, cart, orders,
# products, settings). Keeping four separate helper functions preserves
# the existing call sites throughout this file, but they all now resolve
# to the same consolidated database — one file to open, one file to back up.
def get_database_db():
    return os.path.join(BASE_DIR, 'database.db')


def get_accounts_db():
    return get_database_db()


def get_cart_db():
    return get_database_db()


def get_checkedout_db():
    return get_database_db()


def get_products_db():
    return get_database_db()


# Initialize database
def init_db():
    """Initialize the consolidated SQLite database with all application tables."""
    conn = sqlite3.connect(get_database_db())
    cursor = conn.cursor()

    # Users
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            dob TEXT,
            gender TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Cart
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            product_image TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            user_email TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Completed orders
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            user_name TEXT,
            total_amount REAL NOT NULL,
            delivery_type TEXT,
            delivery_fee REAL DEFAULT 0,
            status TEXT DEFAULT 'pending',
            items TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Products
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            brand TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT NOT NULL,
            category TEXT NOT NULL,
            images TEXT,
            rating REAL DEFAULT 5.0,
            description TEXT,
            sizes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Migration safety net: add columns if upgrading an older products table
    cursor.execute("PRAGMA table_info(products)")
    columns = [column[1] for column in cursor.fetchall()]
    if 'images' not in columns:
        cursor.execute('ALTER TABLE products ADD COLUMN images TEXT')
    if 'description' not in columns:
        cursor.execute('ALTER TABLE products ADD COLUMN description TEXT')
    if 'sizes' not in columns:
        cursor.execute('ALTER TABLE products ADD COLUMN sizes TEXT')

    # Site settings (business config that used to be hardcoded in templates/JS)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')

    # Seed sensible defaults once; INSERT OR IGNORE never clobbers a value
    # that's already been changed (e.g. by an admin).
    default_settings = [
        ('contact_address', 'Tanauan City, Batangas, Philippines'),
        ('contact_phone', '0927 929 1959'),
        ('contact_hours', '10:00 - 18:00, Mon - Sat'),
        ('express_delivery_fee', '80'),
        ('facebook_url', 'https://www.facebook.com/profile.php?id=61566931697897'),
        ('instagram_url', 'https://www.instagram.com/crimsonndonut/?hl=en'),
    ]
    cursor.executemany(
        'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
        default_settings
    )

    conn.commit()
    conn.close()


# Initialize database on app startup
init_db()


def hash_password(password):
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


# ===== AUTHENTICATION ENDPOINTS =====

@app.route('/api/register', methods=['POST'])
def register_user():
    """Register a new user"""
    try:
        data = request.get_json()
        full_name = data.get('full_name')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone', '')
        dob = data.get('dob', '')
        gender = data.get('gender', '')

        if not all([full_name, email, password]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400

        hashed_password = hash_password(password)

        try:
            conn = sqlite3.connect(get_accounts_db())
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO users (full_name, email, password, phone, dob, gender)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (full_name, email, hashed_password, phone, dob, gender))
            conn.commit()
            conn.close()
            return jsonify({"success": True, "message": "User registered successfully"})
        except sqlite3.IntegrityError:
            return jsonify({"success": False, "error": "Email already registered"}), 409
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/login', methods=['POST'])
def login_user():
    """Login a user"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not all([email, password]):
            return jsonify({"success": False, "error": "Missing email or password"}), 400

        hashed_password = hash_password(password)

        conn = sqlite3.connect(get_accounts_db())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT id, full_name, email FROM users WHERE email = ? AND password = ?', (email, hashed_password))
        user = cursor.fetchone()
        conn.close()

        if user:
            return jsonify({
                "success": True,
                "message": "Login successful",
                "user": {
                    "id": user['id'],
                    "full_name": user['full_name'],
                    "email": user['email']
                }
            })
        else:
            return jsonify({"success": False, "error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# NOTE: the old `/accounts.db` debug route used to live here. It returned
# every registered user's data (including hashed passwords) to anyone who
# requested the URL, with no authentication check. It has been removed
# entirely rather than gated, since an unauthenticated data-dump endpoint
# has no safe configuration.


# ===== CART API ENDPOINTS =====

@app.route('/api/cart', methods=['GET'])
def get_cart():
    user_email = request.args.get('user_email')

    if not user_email:
        return jsonify({
            "success": False,
            "error": "User not authenticated"
        }), 401

    conn = sqlite3.connect(get_cart_db())
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute(
        'SELECT * FROM cart WHERE user_email = ? ORDER BY id',
        (user_email,)
    )

    items = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({"success": True, "cart": items})


@app.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    """Add or update item in cart for logged-in user"""
    try:
        data = request.get_json()
        logger.debug(f"Received data: {data}")

        if not data:
            return jsonify({"success": False, "error": "No JSON data provided"}), 400

        # Extract and validate data with type conversion
        try:
            product_id = int(data.get('product_id'))
            product_name = str(data.get('product_name', '')).strip()
            product_image = str(data.get('product_image', '')).strip()
            price = float(data.get('price', 0))
            quantity = int(data.get('quantity', 1))
            user_email = data.get('user_email')

            if not user_email:
                return jsonify({
                    "success": False,
                    "error": "User not authenticated"
                }), 401

            logger.debug(f"Parsed data - ID:{product_id}, Name:{product_name}, Email:{user_email}, Price:{price}")
        except (ValueError, TypeError) as ve:
            logger.debug(f"Type conversion error: {str(ve)}")
            return jsonify({"success": False, "error": f"Invalid data type: {str(ve)}"}), 400

        if not all([product_id, product_name, product_image, price]):
            logger.debug("Missing required fields")
            return jsonify({"success": False, "error": "Missing required fields"}), 400

        cart_db_path = get_cart_db()
        logger.debug(f"Database path: {cart_db_path}")

        cart_conn = sqlite3.connect(cart_db_path)
        cart_cursor = cart_conn.cursor()

        # Check if item already exists for this user
        cart_cursor.execute(
            'SELECT id, quantity FROM cart WHERE product_id = ? AND product_name = ? AND user_email = ?',
            (product_id, product_name, user_email)
        )
        existing = cart_cursor.fetchone()

        if existing:
            # Update quantity
            new_quantity = existing[1] + quantity
            cart_cursor.execute(
                'UPDATE cart SET quantity = ?, updated_at = ? WHERE id = ?',
                (new_quantity, datetime.now(), existing[0])
            )
            logger.debug("Updated quantity for existing item")
        else:
            # Insert new item
            cart_cursor.execute(
                '''INSERT INTO cart (product_id, product_name, product_image, price, quantity, user_email)
                   VALUES (?, ?, ?, ?, ?, ?)''',
                (product_id, product_name, product_image, price, quantity, user_email)
            )
            logger.debug("Inserted new item to cart")

        cart_conn.commit()
        cart_conn.close()
        logger.debug("Successfully added to cart")
        return jsonify({"success": True, "message": "Item added to cart"})
    except Exception as e:
        logger.error(f"ERROR in add_to_cart: {type(e).__name__}: {str(e)}", exc_info=True)
        return jsonify({"success": False, "error": f"Server error: {str(e)}"}), 500


@app.route('/api/cart/update/<int:item_id>', methods=['PUT'])
def update_cart_item(item_id):
    """Update quantity of an item in cart"""
    try:
        data = request.get_json()
        quantity = data.get('quantity', 1)

        if quantity < 1:
            return jsonify({"success": False, "error": "Quantity must be at least 1"}), 400

        cart_conn = sqlite3.connect(get_cart_db())
        cart_cursor = cart_conn.cursor()
        cart_cursor.execute(
            'UPDATE cart SET quantity = ?, updated_at = ? WHERE id = ?',
            (quantity, datetime.now(), item_id)
        )
        cart_conn.commit()
        cart_conn.close()
        return jsonify({"success": True, "message": "Item updated"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/cart/remove/<int:item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    """Remove an item from cart"""
    try:
        cart_conn = sqlite3.connect(get_cart_db())
        cart_cursor = cart_conn.cursor()
        cart_cursor.execute('DELETE FROM cart WHERE id = ?', (item_id,))
        cart_conn.commit()
        cart_conn.close()
        return jsonify({"success": True, "message": "Item removed from cart"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/cart/clear', methods=['DELETE'])
def clear_cart():
    user_email = request.args.get('user_email')

    if not user_email:
        return jsonify({
            "success": False,
            "error": "User not authenticated"
        }), 401

    conn = sqlite3.connect(get_cart_db())
    cursor = conn.cursor()
    cursor.execute('DELETE FROM cart WHERE user_email = ?', (user_email,))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Cart cleared"})


@app.route('/api/cart/all', methods=['GET'])
def get_all_carts():
    """View all cart items with user information (admin view)"""
    try:
        cart_conn = sqlite3.connect(get_cart_db())
        cart_conn.row_factory = sqlite3.Row
        cart_cursor = cart_conn.cursor()

        # Get all cart items sorted by user_email
        cart_cursor.execute('''
            SELECT id, product_id, product_name, product_image, price, quantity, user_email, created_at, updated_at
            FROM cart
            ORDER BY user_email, created_at DESC
        ''')

        items = [dict(row) for row in cart_cursor.fetchall()]
        cart_conn.close()

        # Group items by user email
        carts_by_user = {}
        for item in items:
            user_email = item['user_email'] or 'Guest'
            if user_email not in carts_by_user:
                carts_by_user[user_email] = []
            carts_by_user[user_email].append(item)

        # Now get user details for each email from accounts database
        accounts_conn = sqlite3.connect(get_accounts_db())
        accounts_conn.row_factory = sqlite3.Row
        accounts_cursor = accounts_conn.cursor()

        result = []
        for user_email, cart_items in carts_by_user.items():
            user_info = None
            if user_email != 'Guest':
                accounts_cursor.execute(
                    'SELECT id, full_name, email, phone, created_at FROM users WHERE email = ?',
                    (user_email,)
                )
                user_info = dict(accounts_cursor.fetchone() or {})

            total_items = sum(item['quantity'] for item in cart_items)
            total_price = sum(item['price'] * item['quantity'] for item in cart_items)

            result.append({
                'user_email': user_email,
                'user_info': user_info,
                'cart_items': cart_items,
                'total_items': total_items,
                'total_price': round(total_price, 2)
            })

        accounts_conn.close()

        return jsonify({
            "success": True,
            "total_users": len(result),
            "data": result
        })
    except Exception as e:
        logger.error(f"ERROR in get_all_carts: {str(e)}", exc_info=True)
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/orders/create', methods=['POST'])
def create_order():
    """Create an order from cart items"""
    try:
        data = request.get_json()
        user_email = data.get('user_email')
        user_name = data.get('user_name')
        items = data.get('items', [])
        total_amount = data.get('total_amount', 0)
        delivery_type = data.get('delivery_type', 'standard')
        delivery_fee = data.get('delivery_fee', 0)

        if not user_email or not items:
            return jsonify({"success": False, "error": "Missing user email or items"}), 400

        checkedout_conn = sqlite3.connect(get_checkedout_db())
        checkedout_cursor = checkedout_conn.cursor()

        # Save order to checkedout database
        checkedout_cursor.execute('''
            INSERT INTO orders (user_email, user_name, total_amount, delivery_type, delivery_fee, items, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_email, user_name, total_amount, delivery_type, delivery_fee, json.dumps(items), 'completed'))

        checkedout_conn.commit()
        checkedout_conn.close()
        return jsonify({"success": True, "message": "Order created successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/orders', methods=['GET'])
def view_orders():
    """View all orders in a user-friendly table"""
    try:
        checkedout_conn = sqlite3.connect(get_checkedout_db())
        checkedout_conn.row_factory = sqlite3.Row
        checkedout_cursor = checkedout_conn.cursor()
        checkedout_cursor.execute('SELECT * FROM orders ORDER BY created_at DESC')
        orders = []
        total_revenue = 0

        for row in checkedout_cursor.fetchall():
            order = dict(row)
            # Parse items JSON
            parsed_items = []
            items_count = 0
            try:
                parsed_items = json.loads(order['items'])
                items_count = len(parsed_items)
            except:
                pass

            order['parsed_items'] = parsed_items
            order['items_count'] = items_count
            total_revenue += (order['total_amount'] + (order.get('delivery_fee') or 0))
            orders.append(order)

        checkedout_conn.close()
        return render_template('orders.html', orders=orders, total=len(orders), total_revenue=total_revenue)
    except Exception as e:
        return f"Error: {str(e)}", 500


# ===== PRODUCTS API ENDPOINTS =====

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get products with pagination (8 per page)"""
    try:
        page = request.args.get('page', 1, type=int)
        category = request.args.get('category', '', type=str)

        if page < 1:
            page = 1

        items_per_page = 8
        offset = (page - 1) * items_per_page

        products_conn = sqlite3.connect(get_products_db())
        products_conn.row_factory = sqlite3.Row
        products_cursor = products_conn.cursor()

        # Build query based on category
        if category and category.lower() != 'all':
            products_cursor.execute(
                'SELECT * FROM products WHERE category = ? ORDER BY id LIMIT ? OFFSET ?',
                (category, items_per_page, offset)
            )
            products = [dict(row) for row in products_cursor.fetchall()]
            products_cursor.execute('SELECT COUNT(*) as total FROM products WHERE category = ?', (category,))
            total_count = products_cursor.fetchone()['total']
        else:
            products_cursor.execute(
                'SELECT * FROM products ORDER BY id LIMIT ? OFFSET ?',
                (items_per_page, offset)
            )
            products = [dict(row) for row in products_cursor.fetchall()]
            products_cursor.execute('SELECT COUNT(*) as total FROM products')
            total_count = products_cursor.fetchone()['total']

        total_pages = (total_count + items_per_page - 1) // items_per_page

        products_conn.close()

        return jsonify({
            "success": True,
            "products": products,
            "current_page": page,
            "total_pages": total_pages,
            "total_products": total_count,
            "items_per_page": items_per_page
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/products/add', methods=['POST'])
def add_product():
    """Add a new product"""
    try:
        data = request.get_json()
        name = data.get('name')
        brand = data.get('brand', 'Athletic Divinity')
        price = data.get('price')
        image = data.get('image')
        category = data.get('category')
        rating = data.get('rating', 5.0)
        description = data.get('description', '')
        sizes = data.get('sizes')
        if sizes is not None and not isinstance(sizes, str):
            sizes = json.dumps(sizes)

        if not all([name, price, image, category]):
            return jsonify({"success": False, "error": "Missing required fields"}), 400

        products_conn = sqlite3.connect(get_products_db())
        products_cursor = products_conn.cursor()

        products_cursor.execute('''
            INSERT INTO products (name, brand, price, image, category, rating, description, sizes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (name, brand, price, image, category, rating, description, sizes))

        products_conn.commit()
        products_conn.close()
        return jsonify({"success": True, "message": "Product added successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID"""
    try:
        products_conn = sqlite3.connect(get_products_db())
        products_conn.row_factory = sqlite3.Row
        products_cursor = products_conn.cursor()
        products_cursor.execute('SELECT * FROM products WHERE id = ?', (product_id,))
        product = products_cursor.fetchone()
        products_conn.close()

        if product:
            return jsonify({"success": True, "product": dict(product)})
        else:
            return jsonify({"success": False, "error": "Product not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ===== SETTINGS API ENDPOINT =====

@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get site-wide business settings (contact info, delivery fee, social links)"""
    try:
        conn = sqlite3.connect(get_database_db())
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT key, value FROM settings')
        rows = cursor.fetchall()
        conn.close()

        settings = {row['key']: row['value'] for row in rows}

        return jsonify({"success": True, "settings": settings})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/women')
def women():
    return render_template('women.html')


@app.route('/men')
def men():
    return render_template('men.html')


@app.route('/accesories')
def accesories():
    return render_template('accesories.html')


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/cart')
def cart():
    return render_template('cart.html')


@app.route('/checkout')
def checkout():
    return render_template('checkout.html')


@app.route('/register')
def register():
    email = request.args.get('email', '')
    return render_template('register.html', email=email)


@app.route('/product')
def sproduct():
    return render_template('sproduct.html')


@app.route('/terms')
def terms():
    return render_template('terms.html')


@app.route('/admin')
def admin_dashboard():
    """Admin dashboard page"""
    return render_template('admin.html')


@app.route('/api/admin/data', methods=['GET'])
def get_admin_data():
    """Get all database items for admin dashboard"""
    try:
        # Get all accounts
        accounts_conn = sqlite3.connect(get_accounts_db())
        accounts_conn.row_factory = sqlite3.Row
        accounts_cursor = accounts_conn.cursor()
        accounts_cursor.execute('SELECT id, full_name, email, phone, dob, gender, created_at FROM users')
        accounts = [dict(row) for row in accounts_cursor.fetchall()]
        accounts_conn.close()

        # Get all cart items
        cart_conn = sqlite3.connect(get_cart_db())
        cart_conn.row_factory = sqlite3.Row
        cart_cursor = cart_conn.cursor()
        cart_cursor.execute('''
            SELECT id, product_id, product_name, product_image, price, quantity, user_email, created_at
            FROM cart
            ORDER BY user_email, created_at DESC
        ''')
        cart_items = [dict(row) for row in cart_cursor.fetchall()]
        cart_conn.close()

        # Get all orders (checkouts)
        checkedout_conn = sqlite3.connect(get_checkedout_db())
        checkedout_conn.row_factory = sqlite3.Row
        checkedout_cursor = checkedout_conn.cursor()
        checkedout_cursor.execute('''
            SELECT id, user_email, user_name, total_amount, delivery_type, delivery_fee, status, items, created_at
            FROM orders
            ORDER BY created_at DESC
        ''')
        orders = [dict(row) for row in checkedout_cursor.fetchall()]
        checkedout_conn.close()

        return jsonify({
            "success": True,
            "accounts": {
                "total": len(accounts),
                "data": accounts
            },
            "cart_items": {
                "total": len(cart_items),
                "data": cart_items
            },
            "checkouts": {
                "total": len(orders),
                "data": orders
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 9090))
    print(f"Local URL: http://localhost:{port}")

    # debug=False for production. Flask's interactive debugger (enabled by
    # debug=True) lets anyone who triggers a server error run arbitrary
    # Python on the host, so it must stay off outside local development.
    # In production this app is meant to be served via gunicorn (see
    # requirements.txt) — `gunicorn app:app` — rather than this dev server.
    app.run(debug=False, host='0.0.0.0', port=port)
