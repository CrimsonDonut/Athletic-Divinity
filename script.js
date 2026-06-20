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
  
  // Setup validation
  const emailPattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+$/;
  const namePattern = /^[A-Za-z\s]+$/;
  
  function setupValidation(inputId, iconId, type) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;
    
    input.addEventListener('input', () => {
      icon.style.opacity = '1';
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
        alert('⚠️ Please fill in all fields');
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
  
  // Register button handler
  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('registerName');
      const emailInput = document.getElementById('registerEmail');
      const passwordInput = document.getElementById('registerPassword');
      
      const full_name = nameInput?.value.trim();
      const email = emailInput?.value.trim();
      const password = passwordInput?.value.trim();
      
      if (!full_name || !email || !password) {
        alert('⚠️ Please fill in all fields');
        return;
      }
      
      fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name,
          email,
          password
        })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('✅ Registration successful! You can now login.');
            nameInput.value = '';
            emailInput.value = '';
            passwordInput.value = '';
            localStorage.removeItem('regName');
            localStorage.removeItem('regEmail');
            localStorage.removeItem('regPassword');
            if (registerModal) {
              registerModal.classList.remove('show');
              document.body.classList.remove('modal-active');
            }
          } else {
            alert('❌ ' + (data.error || 'Registration failed'));
          }
        })
        .catch(err => alert("❌ Error: " + err.message));
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
  const productCards = document.querySelectorAll('.pro');
  if (productCards && productCards.length) {
    productCards.forEach(card => {
      const productId = parseInt(card.dataset.id);
      const button = card.querySelector('a');
      const img = card.querySelector('img');

      // Products that require size selection
      const needsSize = [1,2,3,4,5,6,7,8,14,15,16,17,18].includes(productId);

      // HANDLER 1: Click on the card itself (not the button) - navigate to product page
      card.addEventListener('click', (e) => {
        // Don't navigate if clicking on the button itself
        if (e.target === button || button?.contains(e.target)) {
          return;
        }
        
        if (img) {
          const src = encodeURIComponent(img.getAttribute('src'));
          window.location.href = `/product?id=${productId}&img=${src}`;
        }
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
    });
  }

  updateCartBadge();
});

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

function addToCart(productId, quantity = 1) {
  // Get logged-in user email
  const loggedInUser = localStorage.getItem('loggedInUser');
  const userEmail = loggedInUser ? JSON.parse(loggedInUser).email : '';
  
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const cartItem = {
    product_id: product.id,
    product_name: product.images[0].label,
    product_image: product.images[0].src,
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
      if (!data.success) throw new Error(data.error);
      
      playAddToCartSound();
      updateCartBadge();
    })
    .catch(err => console.error("Error adding to cart:", err));
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
        alert('⚠️ Please select a size first!');
        return;
      }

      // Get logged-in user email
      const loggedInUser = localStorage.getItem('loggedInUser');
      const userEmail = loggedInUser ? JSON.parse(loggedInUser).email : '';

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

