const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

// These will be selected after DOM loads
let loginLink, loginModal, closeBtn, registerLink, logoutLink, userNameLink;
let registerModal, closeRegister, openRegister, openLogin;
let MainImg;
let selectedProductId, selectedProductImg;

// Function to update login/logout UI
function updateAuthUI() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (loggedInUser) {
    try {
      const user = JSON.parse(loggedInUser);
      // User is logged in
      if (loginLink) loginLink.style.display = 'none';
      if (registerLink) registerLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = 'inline';
      if (userNameLink) {
        userNameLink.style.display = 'inline';
        userNameLink.textContent = user.full_name || user.email;
        userNameLink.href = '#';
        userNameLink.style.pointerEvents = 'none';
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  } else {
    // User is not logged in
    if (loginLink) loginLink.style.display = 'inline';
    if (registerLink) registerLink.style.display = 'inline';
    if (logoutLink) logoutLink.style.display = 'none';
    if (userNameLink) userNameLink.style.display = 'none';
  }
}

// Update on page load
document.addEventListener('DOMContentLoaded', () => {
  // Define helper function
  function safeAddListener(el, event, handler) {
    if (!el) return;
    el.addEventListener(event, handler);
  }
  
  // Select elements after DOM is ready
  loginLink = document.getElementById('loginLink');
  loginModal = document.getElementById('loginModal');
  closeBtn = document.getElementById('closeModal');
  registerLink = document.getElementById('registerLink');
  logoutLink = document.getElementById('logoutLink');
  userNameLink = document.getElementById('userNameLink');
  registerModal = document.getElementById('registerModal');
  closeRegister = document.getElementById('closeRegister');
  openRegister = document.getElementById('openRegister');
  openLogin = document.getElementById('openLogin');
  MainImg = document.getElementById("MainImg");
  
  updateAuthUI();
  
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const namePattern = /^[A-Za-z\s]+$/;
    
function setupValidation(inputId, iconId, type) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;

  input.addEventListener('input', () => {
    let isValid = false;

    if (type === 'email') {
      isValid = emailPattern.test(input.value.trim());
    } 
    else if (type === 'name') {
      isValid = namePattern.test(input.value.trim());
    } 
    else if (type === 'password') {
      isValid = input.value.length >= 6;
    }

    icon.style.opacity = '1';
    icon.style.color = isValid ? 'green' : 'red';
  });
}

  setupValidation('loginEmail', 'loginIcon', 'email');
  setupValidation('loginPassword', 'loginPasswordIcon', 'password');
  setupValidation('registerName', 'registerNameIcon', 'name');
  setupValidation('registerEmail', 'regIcon', 'email');
  setupValidation('registerPassword', 'registerPasswordIcon', 'password');
  
  // Login button handler
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('loginEmail');
      const passwordInput = document.getElementById('loginPassword');
      
      if (!emailInput?.value || !passwordInput?.value) {
        alert('Please fill in all fields');
        return;
      }
      
      fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailInput.value,
          password: passwordInput.value
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('loggedInUser', JSON.stringify(data.user));
          alert("✅ Login successful!");
          if (loginModal) loginModal.classList.remove('show');
          document.body.classList.remove('modal-active');
          location.reload();
        } else {
          alert("❌ " + (data.error || "Login failed"));
        }
      })
      .catch(err => alert("❌ Error: " + err.message));
    });
  }
  
