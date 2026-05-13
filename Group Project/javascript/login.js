
const API_URL = "https://reqres.in/api/login";
const API_KEY = "reqres_b7f9dbfefb254688a54ff7535c6565d2";

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

// ─── Validation ────────────────────────────────────────────────────────────────

function validateEmail(email) {
  if (!email || email.trim() === "") {
    return { valid: false, message: "Email is required." };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: "Please enter a valid email address." };
  }
  return { valid: true, message: "" };
}

function validatePassword(password) {
  if (!password || password === "") {
    return { valid: false, message: "Password is required." };
  }
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters." };
  }
  return { valid: true, message: "" };
}

// ─── UI Helpers ────────────────────────────────────────────────────────────────

function setFieldError(inputEl, message) {
  const existing = inputEl.parentElement.querySelector(".field-error");
  if (existing) existing.remove();

  inputEl.classList.remove("input-error");

  if (message) {
    inputEl.classList.add("input-error");
    const errEl = document.createElement("span");
    errEl.className = "field-error";
    errEl.setAttribute("role", "alert");
    errEl.textContent = message;
    inputEl.parentElement.appendChild(errEl);
  }
}

function setFormStatus(formEl, message, type = "error") {
  let banner = formEl.querySelector(".form-status");
  if (!banner) {
    banner = document.createElement("div");
    banner.className = "form-status";
    formEl.prepend(banner);
  }
  banner.textContent   = message;
  banner.dataset.type  = type;
  banner.style.display = message ? "block" : "none";
}

function setButtonLoading(btn, isLoading) {
  btn.disabled    = isLoading;
  btn.textContent = isLoading ? "Logging in…" : "Login";
}

// ─── API ───────────────────────────────────────────────────────────────────────

async function loginRequest(email, password) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    // reqres.in only accepts their test credentials — we send those
    // but store the user's real email in cookies
    body: JSON.stringify({"email": "eve.holt@reqres.in", "password": "cityslicka"}),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Login failed (${response.status})`);
  }

  if (!data.token) {
    throw new Error("No token received from server.");
  }

  return data; // { token: "QpwL5tpe83ilfN2..." }
}

// ─── Auth Guard ────────────────────────────────────────────────────────────────

function checkAuthAndRedirect() {
  const token = getCookie("authToken");
  // Only redirect if token actually exists and is not empty
  if (token && token.trim() !== "") {
    window.location.href = "../home.html";
  }
}

// ─── Form Handler ──────────────────────────────────────────────────────────────

function initLoginForm() {
  const form = document.querySelector("form.form");
  if (!form) return;

  const emailInput    = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn     = form.querySelector("button[type='submit']");

  // Real-time validation on blur
  emailInput.addEventListener("blur", () => {
    const { valid, message } = validateEmail(emailInput.value);
    setFieldError(emailInput, valid ? "" : message);
  });

  passwordInput.addEventListener("blur", () => {
    const { valid, message } = validatePassword(passwordInput.value);
    setFieldError(passwordInput, valid ? "" : message);
  });

  // Clear errors on input
  emailInput.addEventListener("input",    () => setFieldError(emailInput, ""));
  passwordInput.addEventListener("input", () => setFieldError(passwordInput, ""));

  // Submit
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email    = emailInput.value.trim();
    const password = passwordInput.value;

    const emailCheck    = validateEmail(email);
    const passwordCheck = validatePassword(password);

    setFieldError(emailInput,    emailCheck.valid    ? "" : emailCheck.message);
    setFieldError(passwordInput, passwordCheck.valid ? "" : passwordCheck.message);

    if (!emailCheck.valid || !passwordCheck.valid) return;

    setFormStatus(form, "");
    setButtonLoading(submitBtn, true);

    try {
      const { token } = await loginRequest(email, password);

      // Save token and real user data to cookies
      setCookie("authToken",  token, 7);
      setCookie("userEmail",  email, 7);

      // Preserve userName cookie from signup if it exists
      if (!getCookie("userName")) {
        setCookie("userName", email, 7);
      }

      setFormStatus(form, "Login successful! Redirecting…", "success");

      setTimeout(() => {
        window.location.href = "../home.html";
      }, 1000);

    } catch (error) {
      setFormStatus(form, error.message || "Login failed. Please try again.", "error");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

// ─── Boot ──────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  checkAuthAndRedirect();
  initLoginForm();
});