const products = [
{
  id: 1,
  category: "Men / T-Shirt",
  price: 499,
  description: "A physique-enhancing fit that elevates your energy with every move.",
  images: [
  { src: "/static/img/products/fnb2.png", label: "Blissful Thunder" },
  { src: "/static/img/products/fnb3.png", label: "Eternal Sky" },
  { src: "/static/img/products/fnb4.png", label: "Midnight Flame" },
  { src: "/static/img/products/fnb5.png", label: "Blood Moon" }
  ]
},
{
  id: 2,
  category: "Men / T-Shirt",
  price: 450,
  description: "Lightweight and durable, made for training that never ends.",
  images: [
  { src: "/static/img/products/fnb3.png", label: "Eternal Sky" },
  { src: "/static/img/products/fnb2.png", label: "Blissful Thunder" },
  { src: "/static/img/products/fnb4.png", label: "Midnight Flame" },
  { src: "/static/img/products/fnb5.png", label: "Blood Moon" }
  ]
},
{
  id: 3,
  category: "Men / T-Shirt",
  price: 450,
  description: "Lightweight and durable, made for training that never ends.",
  images: [
  { src: "/static/img/products/fnb4.png", label: "Midnight Flame" },
  { src: "/static/img/products/fnb3.png", label: "Eternal Sky" },
  { src: "/static/img/products/fnb2.png", label: "Blissful Thunder" },
  { src: "/static/img/products/fnb5.png", label: "Blood Moon" }
  ]
},
{
  id: 4,
  category: "Men / T-Shirt",
  price: 450,
  description: "Lightweight and durable, made for training that never ends.",
  images: [
  { src: "/static/img/products/fnb5.png", label: "Blood Moon" },
  { src: "/static/img/products/fnb4.png", label: "Midnight Flame" },
  { src: "/static/img/products/fnb2.png", label: "Blissful Thunder" },
  { src: "/static/img/products/fnb3.png", label: "Eternal Sky" }
  ]
},
{
  id: 5,
  category: "Women / T-Shirt",
  price: 450,
  description: "Fly through your workouts with breathable elegance and grace.",
  images: [
  { src: "/static/img/products/w1.png", label: "Light Crimson" },
  { src: "/static/img/products/w2.png", label: "Lightning Swipe" },
  { src: "/static/img/products/w3.png", label: "Crimson Hour" },
  { src: "/static/img/products/w4.png", label: "Golden Haze" }
  ]
},
{
  id: 6,
  category: "Women / T-Shirt",
  price: 450,
  description: "Fly through your workouts with breathable elegance and grace.",
  images: [
  { src: "/static/img/products/w2.png", label: "Lightning Swipe" },
  { src: "/static/img/products/w1.png", label: "Light Crimson" },
  { src: "/static/img/products/w3.png", label: "Crimson Hour" },
  { src: "/static/img/products/w4.png", label: "Golden Haze" }
  ]
},
{
  id: 7,
  category: "Women / T-Shirt",
  price: 450,
  description: "Fly through your workouts with breathable elegance and grace.",
  images: [
  { src: "/static/img/products/w3.png", label: "Crimson Hour" },
  { src: "/static/img/products/w2.png", label: "Lightning Swipe" },
  { src: "/static/img/products/w1.png", label: "Light Crimson" },
  { src: "/static/img/products/w4.png", label: "Golden Haze" }
  ]
},
{
  id: 8,
  category: "Women / T-Shirt",
  price: 450,
  description: "Fly through your workouts with breathable elegance and grace.",
  images: [
  { src: "/static/img/products/w4.png", label: "Golden Haze" },
  { src: "/static/img/products/w3.png", label: "Crimson Hour" },
  { src: "/static/img/products/w2.png", label: "Lightning Swipe" },
  { src: "/static/img/products/w1.png", label: "Light Crimson" }
  ]
},
{
  id: 9,
  name: "Silicone Chaine Wrist Wraps",
  category: "Accessories",
  price: 450,
  description: "Enhance your lifts and achieve superior grip with our accessories.",
  images: [
  { src: "/static/img/products/a1.png", label: "Silicone Chain Wrist Wraps" },
  { src: "/static/img/products/a2.png", label: "Chalice of Zeus" },
  { src: "/static/img/products/a3.png", label: "Socks Of Hermes" },
  { src: "/static/img/products/a4.png", label: "Bracers of Olympus" }
  ]
},
{
  id: 10,
  category: "Accessories",
  price: 450,
  description: "Enhance your lifts and achieve superior grip with our accessories.",
  images: [
  { src: "/static/img/products/a2.png", label: "Chalice Of Zeus" },
  { src: "/static/img/products/a1.png", label: "Silicone Chain Wrist Wraps" },
  { src: "/static/img/products/a3.png", label: "Socks of Hermes" },
  { src: "/static/img/products/a4.png", label: "Bracers of Olympus" }
  ]
},
{
  id: 11,
  category: "Accessories",
  price: 450,
  description: "Enhance your lifts and achieve superior grip with our accessories.",
  images: [
  { src: "/static/img/products/a1.png", label: "Silicone Chain Wrist Wraps" },
  { src: "/static/img/products/a2.png", label: "Chalice Of Zeus" },
  { src: "/static/img/products/a3.png", label: "Socks of Hermes" },
  { src: "/static/img/products/a4.png", label: "Bracers of Olympus" }
  ]
},
{
  id: 12,
  category: "Accessories",
  price: 450,
  description: "Enhance your lifts and achieve superior grip with our accessories.",
  images: [
  { src: "/static/img/products/a3.png", label: "Socks of Hermes" },
  { src: "/static/img/products/a1.png", label: "Silicone Chain Wrist Wraps" },
  { src: "/static/img/products/a2.png", label: "Chalice Of Zeus" },
  { src: "/static/img/products/a4.png", label: "Bracers of Olympus" }
  ]
},
{
  id: 13,
  category: "Accessories",
  price: 450,
  description: "Enhance your lifts and achieve superior grip with our accessories.",
  images: [
  { src: "/static/img/products/a4.png", label: "Bracers of Olympus" },
  { src: "/static/img/products/a1.png", label: "Silicone Chain Wrist Wraps" },
  { src: "/static/img/products/a2.png", label: "Chalice Of Zeus" },
  { src: "/static/img/products/a3.png", label: "Socks of Hermes" },
  ]
},
{
  id: 14,
  category: "Shorts",
  price: 450,
  description: "Enhance your lifts and achieve superior grip with our accessories.",
  images: [
  { src: "/static/img/products/t1.png", label: "Silent Midnight" },
  { src: "/static/img/products/t2.png", label: "Crown of Night" },
  { src: "/static/img/products/t3.png", label: "Cloudy Night" },
  { src: "/static/img/products/t4.png", label: "Seething Blood" }
  ]
},
{
  id: 15,
  category: "Shorts",
  price: 450,
  description: "Enhance your lifts and achieve superior grip with our accessories.",
  images: [
  { src: "/static/img/products/t3.png", label: "Cloudy Night" },
  { src: "/static/img/products/t1.png", label: "Silent Midnight" },
  { src: "/static/img/products/t2.png", label: "Crown of Night" },
  { src: "/static/img/products/t4.png", label: "Seething Blood" }
  ]
},
{
  id: 16,
  category: "Shorts",
  price: 450,
  description: "Enhance your lifts and achieve superior grip with our accessories.",
  images: [
  { src: "/static/img/products/t4.png", label: "Seething Blood" },
  { src: "/static/img/products/t3.png", label: "Crown of Night" },
  { src: "/static/img/products/t2.png", label: "Cloudy Night" },
  { src: "/static/img/products/t1.png", label: "Silent Midnight" },
  ]
},
{
  id: 17,
  category: "Shorts",
  price: 450,
  description: "Enhance your lifts and achieve superior grip with our accessories.",
  images: [
  { src: "/static/img/products/t2.png", label: "Cloudy Night" },
  { src: "/static/img/products/t1.png", label: "Silent Midnight" },
  { src: "/static/img/products/t3.png", label: "Crown of Night" },
  { src: "/static/img/products/t4.png", label: "Seething Blood" }
  ]
},
{
  id: 18,
  category: "Men / T-shirt",
  price: 450,
  description: "Enhance your lifts and achieve superior grip with our accessories.",
  images: [
  { src: "/static/img/products/s5.jfif", label: "Tarantula" },
  { src: "/static/img/products/s6.jfif", label: "Short The Amazing Emblem" },
  { src: "/static/img/products/s7.jfif", label: "Tarantula black & red" },
  { src: "/static/img/products/s1.jfif", label: "Symbiote" }
  ]
},
{
  id: 19,
  category: "Men / T-shirt",
  price: 550,
  description: "Enhance your lifts and achieve superior grip with our accessories.",
  images: [
  { src: "/static/img/products/anb.png", label: "Flame Crest" },
  { src: "/static/img/products/anb2.png", label: "Divine Flames" },
  { src: "/static/img/products/anb3.png", label: "Cursed Flames" },
  { src: "/static/img/products/anb4.png", label: "The Sun" }
  ]
}
];

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
function addToCart(productId, quantity = 1) {
  // Get logged-in user email
  const loggedInUser = localStorage.getItem('loggedInUser');
  const userEmail = loggedInUser ? JSON.parse(loggedInUser).email : '';
  
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const cartItem = {
    product_id: product.id,
    product_name: product.images[0].label,
    product_image: product.images[0].src,
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
      if (!data.success) throw new Error(data.error);
      
      playAddToCartSound();
      updateCartBadge();
    })
    .catch(err => console.error("Error adding to cart:", err));
}