const registerBtn = document.getElementById('registerBtn');
if (registerBtn) {
  registerBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const name = document.getElementById("registerName")?.value.trim()
          || document.getElementById("fullName")?.value.trim();

    const email = document.getElementById("registerEmail")?.value.trim();
    const password = document.getElementById("registerPassword")?.value.trim();

    if (!name || !email || !password) {
      alert("Please fill in all fields");
      return;
    }

    localStorage.setItem("regName", name);
    localStorage.setItem("regEmail", email);
    localStorage.setItem("regPassword", password);

    window.location.href = "/register";
  });
}

  
  // Open login modal
  safeAddListener(loginLink, 'click', (e) => {
    e.preventDefault();
    if (loginModal) {
      loginModal.classList.add('show');
      document.body.classList.add('modal-active');
    }
  });

  // Logout handler
  safeAddListener(logoutLink, 'click', (e) => {
    e.preventDefault();
    const loggedInUser = localStorage.getItem('loggedInUser');
    const userEmail = loggedInUser ? JSON.parse(loggedInUser).email : '';
    
    if (userEmail) {
      fetch(`/api/cart?user_email=${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
          console.log("Cart data:", data);
        })
        .catch(err => console.error("Error fetching cart:", err));
    }


    localStorage.removeItem('loggedInUser');
    alert("👋 You have been logged out");
    updateAuthUI();
    location.reload();
  });

  // Open register modal (footer link)
  safeAddListener(registerLink, 'click', (e) => {
    e.preventDefault();
    if (registerModal) {
      registerModal.classList.add('show');
      document.body.classList.add('modal-active');
    }
  });

  // Close login modal
  safeAddListener(closeBtn, 'click', () => {
    if (loginModal) {
      loginModal.classList.remove('show');
      document.body.classList.remove('modal-active');
    }
  });

  // Close register modal
  safeAddListener(closeRegister, 'click', () => {
    if (registerModal) {
      registerModal.classList.remove('show');
      document.body.classList.remove('modal-active');
    }
  });

  // Switch from register to login
  safeAddListener(openLogin, 'click', (e) => {
    e.preventDefault();
    if (registerModal) registerModal.classList.remove('show');
    if (loginModal) loginModal.classList.add('show');
  });

  // Switch from login to register
  safeAddListener(openRegister, 'click', (e) => {
    e.preventDefault();
    if (loginModal) loginModal.classList.remove('show');
    if (registerModal) registerModal.classList.add('show');
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      loginModal.classList.remove('show');
      document.body.classList.remove('modal-active');
    }
    if (e.target === registerModal) {
      registerModal.classList.remove('show');
      document.body.classList.remove('modal-active');
    }
  });

  // Product cards - handle clicks for adding to cart with size modal
  attachProductCardHandlers();

  updateCartBadge();
});

// Helper function to normalize image paths
function normalizeImagePath(imagePath) {
  if (!imagePath) return '';
  
  // Remove full URLs (http://... or https://...)
  if (imagePath.includes('http://') || imagePath.includes('https://')) {
    // Extract just the path after the domain
    const url = new URL(imagePath);
    imagePath = url.pathname;
  }
  
  // Ensure /static/ prefix
  if (!imagePath.startsWith('/static/')) {
    imagePath = '/static/' + imagePath;
  }
  
  return imagePath;
}

function attachProductCardHandlers() {
  const productCards = document.querySelectorAll('.pro');
  if (productCards && productCards.length) {
    productCards.forEach(card => {
      // Skip if already has handlers (check for a custom attribute)
      if (card.dataset.handlersAttached === 'true') {
        return;
      }
      
      const productId = parseInt(card.dataset.id);
      const button = card.querySelector('a');
      const img = card.querySelector('img');
      
      // Validate product ID
      if (!productId || isNaN(productId)) {
        console.warn('Invalid product ID on card:', card.dataset.id);
        return;
      }
      
      // Get product info from dynamically loaded products array
      let product = products.find(p => p.id === productId);
      let isAccessory = false;
      let needsSize = false;
      
      // If product exists in loaded array, determine properties from it
      if (product && product.category) {
        isAccessory = product.category.includes("Accessories") || product.category.includes("accessories");
        needsSize = !isAccessory && [1,2,3,4,5,6,7,8,14,15,16,17,18,19].includes(productId);
      }

      // HANDLER 1: Click on the card itself (not the button) - navigate to product page
      card.addEventListener('click', (e) => {
        // Don't navigate if clicking on the button itself
        if (e.target === button || button?.contains(e.target)) {
          return;
        }
        
        // Navigate to product detail page using product ID
        console.debug(`Navigating to product ${productId}`);
        window.location.href = `/product?id=${productId}`;
      });

      // HANDLER 2: Click on the hand icon button
      button?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (needsSize) {
          // Open size modal
          selectedProductId = productId;
          selectedProductImg = img?.src;
          const sizeModal = document.getElementById("sizeModal");
          const sizePreviewImg = document.getElementById("sizePreviewImg");
          if (sizePreviewImg && selectedProductImg) sizePreviewImg.src = selectedProductImg;
          if (sizeModal) sizeModal.classList.add("show");
          return;
        }

        // Otherwise, add to cart directly
        addToCart(productId);
        showAddToCartVisual(card);
      });
      
      // Mark as handled to prevent duplicate listeners
      card.dataset.handlersAttached = 'true';
    });
  }
}

// ===========================
// HELPER FUNCTIONS
// ===========================

function updateCartBadge() {
  // Get logged-in user email
  const loggedInUser = localStorage.getItem('loggedInUser');
  const userEmail = loggedInUser ? JSON.parse(loggedInUser).email : '';
  
  // Fetch cart from database for logged-in user only
  const cartUrl = userEmail ? `/api/cart?user_email=${encodeURIComponent(userEmail)}` : '/api/cart';
  
  fetch(cartUrl)
    .then(response => response.json())
    .then(data => {
      if (!data.success) throw new Error(data.error);
      
      const cart = data.cart || [];
      const Dbadge = document.getElementById("cart-count");
      const Mbadge = document.getElementById("cart-count-m");
      
      // Count total quantity of ALL items
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      
      [Dbadge, Mbadge].forEach(badge => {
        if (!badge) return;
        if (totalItems > 0) {
          badge.textContent = totalItems;
          badge.style.display = "flex";
        } else {
          badge.style.display = "none";
        }
      });
    })
    .catch(err => console.error("Error updating cart badge:", err));
}

function showAddToCartVisual(cardElement) {
  const pop = document.createElement("div");
  pop.className = "added-pop-card";
  pop.textContent = "Added to cart!";
  
  // Attach inside the product card
  cardElement.style.position = "relative"; // ensures positioning works
  cardElement.appendChild(pop);
  
  // Remove after animation
  setTimeout(() => pop.remove(), 900);
}

function playAddToCartSound() {
  try {
    const audio = new Audio('/static/sound/add-to-cart.mp3');
    audio.volume = 0.4;
    audio.play().catch(err => console.warn("Audio playback blocked:", err));
  } catch (err) {
    console.error("Audio error:", err);
  }
}

// ===========================
// ADD TO CART FUNCTION
// ===========================
function addToCart(productId, quantity = 1) {
  // Get logged-in user email
  const loggedInUser = localStorage.getItem('loggedInUser');
  const userEmail = loggedInUser ? JSON.parse(loggedInUser).email : '';
  
  // Check if user is logged in first
  if (!userEmail) {
    alert('🔐 Please log in to add items to your cart. Create an account or log in to get started!');
    return;
  }
  
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  // Get the image path and ensure it has /static/ prefix
  let imagePath = product.images[0].src;
  if (!imagePath.startsWith('/static/')) {
    imagePath = '/static/' + imagePath;
  }
  
  const cartItem = {
    product_id: product.id,
    product_name: product.images[0].label,
    product_image: imagePath,
    price: product.price,
    quantity: quantity,
    user_email: userEmail
  };
  
  fetch('/api/cart/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cartItem)
  })
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        alert('❌ ' + (data.error || 'Failed to add item to cart'));
        return;
      }
      
      playAddToCartSound();
      updateCartBadge();
    })
    .catch(err => {
      console.error("Error adding to cart:", err);
      alert('❌ An error occurred while adding to cart');
    });
}

// ===========================
// SIZE MODAL HANDLERS
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  // Close size modal
  const closeSizeModal = document.getElementById('closeSizeModal');
  if (closeSizeModal) {
    closeSizeModal.addEventListener('click', () => {
      const sizeModal = document.getElementById('sizeModal');
      if (sizeModal) sizeModal.classList.remove('show');
    });
  }

  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    const sizeModal = document.getElementById('sizeModal');
    if (event.target === sizeModal) {
      sizeModal.classList.remove('show');
    }
  });

  // Handle size selection buttons
  const sizeButtons = document.querySelectorAll('.size-option');
  sizeButtons.forEach(button => {
    button.addEventListener('click', () => {
      sizeButtons.forEach(b => b.classList.remove('selected'));
      button.classList.add('selected');
      const sizeSelect = document.getElementById('sizeSelect');
      if (sizeSelect) {
        sizeSelect.value = button.dataset.size;
      }
    });
  });

  // Confirm size handler
  const confirmSizeBtn = document.getElementById('confirmSizeBtn');
  if (confirmSizeBtn) {
    confirmSizeBtn.addEventListener('click', () => {
      const size = document.getElementById('sizeSelect').value;

      if (!size) {
        alert('Please select a size first!');
        return;
      }

      // Get logged-in user email
      const loggedInUser = localStorage.getItem('loggedInUser');
      const userEmail = loggedInUser ? JSON.parse(loggedInUser).email : '';

      // Check if user is logged in first
      if (!userEmail) {
        alert('🔐 Please log in to add items to your cart. Create an account or log in to get started!');
        return;
      }

      const product = products.find(p => p.id === selectedProductId);

      if (!product) return;

      // Prepare cart item data
      const cartItem = {
        product_id: product.id,
        product_name: product.images[0].label + ` (Size: ${size})`,
        product_image: selectedProductImg,
        price: product.price,
        quantity: 1,
        user_email: userEmail
      };

      // Add to cart via API
      fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cartItem)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          if (!data.success) throw new Error(data.error || 'Unknown error');
          
          playAddToCartSound();
          updateCartBadge();

          // Try to use actual product card (homepage)
          let popupTarget = document.querySelector(`.pro[data-id='${selectedProductId}']`);

          // If not found, use product details (sproduct.html)
          if (!popupTarget) {
            popupTarget = document.querySelector(".single-pro-details");
          }

          if (popupTarget) {
            showAddToCartVisual(popupTarget);
          }

          // Close modal
          const sizeModal = document.getElementById('sizeModal');
          if (sizeModal) sizeModal.classList.remove('show');
        })
        .catch(err => {
          console.error('Error adding to cart:', err);
          alert('❌ Error adding item to cart: ' + err.message);
        });
    });
  }
});

// Safe small image handlers — only attach when elements exist
document.addEventListener('DOMContentLoaded', () => {
  if (!MainImg) return;
  const thumbs = document.getElementsByClassName('small-img');
  if (!thumbs || thumbs.length === 0) return;
  
  // convert HTMLCollection to array for safe iteration
  Array.from(thumbs).forEach(thumb => {
    thumb.addEventListener('click', () => {
      if (thumb && thumb.src) MainImg.src = thumb.src;
    });
  });
});

function multiply(q, p) {
  let result = parseFloat(q.value) * parseFloat(p.value);
  if (isNaN(result) || result < 1) return '₱0.00';
  else return '₱' + result.toFixed(2);
}

// Mobile menu toggle for small screens

if (bar) {
  bar.addEventListener('click', () => {
    nav.classList.add('active')
  })
}

if (close) {
  close.addEventListener('click', () => {
    nav.classList.remove('active')
  })
}

// Initialize products array - will be populated dynamically from API
let products = [];

// Fetch all products from API and populate the array
async function loadProductsFromAPI() {
  try {
    let allProducts = [];
    let page = 1;
    let totalPages = 1;
    
    // Fetch all pages of products
    while (page <= totalPages) {
      const response = await fetch(`/api/products?page=${page}`);
      const data = await response.json();
      
      if (data.success && data.products) {
        allProducts = allProducts.concat(data.products);
        totalPages = data.total_pages || 1;
        page++;
      } else {
        break;
      }
    }
    
    // Transform API response to match expected product structure
    products = allProducts.map(product => {
      // Parse images JSON if it's a string, otherwise use as-is
      let parsedImages = [];
      if (product.images) {
        try {
          parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        } catch (e) {
          console.warn('Could not parse images for product', product.id);
          parsedImages = [];
        }
      }
      
      // If no images in JSON, create array with main image
      if (parsedImages.length === 0 && product.image) {
        parsedImages = [
          {
            src: product.image,
            label: product.name
          }
        ];
      }
      
      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        description: product.description || '',
        images: parsedImages
      };
    });
    
    console.log('Loaded', products.length, 'products from API');
  } catch (error) {
    console.error('Error loading products from API:', error);
  }
}

// Load products when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProductsFromAPI);
} else {
  loadProductsFromAPI();
}

function updateCartBadge() {
  // Get logged-in user email
  const loggedInUser = localStorage.getItem('loggedInUser');
  const userEmail = loggedInUser ? JSON.parse(loggedInUser).email : '';
  
  // Fetch cart from database for logged-in user only
  const cartUrl = userEmail ? `/api/cart?user_email=${encodeURIComponent(userEmail)}` : '/api/cart';
  
  fetch(cartUrl)
    .then(response => response.json())
    .then(data => {
      if (!data.success) throw new Error(data.error);
      
      const cart = data.cart || [];
      const Dbadge = document.getElementById("cart-count");
      const Mbadge = document.getElementById("cart-count-m");
      
      // Count total quantity of ALL items
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      
      [Dbadge, Mbadge].forEach(badge => {
        if (!badge) return;
        if (totalItems > 0) {
          badge.textContent = totalItems;
          badge.style.display = "flex";
        } else {
          badge.style.display = "none";
        }
      });
    })
    .catch(err => console.error("Error updating cart badge:", err));
}


function showAddToCartVisual(cardElement) {
  const pop = document.createElement("div");
  pop.className = "added-pop-card";
  pop.textContent = "Added to cart!";
  
  // Attach inside the product card
  cardElement.style.position = "relative"; // ensures positioning works
  cardElement.appendChild(pop);
  
  // Remove after animation
  setTimeout(() => pop.remove(), 900);
}


// === SOUND EFFECT FUNCTION ===
function playAddToCartSound() {
  try {
    const audio = new Audio('sound/cart-add.mp3'); // Make sure this file exists in /sound/
    audio.volume = 0.4; // adjust volume
    audio.play().catch(err => console.warn("Audio playback blocked:", err));
  } catch (err) {
    console.error("Audio error:", err);
  }
}


// Function to add item to cart
// ===========================
// ADD TO CART (PRODUCT PAGES)
// ===========================
function addToCart(productId, quantity = 1) {
  // Get logged-in user email
  const loggedInUser = localStorage.getItem('loggedInUser');
  const userEmail = loggedInUser ? JSON.parse(loggedInUser).email : '';
  
  // Check if user is logged in first
  if (!userEmail) {
    alert('🔐 Please log in to add items to your cart. Create an account or log in to get started!');
    return;
  }
  
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  // Get the image path and ensure it has /static/ prefix
  let imagePath = product.images[0].src;
  if (!imagePath.startsWith('/static/')) {
    imagePath = '/static/' + imagePath;
  }
  
  const cartItem = {
    product_id: product.id,
    product_name: product.images[0].label,
    product_image: imagePath,
    price: product.price,
    quantity: quantity,
    user_email: userEmail
  };
  
  fetch('/api/cart/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cartItem)
  })
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        alert('❌ ' + (data.error || 'Failed to add item to cart'));
        return;
      }
      
      playAddToCartSound();
      updateCartBadge();
    })
    .catch(err => {
      console.error("Error adding to cart:", err);
      alert('❌ An error occurred while adding to cart');
    });
}


document.addEventListener('DOMContentLoaded', () => {
  // Fetch and display products on product pages (women, men, accessories)
  if (window.location.pathname.includes("/women") || window.location.pathname.includes("/men") || window.location.pathname.includes("/accesories")) {
    // Product page logic here
  }
});

// Product page logic is now handled by sproduct.html template using the API

// ===== Checkout Page Logic (runs only on /checkout) =====
document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.pathname.includes("/checkout")) return;

  const orderItemsEl = document.getElementById("order-items");
  const itemsTotalEl = document.getElementById("itemsTotal");
  const deliveryFeeEl = document.getElementById("deliveryFee");
  const grandTotalEl = document.getElementById("grandTotal");
  const barTotalEl = document.getElementById("barTotal");

  const placeOrderBtn = document.getElementById("placeOrderBtn");

  let cart = [];

  function format(n) {
    return "₱" + Number(n).toFixed(2);
  }

  function renderSummary() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) return;

    const userEmail = JSON.parse(loggedInUser).email;

    fetch(`/api/cart?user_email=${encodeURIComponent(userEmail)}`, {
      method: 'GET'
    })

      .then(response => response.json())
      .then(data => {
        if (!data.success) throw new Error(data.error);
        
        cart = data.cart || [];
        orderItemsEl.innerHTML = "";

        let itemsTotal = 0;

        cart.forEach(item => {
          const subtotal = item.price * item.quantity;
          itemsTotal += subtotal;
          const normalizedImagePath = normalizeImagePath(item.product_image);

          orderItemsEl.innerHTML += `
            <div class="order-row">
              <img src="${normalizedImagePath}" />
              <div class="info">
                <div class="name">${item.product_name}</div>
                <div class="meta">Qty: ${item.quantity}</div>
              </div>
              <div class="price">${format(subtotal)}</div>
            </div>
          `;
        });

        const delivery = document.querySelector("input[name='delivery']:checked")?.value || "standard";
        const deliveryFee = delivery === "express" ? 80 : 0;

        itemsTotalEl.textContent = format(itemsTotal);
        deliveryFeeEl.textContent = format(deliveryFee);
        grandTotalEl.textContent = format(itemsTotal + deliveryFee);
        barTotalEl.textContent = format(itemsTotal + deliveryFee);
      })
      .catch(err => console.error("Error loading cart:", err));
  }

  // recalc when delivery type changes
  document.querySelectorAll("input[name='delivery']").forEach(radio => {
    radio.addEventListener("change", renderSummary);
  });

  renderSummary();

  // Place Order button
  placeOrderBtn.addEventListener("click", () => {
    if (!cart.length) return alert("❌ Your cart is empty.");

    // Validate form fields
    const addressField = document.getElementById('address');
    const paymentMethod = document.querySelector("input[name='payment']:checked");

    if (!addressField || !addressField.value.trim()) {
      return alert("Please enter a shipping address.");
    }

    if (!paymentMethod) {
      return alert("Please select a payment method.");
    }

    // Get logged-in user info
    const loggedInUserStr = localStorage.getItem('loggedInUser');
    
    // Check if user is logged in
    if (!loggedInUserStr) {
      alert("❌ Please login first before placing an order!");
      // Open login modal if available
      const loginModal = document.getElementById('loginModal');
      if (loginModal) {
        loginModal.classList.add('show');
        document.body.classList.add('modal-active');
      }
      return;
    }

    let userEmail = null;
    let userName = null;
    
    try {
      const user = JSON.parse(loggedInUserStr);
      userEmail = user.email;
      userName = user.full_name;
    } catch (e) {
      console.error('Error parsing user data:', e);
      alert("❌ Error reading user information. Please login again.");
      return;
    }

    // Calculate totals
    let itemsTotal = 0;
    const items = [];
    cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      itemsTotal += subtotal;
      items.push({
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        subtotal: subtotal
      });
    });

    const delivery = document.querySelector("input[name='delivery']:checked")?.value || "standard";
    const deliveryFee = delivery === "express" ? 80 : 0;
    const grandTotal = itemsTotal + deliveryFee;

    // Create order
    const orderData = {
      user_email: userEmail,
      user_name: userName,
      items: items,
      total_amount: grandTotal,
      delivery_type: delivery,
      delivery_fee: deliveryFee,
      shipping_address: addressField.value.trim(),
      payment_method: paymentMethod.value
    };

    fetch('/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("✅ Order placed successfully!");
        
        // Clear cart after order is created
        return fetch(`/api/cart/clear?user_email=${encodeURIComponent(userEmail)}`, { method: 'DELETE' });
      } else {
        alert("❌ " + (data.error || "Failed to place order"));
        throw new Error(data.error);
      }
    })
    .then(response => response.json())
    .then(data => {
      // Redirect to index page after successful checkout
      window.location.href = "/";
    })
    .catch(err => {
      console.error("Error:", err);
      alert("❌ An error occurred during checkout. Please try again.");
    });
  });
});


// ONLY RUN THIS on cart page
if (window.location.pathname.includes("/cart")) {

  document.addEventListener("DOMContentLoaded", () => {
    const checkoutBtn = document.querySelector(".checkout-btn");
    if (!checkoutBtn) return;

    checkoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/checkout";
    });
  });

}



// === RENDER CART PAGE ===
if (window.location.pathname.includes("/cart")) {
  document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector("#cart tbody");
    const totalDisplay = document.querySelector("#cart-summary h3");
    
    if (!tbody || !totalDisplay) return; // safety check
    
    function renderCart() {
      const loggedInUser = localStorage.getItem('loggedInUser');
      if (!loggedInUser) return;

      const userEmail = JSON.parse(loggedInUser).email;

      fetch(`/api/cart?user_email=${encodeURIComponent(userEmail)}`)

        .then(response => response.json())
        .then(data => {
          if (!data.success) throw new Error(data.error);
          
          const cart = data.cart || [];
          
          if (cart.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="empty-cart">Your cart is empty.</td></tr>`;
            totalDisplay.textContent = "Total: ₱0.00";
            return;
          }
          
          tbody.innerHTML = "";
          let total = 0;
          
          cart.forEach((item) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            
            const row = document.createElement("tr");
            const normalizedImagePath = normalizeImagePath(item.product_image);
            row.innerHTML = `
            <td><a href="#" class="remove" data-item-id="${item.id}"><i class="fa-regular fa-circle-xmark"></i></a></td>
            <td><img src="${normalizedImagePath}" alt="${item.product_name}"></td>
            <td>${item.product_name}</td>
            <td>₱${item.price}</td>
            <td><input type="number" min="1" max="99" value="${item.quantity}" data-item-id="${item.id}" class="qty"></td>
            <td class="subtotal">₱${subtotal.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
          });
          
          totalDisplay.textContent = `Total: ₱${total.toFixed(2)}`;
          
          // ✅ Update quantity
          tbody.removeEventListener("input", quantityHandler);
          tbody.addEventListener("input", quantityHandler);
          
          // ✅ Remove item
          tbody.removeEventListener("click", removeHandler);
          tbody.addEventListener("click", removeHandler);
        })
        .catch(err => console.error("Error loading cart:", err));
    }
    
    function quantityHandler(e) {
      if (e.target.classList.contains("qty")) {
        const itemId = e.target.dataset.itemId;
        const newQuantity = parseInt(e.target.value) || 1;
        
        fetch(`/api/cart/update/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity: newQuantity })
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              renderCart();
            }
          })
          .catch(err => console.error("Error updating quantity:", err));
      }
    }
    
    function removeHandler(e) {
      if (e.target.closest(".remove")) {
        e.preventDefault();
        const itemId = e.target.closest(".remove").dataset.itemId;
        
        fetch(`/api/cart/remove/${itemId}`, {
          method: 'DELETE'
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              renderCart();
              updateCartBadge();
            }
          })
          .catch(err => console.error("Error removing item:", err));
      }
    }
    
    renderCart();
  });
}

