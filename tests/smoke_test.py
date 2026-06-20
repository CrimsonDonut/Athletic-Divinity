from playwright.sync_api import sync_playwright
import json

BASE = "http://127.0.0.1:5000"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Accept any alert dialogs automatically
    page.on("dialog", lambda dialog: dialog.accept())

    # Home page
    page.goto(f"{BASE}/")
    page.wait_for_selector('.pro')
    pro_count = len(page.query_selector_all('.pro'))
    print(f"Found {pro_count} products on home page")

    # Open size modal for a product that needs size (id=1)
    selector_size_prod = ".pro[data-id='1'] a"
    page.click(selector_size_prod)
    # Wait for modal to appear
    page.wait_for_selector('#sizeModal.show, #sizeModal', state='visible')
    print("Size modal opened")

    # choose size and confirm
    page.select_option('#sizeSelect', 'M')
    page.click('#confirmSizeBtn')

    # Give script a moment to update localStorage
    page.wait_for_timeout(500)
    cart = page.evaluate("() => JSON.parse(localStorage.getItem('cart') || '[]')")
    print("Cart after size-confirm:", cart)

    # Click an accessory (id=9) which should add directly
    selector_acc = ".pro[data-id='9'] a"
    page.click(selector_acc)
    page.wait_for_timeout(300)
    cart = page.evaluate("() => JSON.parse(localStorage.getItem('cart') || '[]')")
    print("Cart after accessory add:", cart)

    # Go to cart page and verify rows
    page.goto(f"{BASE}/cart")
    page.wait_for_selector('#cart tbody')
    rows = page.query_selector_all('#cart tbody tr')
    print(f"Cart rows in table: {len(rows)}")

    # Proceed to checkout
    page.click('.checkout-btn')
    page.wait_for_url(f"{BASE}/checkout")
    print("Arrived at checkout")

    # Fill required checkout fields then place order
    page.fill('#fullName', 'Test Buyer')
    page.fill('#email', 'test@example.com')
    page.fill('#phone', '09171234567')
    page.fill('#address', '123 Test St')
    page.click('#placeOrderBtn')
    page.wait_for_url(f"{BASE}/")
    print("Order placed and redirected to home")

    browser.close()