document.addEventListener('DOMContentLoaded', () => {
  // Fetch and display products on product pages (women, men, accessories)
  if (window.location.pathname.includes("/women") || window.location.pathname.includes("/men") || window.location.pathname.includes("/accesories")) {
    // Product page logic here
  }
});

// === DYNAMIC PRODUCT PAGE ===
if (window.location.pathname.includes("/product")) {
  window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get("id"));
    const selectedImg = params.get("img");
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      document.querySelector("#prodetails").innerHTML = "<h2>Product not found</h2>";
      return;
    }
    
    // Elements
    const mainImg = document.getElementById("MainImg");
    const smallGroup = document.querySelector(".small-img-group");
    const titleEl = document.querySelector(".single-pro-details h4");
    const priceDisplay = document.getElementById("priceDisplay");
    const descEl = document.querySelector(".single-pro-details span");
    const qtyInput = document.getElementById("qty");
    const addToCartBtn = document.querySelector(".single-pro-details button.normal");
    
    // Fill product info
    document.querySelector(".single-pro-details h6").textContent = product.category;
    titleEl.textContent = product.images[0].label;
    priceDisplay.textContent = `₱${product.price}.00`;
    descEl.textContent = product.description;
    document.getElementById("price").value = product.price;
    // initialize total output (use multiply helper) so the page shows the correct subtotal immediately
    const totalOutput = document.getElementById('totalOutput');
    const totalDisplay = document.getElementById('totalDisplay');
    if (totalOutput && qtyInput) {
      totalOutput.value = multiply(qtyInput, document.getElementById('price'));
    }
    if (totalDisplay) {
      totalDisplay.textContent = multiply(qtyInput, document.getElementById('price'));
    }
    
    // Update total when quantity changes
    if (qtyInput && totalDisplay) {
      qtyInput.addEventListener('input', () => {
        const total = multiply(qtyInput, document.getElementById('price'));
        totalDisplay.textContent = total;
      });
    }
    
    // Thumbnails
    smallGroup.innerHTML = product.images
    .map(
    img =>
    `<div class="small-img-col"><img src="${img.src}" width="100%" class="small-img" alt="" data-label="${img.label}"></div>`
    )
    .join("");
    
    // Main image
    if (selectedImg) {
      mainImg.src = decodeURIComponent(selectedImg);
      const found = product.images.find(i => i.src === decodeURIComponent(selectedImg));
      titleEl.textContent = found ? found.label : product.images[0].label;
    } else {
      mainImg.src = product.images[0].src;
    }
    
    // Change main image when clicking small images
    document.querySelectorAll(".small-img").forEach(imgEl => {
      imgEl.addEventListener("click", () => {
        mainImg.src = imgEl.src;
        titleEl.textContent = imgEl.dataset.label;
      });
    });
    
    // ✅ Add To Cart button (now guaranteed to exist)
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => {
        const qty = parseInt(qtyInput.value) || 1;
        const productName = titleEl.textContent.trim();
        const mainImage = mainImg.getAttribute("src");
        
        // Get logged-in user email
        const loggedInUser = localStorage.getItem('loggedInUser');
        const userEmail = loggedInUser ? JSON.parse(loggedInUser).email : '';

        const cartItem = {
          product_id: productId,
          product_name: productName,
          product_image: mainImage,
          price: product.price,
          quantity: qty,
          user_email: userEmail
        };
        
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
            
            // 🔊 play sound
            playAddToCartSound();
            
            // 🔄 update cart icon number
            updateCartBadge();
            
            // ✨ show popup
            const block = document.querySelector(".single-pro-details");
            showAddToCartVisual(block);
          })
          .catch(err => {
            console.error("Error adding to cart:", err);
            alert('❌ Error adding to cart: ' + err.message);
          });
      });
    }
  });
}

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

    fetch(`/api/cart/clear?user_email=${encodeURIComponent(userEmail)}`, {
      method: 'DELETE'
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

          orderItemsEl.innerHTML += `
            <div class="order-row">
              <img src="${item.product_image}" />
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
    if (!cart.length) return alert("Your cart is empty.");

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
      delivery_fee: deliveryFee
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
        return fetch('/api/cart/clear', { method: 'DELETE' });
      } else {
        alert("❌ " + (data.error || "Failed to place order"));
        throw new Error(data.error);
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.href = "/";
      }
    })
    .catch(err => {
      console.error("Error:", err);
      window.location.href = "/";
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
            row.innerHTML = `
            <td><a href="#" class="remove" data-item-id="${item.id}"><i class="fa-regular fa-circle-xmark"></i></a></td>
            <td><img src="${item.product_image}" alt="${item.product_name}"></td>
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
  
  document.addEventListener("DOMContentLoaded", () => {
    
    const pushBtn = document.getElementById("pushButton");
    const chooseBtn = document.getElementById("btn");
    const resetBtn = document.getElementById("resetChoice");
    const resultBox = document.getElementById("randomPickResult");
    
    // ✅ Filter products by category
    const shirtProducts = products.filter(p => p.category && p.category.includes("T-Shirt"));
    const shortsProducts = products.filter(p => p.category && p.category.includes("Shorts"));
    const accessoryProducts = products.filter(p => p.category && p.category.includes("Accessories"));
    
    // ✅ Helper function to pick random element
    function pickRandom(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    
    // ✅ Choose For Me button
    chooseBtn.addEventListener("click", () => {
      if (!pushBtn.checked) {
        alert("⚠️ Please check PUSH BUTTON first!");
        return;
      }
      
      const shirt = pickRandom(shirtProducts);
      const shorts = pickRandom(shortsProducts);
      const accessory = pickRandom(accessoryProducts);
      
      if (!shirt || !shorts || !accessory) {
        alert("⚠️ Not enough products found to make a random outfit!");
        return;
      }
      
      // ✅ Add to cart: always use quantity = 1
      [shirt, shorts, accessory].forEach(item => addToCart(item.id, 1));
      
      resultBox.innerHTML = `
      <h4 style="color:#e6ac0f">✅ Random Outfit Added!</h4>
      <p>👕 ${shirt.images[0].label}</p>
      <p>🩳 ${shorts.images[0].label}</p>
      <p>🎒 ${accessory.images[0].label}</p>
      <p style="font-size:13px;opacity:0.8;">(Scroll down to cart to see your items)</p>
      `;
      
      // ✅ Refresh cart display totals
      setTimeout(() => location.reload(), 400);
    });
    
    // ✅ RESET BUTTON — Clears entire cart
    resetBtn.addEventListener("click", () => {
      
      // Clear the cart from database
      fetch('/api/cart/clear', {
        method: 'DELETE'
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Reset the UI
            pushBtn.checked = false;
            resultBox.innerHTML = "";
            
            // Reload to update cart visually
            setTimeout(() => location.reload(), 200);
          }
        })
        .catch(err => console.error("Error clearing cart:", err));
    });
    
  });
}


// ====== Safe registration autofill + submit handler ======
document.addEventListener("DOMContentLoaded", () => {
  // Load saved values from localStorage into the register page form
  const fullNameEl = document.getElementById("fullName");
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
      
      // Get all form fields
      const fullNameEl = document.getElementById("fullName");
      const emailEl = document.getElementById("email");
      const passwordEl = document.getElementById("password");
      const phoneEl = document.getElementById("phone");
      const dobEl = document.getElementById("dob");
      const genderEl = document.querySelector("input[name='gender']:checked");
      
      // Validate required fields
      if (!fullNameEl?.value || !emailEl?.value || !passwordEl?.value) {
        alert("❌ Please fill in all required fields");
        return;
      }
      
      // Save to localStorage BEFORE sending to backend
      localStorage.setItem("regName", fullNameEl.value);
      localStorage.setItem("regEmail", emailEl.value);
      localStorage.setItem("regPassword", passwordEl.value);
      
      // Prepare data
      const registrationData = {
        full_name: fullNameEl.value,
        email: emailEl.value,
        password: passwordEl.value,
        phone: phoneEl?.value || "",
        dob: dobEl?.value || "",
        gender: genderEl?.value || ""
      };
      
      // Send to backend
      fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert("✅ Registration Completed Successfully!");
          // Redirect to homepage after a short delay
          setTimeout(() => {
            window.location.href = "/";
          }, 500);
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

