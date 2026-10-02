/* ==========================================================================
   Main Application Logic - Authentication, Product Listing & Cart System
   ========================================================================== */

var API_BASE_URL = API_BASE_URL || 'http://localhost:5000/api';

// Global Products Array State
let allProducts = [];

// Security Helper: Sanitize string input to prevent XSS attacks
function sanitizeHTML(str) {
  if (!str) return "";
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}

/* ==========================================================================
   1. AUTHENTICATION LOGIC (Login & Register)
   ========================================================================== */

// Switch Tabs between Login and Register Forms
function switchTab(tabName) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");

  if (!loginForm || !registerForm) return;

  if (tabName === "login") {
    loginForm.classList.add("active");
    registerForm.classList.remove("active");
    if (loginTab) loginTab.classList.add("active");
    if (registerTab) registerTab.classList.remove("active");
  } else {
    registerForm.classList.add("active");
    loginForm.classList.remove("active");
    if (registerTab) registerTab.classList.add("active");
    if (loginTab) loginTab.classList.remove("active");
  }
}

// Validation Helper Functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
  return password.length >= 4;
}

function validateName(name) {
  const re = /^[\p{L}\s]+$/u;
  return re.test(name);
}

// Handle User Login Submission
async function handleLogin(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation(); // Event ወደ ሌላ እንዳይተላለፍ ያቆማል
  }

  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  if (!emailInput || !passwordInput) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Please fill in all required fields.");
    return;
  }

  if (!validateEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (!validatePassword(password)) {
    alert("Password must be at least 4 characters long.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("user_token", data.token);
      localStorage.setItem("user_data", JSON.stringify(data.user));
      alert("Logged in successfully! Redirecting to shop...");
      window.location.href = "index.html";
    } else {
      alert(data.message || "Login failed. Please check your credentials.");
    }
  } catch (error) {
    console.error("Login Error:", error);
    alert("Unable to connect to the backend server. Please make sure Node.js server is running.");
  }
}

// Handle User Registration Submission
async function handleRegister(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation(); // Event ወደ ሌላ እንዳይተላለፍ ያቆማል
  }

  const nameInput = document.getElementById("regName");
  const emailInput = document.getElementById("regEmail");
  const passwordInput = document.getElementById("regPassword");

  if (!nameInput || !emailInput || !passwordInput) return;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!name || !email || !password) {
    alert("Please fill in all required fields.");
    return;
  }

  if (!validateName(name)) {
    alert("Full name must contain valid letters only.");
    return;
  }

  if (!validateEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (!validatePassword(password)) {
    alert("Password must be at least 4 characters long.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // ፎርሞቹን ማፅዳት
      nameInput.value = "";
      emailInput.value = "";
      passwordInput.value = "";
      
      alert("Registration completed successfully! Please log in.");
      switchTab("login");
    } else {
      alert(data.message || "Registration failed.");
    }
  } catch (error) {
    console.error("Registration Error:", error);
    alert("Unable to connect to the backend server. Please make sure Node.js server is running.");
  }
}

/* ==========================================================================
   2. PRODUCT FETCHING & CART LOGIC
   ========================================================================== */

// Fetch Products from MySQL Database via Express API
async function fetchProductsFromBackend() {
  const productGrid = document.getElementById("productGrid");
  if (productGrid) {
    productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b;">Loading products...</p>`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    allProducts = await response.json();
    renderProducts(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    if (productGrid) {
      productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Unable to load products. Please check if backend server is running.</p>`;
    }
  }
}

// Function to Render Product Cards
function renderProducts(products) {
  const productGrid = document.getElementById("productGrid");
  if (!productGrid) return;

  if (!products || products.length === 0) {
    productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b;">No products found.</p>`;
    return;
  }

  productGrid.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
            <div class="product-image">
                <img src="${sanitizeHTML(product.image_url || 'https://via.placeholder.com/250x200?text=No+Image')}" alt="${sanitizeHTML(product.title)}">
            </div>
            <div class="product-info">
                <span class="category">${sanitizeHTML(product.description || 'General')}</span>
                <h3 class="product-title">${sanitizeHTML(product.title)}</h3>
                <p class="price">$${Number(product.price).toFixed(2)}</p>
                <div class="product-buttons">
                    <a href="product-detail.html?id=${product.id}" class="btn-secondary">
                        <i class="fa-solid fa-eye"></i> Details
                    </a>
                    <button class="btn-add-cart" onclick="addToCart('${product.id}')">
                        <i class="fa-solid fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

// LocalStorage Cart Helpers
function getCartItems() {
  try {
    return JSON.parse(localStorage.getItem("cart_items")) || [];
  } catch (e) {
    return [];
  }
}

function saveCartItems(cart) {
  localStorage.setItem("cart_items", JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId) {
  const product = allProducts.find((p) => String(p.id) === String(productId));
  
  if (!product) {
    console.error("Product not found in state for ID:", productId);
    alert("Could not add item to cart. Product data missing.");
    return;
  }

  let cart = getCartItems();
  const existingIndex = cart.findIndex((item) => String(item.id) === String(productId));

  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.image_url,
      quantity: 1
    });
  }

  saveCartItems(cart);
  alert(`${product.title} has been added to your cart!`);
}

function updateCartBadge() {
  const cartCountElement = document.getElementById("cartCount");
  if (!cartCountElement) return;

  const cart = getCartItems();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountElement.textContent = totalCount;
}

// Check User Login Status
function checkAuthStatus() {
  const authLink = document.getElementById("authLink");
  if (!authLink) return;

  const token = localStorage.getItem("user_token");
  const user = JSON.parse(localStorage.getItem("user_data"));

  if (token && user) {
    authLink.innerHTML = `<i class="fa-solid fa-user-check"></i> ${sanitizeHTML(user.full_name || user.name)}`;
    authLink.href = "#";
    authLink.onclick = (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("user_token");
        localStorage.removeItem("user_data");
        window.location.reload();
      }
    };
  }
}

/* ==========================================================================
   3. INITIALIZATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Login Form በእውነት Active ሲሆን እና Submit Button ሲጫን ብቻ ይሰራል
      if (loginForm.classList.contains("active")) {
        handleLogin(e);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Register Form በእውነት Active ሲሆን ብቻ ይሰራል
      if (registerForm.classList.contains("active")) {
        handleRegister(e);
      }
    });
  }

  // Products and Cart Initializers
  fetchProductsFromBackend();
  updateCartBadge();
  checkAuthStatus();

  // Search Filter
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      const filtered = allProducts.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(searchTerm)) ||
          (p.description && p.description.toLowerCase().includes(searchTerm))
      );
      renderProducts(filtered);
    });
  }
});