/* ==========================================================================
   Authentication System - Login, Register & Input Validation
   ========================================================================== */

var API_BASE_URL = API_BASE_URL || 'http://localhost:5000/api';

// Switch Tabs between Login and Register Forms
function switchTab(tabName) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");

  if (!loginForm || !registerForm || !loginTab || !registerTab) return;

  if (tabName === "login") {
    loginForm.classList.add("active");
    registerForm.classList.remove("active");
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
  } else {
    registerForm.classList.add("active");
    loginForm.classList.remove("active");
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
  }
}

// Validation Helper Functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
  return password.length >= 4; // Password must be at least 4 characters
}

function validateName(name) {
  // Allows letters (including unicode) and spaces
  const re = /^[\p{L}\s]+$/u;
  return re.test(name);
}

// Handle User Login Submission
async function handleLogin(e) {
  e.preventDefault();

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
    // Sahi Endpoint: ${API_BASE_URL}/auth/login
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
  e.preventDefault();

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
    // Sahi Endpoint: ${API_BASE_URL}/auth/register
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ full_name: name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
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

// Event Listeners Initialization
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
});