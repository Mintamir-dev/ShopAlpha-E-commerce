/* ==========================================================================
   Shopping Cart Management & Order Checkout Processing
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  renderCartTable();
  updateCartBadge();
  checkAuthStatus();
});

// Render Cart Table Items
function renderCartTable() {
  const tableBody = document.getElementById("cartTableBody");
  const subtotalElement = document.getElementById("subtotalPrice");
  const totalElement = document.getElementById("totalPrice");

  if (!tableBody) return;

  const cart = getCartItems();

  if (cart.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 30px; color: #64748b;">
                    Your cart is empty. <a href="index.html" style="color: #2563eb; font-weight: bold;">Shop Now</a>
                </td>
            </tr>
        `;
    if (subtotalElement) subtotalElement.textContent = "$0.00";
    if (totalElement) totalElement.textContent = "$0.00";
    return;
  }

  let subtotal = 0;

  tableBody.innerHTML = cart
    .map((item) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      return `
            <tr>
                <td class="product-col">
                    <img src="${sanitizeHTML(item.image)}" alt="${sanitizeHTML(item.title)}">
                    <span>${sanitizeHTML(item.title)}</span>
                </td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </td>
                <td>$${itemTotal.toFixed(2)}</td>
                <td>
                    <button class="btn-remove" onclick="removeItem(${item.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");

  if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  if (totalElement) totalElement.textContent = `$${subtotal.toFixed(2)}`;
}

// Update Item Quantity in Cart
function updateQuantity(productId, change) {
  let cart = getCartItems();
  const itemIndex = cart.findIndex((item) => item.id === productId);

  if (itemIndex > -1) {
    cart[itemIndex].quantity += change;

    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }

    saveCartItems(cart);
    renderCartTable();
  }
}

// Remove Item from Cart
function removeItem(productId) {
  let cart = getCartItems();
  cart = cart.filter((item) => item.id !== productId);
  saveCartItems(cart);
  renderCartTable();
}

// Order Checkout Logic & Security Validation
function proceedToCheckout() {
  const cart = getCartItems();
  if (cart.length === 0) {
    alert("Your cart is empty. Add items before checking out.");
    return;
  }

  const token = localStorage.getItem("user_token");

  // Auth Check: Redirect to Login if user is not authenticated
  if (!token) {
    alert("Please log in or create an account to complete your order.");
    window.location.href = "login.html";
    return;
  }

  // Process Order Confirmation
  const user = JSON.parse(localStorage.getItem("user_data"));
  alert(`Thank you, ${user.name}! Your order has been placed successfully.`);

  // Clear Cart after successful order processing
  localStorage.removeItem("cart_items");
  window.location.href = "index.html";
}