import requests
import re

print("Testing if products are displaying in HTML...\n")

# Test all pages
pages = [
    ('http://localhost:9090/', 'Home'),
    ('http://localhost:9090/men', 'Men'),
    ('http://localhost:9090/women', 'Women'),
    ('http://localhost:9090/accesories', 'Accessories'),
]

for url, page_name in pages:
    response = requests.get(url)
    html = response.text
    
    # Count product cards using simple regex
    pro_divs = re.findall(r'<div class="pro"', html)
    product_names = re.findall(r'<h5>([^<]+)</h5>', html)
    
    print(f"{page_name} page:")
    print(f"  - Status: {response.status_code}")
    print(f"  - Product cards found: {len(pro_divs)}")
    print(f"  - Product names found: {len(product_names)}")
    if product_names:
        print(f"  - Examples: {', '.join(product_names[:3])}")
    print()