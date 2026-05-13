/**
 * profile.js
 * - Auth guard: redirects to login if no token cookie
 * - Fetches user data from reqres.in GET /api/users/{id}
 * - Displays static API data (avatar, name, email, id)
 * - Loads editable fields (name, email) from cookies
 * - Allows password change with validation (saved to cookie)
 * - Logout clears all cookies and redirects to login
 */

const API_BASE    = "https://reqres.in/api/users";
const API_KEY     = "pub_2a9e5c8ccafb603e3dd6510529c71176f3b7c3e19221b9f3c6f2ae36651c6ff5"; // ← paste your reqres.in key here
const FALLBACK_ID = 2; // default reqres.in user if no userId cookie

// ─── Cookie Helpers ────────────────────────────────────────────────────────────

function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

function getCookie(name) {
  const key   = encodeURIComponent(name) + "=";
  const found = document.cookie.split("; ").find((c) => c.startsWith(key));
  return found ? decodeURIComponent(found.slice(key.length)) : null;
}

function deleteCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// ─── Auth Guard ────────────────────────────────────────────────────────────────

function requireAuth() {
  if (!getCookie("authToken")) {
    window.location.href = "login.html";
  }
}

// ─── API ───────────────────────────────────────────────────────────────────────

async function fetchUserFromAPI(userId) {
  const response = await fetch(`${API_BASE}/${userId}`, {
    method: "GET",
    headers: {
      "x-api-key": API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Could not load profile data (${response.status})`);
  }

  const data = await response.json();
  return data.data; // reqres.in wraps user in { data: { ... } }
}

// ─── UI: Static API Panel ──────────────────────────────────────────────────────

function renderAPIData(user) {
  // Avatar and ID from API
  document.getElementById("profileAvatar").src     = user.avatar;
  document.getElementById("apiUserId").textContent = user.id;

  // Real user data from cookies
  const cookieName  = getCookie("userName");
  const cookieEmail = getCookie("userEmail");

  document.getElementById("apiUserEmail").textContent = cookieEmail || user.email;

  const nameParts = (cookieName || `${user.first_name} ${user.last_name}`).split(" ");
  document.getElementById("apiFirstName").textContent = nameParts[0] || user.first_name;
  document.getElementById("apiLastName").textContent  = nameParts.slice(1).join(" ") || user.last_name;
}

function setAPIStatus(message, type = "info") {
  const el         = document.getElementById("apiStatus");
  el.textContent   = message;
  el.dataset.type  = type;
  el.style.display = message ? "block" : "none";
}

// ─── UI: Editable Fields ───────────────────────────────────────────────────────

function loadEditableFields(apiUser) {
  document.getElementById("editName").value  = getCookie("userName")  || `${apiUser.first_name} ${apiUser.last_name}`;
  document.getElementById("editEmail").value = getCookie("userEmail") || apiUser.email;
  // Password fields are never pre-filled for security
  document.getElementById("editPassword").value        = "";
  document.getElementById("editConfirmPassword").value = "";
}

function setSaveStatus(message, type = "success") {
  const el         = document.getElementById("saveStatus");
  el.textContent   = message;
  el.dataset.type  = type;
  el.style.display = message ? "block" : "none";

  if (message) {
    setTimeout(() => { el.style.display = "none"; }, 3000);
  }
}

// ─── Validation ────────────────────────────────────────────────────────────────

function showError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

function clearErrors() {
  ["nameError", "emailError", "passwordError", "confirmPasswordError"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}

function validateEditableFields(name, email, password, confirmPassword) {
  let valid = true;

  if (!name || name.trim() === "") {
    showError("nameError", "Display name is required.");
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    showError("emailError", "Please enter a valid email address.");
    valid = false;
  }

  // Password is optional — only validate if they typed something
  if (password && password !== "") {
    if (password.length < 6) {
      showError("passwordError", "Password must be at least 6 characters.");
      valid = false;
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      showError("passwordError", "Password must contain a letter and a number.");
      valid = false;
    } else if (password !== confirmPassword) {
      showError("confirmPasswordError", "Passwords do not match.");
      valid = false;
    }
  }

  return valid;
}

// ─── Save Handler ──────────────────────────────────────────────────────────────

function saveEditableFields() {
  clearErrors();

  const name            = document.getElementById("editName").value.trim();
  const email           = document.getElementById("editEmail").value.trim();
  const password        = document.getElementById("editPassword").value;
  const confirmPassword = document.getElementById("editConfirmPassword").value;

  if (!validateEditableFields(name, email, password, confirmPassword)) return;

  setCookie("userName",  name,  7);
  setCookie("userEmail", email, 7);

  // Only save password if they actually filled it in
  if (password && password !== "") {
    setCookie("userPassword", password, 7);
  }

  setSaveStatus("Changes saved successfully!", "success");

  // Clear password fields after save for security
  document.getElementById("editPassword").value        = "";
  document.getElementById("editConfirmPassword").value = "";
}

// ─── Logout ────────────────────────────────────────────────────────────────────

function logout() {
  ["authToken", "userEmail", "userName", "userId", "userPassword"].forEach(deleteCookie);
  window.location.href = "login.html";
}

// ─── Boot ──────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Redirect if not logged in
  requireAuth();

  // 2. Wire up buttons
  document.getElementById("saveBtn").addEventListener("click", saveEditableFields);
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // 3. Determine which reqres.in user ID to fetch
  const userId = parseInt(getCookie("userId")) || FALLBACK_ID;

  // 4. Fetch from reqres.in and render
  try {
    setAPIStatus("Loading profile data…", "info");
    const apiUser = await fetchUserFromAPI(userId);
    renderAPIData(apiUser);
    loadEditableFields(apiUser);
    setAPIStatus("");
  } catch (error) {
    setAPIStatus(error.message, "error");

    // Still load editable fields from cookies even if API fails
    loadEditableFields({
      first_name: getCookie("userName") || "User",
      last_name:  "",
      email:      getCookie("userEmail") || "",
    });
  }
});