// ✅ CHOOSE FOR ME FEATURE — RANDOM OUTFIT PICKER
if (window.location.pathname.includes("/cart")) {
  
  document.addEventListener("DOMContentLoaded", async () => {
    
    const pushBtn = document.getElementById("pushButton");
    const chooseBtn = document.getElementById("btn");
    const resetBtn = document.getElementById("resetChoice");
    const resultBox = document.getElementById("randomPickResult");
    
    // ✅ Get user email from localStorage
    const loggedInUser = localStorage.getItem('loggedInUser');
    const userEmail = loggedInUser ? JSON.parse(loggedInUser).email : null;
    
    // Wait for products to load from API before setting up event listeners
    console.log('Choice feature waiting for products... Current count:', products.length);
    
    let menProducts = [];
    let womenProducts = [];
    let accessoryProducts = [];
    
    // Wait for products to load with a timeout
    let waitTime = 0;
    while (products.length === 0 && waitTime < 5000) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitTime += 100;
    }
    
    console.log('Products loaded. Total:', products.length);
    
    // ✅ Filter products by actual database categories
    menProducts = products.filter(p => p.category === "men");
    womenProducts = products.filter(p => p.category === "women");
    accessoryProducts = products.filter(p => p.category === "accessories");
    
    console.log('Filtered products - Men:', menProducts.length, 'Women:', womenProducts.length, 'Accessories:', accessoryProducts.length);
    
    // ✅ Helper function to pick random element
    function pickRandom(arr) {
      if (!arr || arr.length === 0) return null;
      return arr[Math.floor(Math.random() * arr.length)];
    }
    
    // ✅ Choose For Me button
    chooseBtn.addEventListener("click", () => {
      console.log('Choose For Me clicked - Men:', menProducts.length, 'Women:', womenProducts.length, 'Accessories:', accessoryProducts.length);
      
      if (!pushBtn.checked) {
        alert("Please check PUSH BUTTON first!");
        return;
      }
      
      const menItem = pickRandom(menProducts);
      const womenItem = pickRandom(womenProducts);
      const accessory = pickRandom(accessoryProducts);
      
      console.log('Picked items - Men:', menItem?.name, 'Women:', womenItem?.name, 'Accessory:', accessory?.name);
      
      if (!menItem || !womenItem || !accessory) {
        alert("Not enough products found to make a random outfit!\nNeeded: Men (" + menProducts.length + "), Women (" + womenProducts.length + "), Accessories (" + accessoryProducts.length + ")");
        return;
      }
      
      // ✅ Add to cart: always use quantity = 1
      [menItem, womenItem, accessory].forEach(item => addToCart(item.id, 1));
      
      // ✅ Get first image label or product name as fallback
      const menLabel = (menItem.images && menItem.images[0]) ? menItem.images[0].label : menItem.name;
      const womenLabel = (womenItem.images && womenItem.images[0]) ? womenItem.images[0].label : womenItem.name;
      const accessoryLabel = (accessory.images && accessory.images[0]) ? accessory.images[0].label : accessory.name;
      
      resultBox.innerHTML = `
      <h4 style="color:#e6ac0f">Random Outfit Added!</h4>
      <p>${menLabel}</p>
      <p>${womenLabel}</p>
      <p>${accessoryLabel}</p>
      <p style="font-size:13px;opacity:0.8;">(Scroll down to cart to see your items)</p>
      `;
      
      // ✅ Refresh cart display totals
      setTimeout(() => location.reload(), 400);
    });
    
    // ✅ RESET BUTTON — Clears entire cart
    resetBtn.addEventListener("click", () => {
      if (!userEmail) {
        alert("You must be logged in to clear your cart!");
        return;
      }
      
      // Clear the cart from database
      fetch(`/api/cart/clear?user_email=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Reset the UI
            pushBtn.checked = false;
            resultBox.innerHTML = "";
            alert("Cart cleared!");
            
            // Reload to update cart visually
            setTimeout(() => location.reload(), 200);
          } else {
            alert("Cart cleared!");
            setTimeout(() => location.reload(), 200);
          }
        })
        .catch(err => {
          console.error("Error clearing cart:", err);
          alert("Cart cleared!");
          // Still reload even if there's an error
          setTimeout(() => location.reload(), 200);
        });
    });
    
  });
}


// ====== Safe registration autofill + submit handler ======
document.addEventListener("DOMContentLoaded", () => {
  // Load saved values from localStorage into the register page form
  const fullNameEl = document.getElementById("full_name");
  if (fullNameEl) fullNameEl.value = localStorage.getItem("regName") || "";
  
  const emailEl = document.getElementById("email");
  if (emailEl) emailEl.value = localStorage.getItem("regEmail") || "";
  
  const passwordEl = document.getElementById("password");
  if (passwordEl) passwordEl.value = localStorage.getItem("regPassword") || "";
  
  // Register form submit handler — attach only if the form exists
  const registerFormEl = document.getElementById("register-form");
  if (registerFormEl) {
registerFormEl.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const fullNameEl = document.getElementById("fullName");   // ✅ fixed
  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");
  const phoneEl = document.getElementById("phone");
  const dobEl = document.getElementById("dob");
  const genderEl = document.querySelector("input[name='gender']:checked");
  
  if (!fullNameEl?.value || !emailEl?.value || !passwordEl?.value) {
    alert("❌ Please fill in all required fields");
    return;
  }
  
  const registrationData = {
    full_name: fullNameEl.value,
    email: emailEl.value,
    password: passwordEl.value,
    phone: phoneEl?.value || "",
    dob: dobEl?.value || "",
    gender: genderEl?.value || ""
  };
  
  fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrationData)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("✅ Registration Completed Successfully!");
      localStorage.clear();
      window.location.href = "/";
    } else {
      alert("❌ " + (data.error || "Registration failed"));
    }
  })
  .catch(err => {
    console.error("Error:", err);
    alert("❌ An error occurred during registration");
  });
});
  }
});

// === USER SATISFACTION SLIDER ===
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("satisfaction");
  const display = document.getElementById("satisfaction-value");
  
  if (slider && display) {
    // Initialize value on load
    display.textContent = slider.value;
    
    // Update live as user slides
    slider.addEventListener("input", () => {
      display.textContent = slider.value;
    });
  }
});

// === USER SATISFACTION SLIDER + STAR DISPLAY ===
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("satisfaction");
  const display = document.getElementById("satisfaction-value");
  const starContainer = document.getElementById("star-display");
  
  if (slider && display && starContainer) {
    display.textContent = slider.value;
    const stars = starContainer.querySelectorAll("i");
    
    function updateStars(value) {
      const starCount = Math.round(value / 2); // 0–10 mapped to 0–5 stars
      stars.forEach((star, index) => {
        if (index < starCount) {
          star.classList.remove("fa-regular");
          star.classList.add("fa-solid");
        } else {
          star.classList.remove("fa-solid");
          star.classList.add("fa-regular");
        }
      });
    }
    
    updateStars(slider.value);
    
    slider.addEventListener("input", () => {
      const value = parseInt(slider.value);
      display.textContent = value;
      updateStars(value);
    });
  }
});

//logo button
document.addEventListener("DOMContentLoaded", () => {
  const logoButton = document.getElementById("logoButton");
  if (logoButton) {
    logoButton.addEventListener("click", () => {
      alert("Logo button has been pressed!");
    });
  }
});

// === SHOP NOW BUTTON (scroll to products on phones) ===
document.addEventListener("DOMContentLoaded", () => {
  const shopNowBtn = document.querySelector("#hero button");
  
  if (shopNowBtn) {
    shopNowBtn.addEventListener("click", () => {
      // Only scroll on mobile screens (max-width: 477px)
      if (window.innerWidth <= 477) {
        const productsSection = document.getElementById("product1");
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  }
});

// === NEWSLETTER SIGNUP ===
document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.getElementById("signup-btn");
  const emailInput = document.getElementById("newsletter-email");
  
  if (signupBtn && emailInput) {
    signupBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        alert("Please enter your email address");
        return;
      }
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return;
      }
      
      // Redirect to register page with email as query parameter
      window.location.href = `/register?email=${encodeURIComponent(email)}`;
    });
    
    // Allow signup on Enter key
    emailInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        signupBtn.click();
      }
    });
  }
});

