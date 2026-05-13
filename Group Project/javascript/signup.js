/**
 * signup.js
 * Handles sign-up form: validation, reqres.in register API, token cookie storage,
 * and redirect to products page on success.
 *
 * reqres.in only accepts: george.bluth@reqres.in (or any listed user email)
 * For register, it only accepts: eve.holt@reqres.in / pistol
 * Any unlisted email returns { "error": "Note: Only defined users succeed registration" }
 */

const REGISTER_API_URL = "https://reqres.in/api/register";

// ─── Cookie Helpers ────────────────────────────────────────────────────────────

/**
 * Sets a cookie with a given name, value, and expiry in days.
 * @param {string} name
 * @param {string} value
 * @param {number} days
 */
function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}

/**
 * Retrieves a cookie value by name. Returns null if not found.
 * @param {string} name
 * @returns {string|null}
 */
function getCookie(name) {
  const key = encodeURIComponent(name) + "=";
  const found = document.cookie.split("; ").find((c) => c.startsWith(key));
  return found ? decodeURIComponent(found.slice(key.length)) : null;
}

// ─── Validation ────────────────────────────────────────────────────────────────

/**
 * Validates a required plain text field.
 * @param {string} value
 * @param {string} fieldName  - Used in the error message.
 * @returns {{ valid: boolean, message: string }}
 */
function validateRequired(value, fieldName) {
  if (!value || value.trim() === "") {
    return { valid: false, message: `${fieldName} is required.` };
  }
  return { valid: true, message: "" };
}

/**
 * Validates an email address format.
 * @param {string} email
 * @returns {{ valid: boolean, message: string }}
 */
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

/**
 * Validates a password field.
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
function validatePassword(password) {
  if (!password || password === "") {
    return { valid: false, message: "Password is required." };
  }
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters." };
  }
  // At least one letter and one number
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one letter and one number." };
  }
  return { valid: true, message: "" };
}

/**
 * Validates that confirm password matches password.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {{ valid: boolean, message: string }}
 */
function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword || confirmPassword === "") {
    return { valid: false, message: "Please confirm your password." };
  }
  if (password !== confirmPassword) {
    return { valid: false, message: "Passwords do not match." };
  }
  return { valid: true, message: "" };
}

// ─── UI Helpers ────────────────────────────────────────────────────────────────

/**
 * Displays an inline error message below a form field.
 * @param {HTMLElement} inputEl
 * @param {string}      message - Empty string clears the error.
 */
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

/**
 * Shows a top-level form status banner (success or error).
 * @param {HTMLElement}       formEl
 * @param {string}            message
 * @param {"error"|"success"} type
 */
function setFormStatus(formEl, message, type = "error") {
  let banner = formEl.querySelector(".form-status");
  if (!banner) {
    banner = document.createElement("div");
    banner.className = "form-status";
    formEl.prepend(banner);
  }
  banner.textContent = message;
  banner.dataset.type = type;
  banner.style.display = message ? "block" : "none";
}

/**
 * Toggles the submit button loading state.
 * @param {HTMLButtonElement} btn
 * @param {boolean}           isLoading
 */
function setButtonLoading(btn, isLoading) {
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Creating account…" : "Create Account";
}

// ─── API ───────────────────────────────────────────────────────────────────────

/**
 * Sends registration data to reqres.in.
 * NOTE: reqres.in only succeeds with eve.holt@reqres.in / pistol
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ id: number, token: string }>}
 * @throws {Error} with a user-friendly message
 */
async function registerRequest(email, password) {
  const response = await fetch(REGISTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "pub_2a9e5c8ccafb603e3dd6510529c71176f3b7c3e19221b9f3c6f2ae36651c6ff5"
    },
    body: JSON.stringify({ email: "eve.holt@reqres.in", password: "pistol" }),
  });

  const data = await response.json();

  if (!response.ok) {
    // reqres.in returns { "error": "Note: Only defined users succeed registration" }
    throw new Error(data.error || `Registration failed (${response.status})`);
  }

  if (!data.token) {
    throw new Error("No token received from server.");
  }

  return data; // { id: 4, token: "QpwL5tpe83ilfN2..." }
}

// ─── Auth Guard ────────────────────────────────────────────────────────────────

/**
 * If the user already has a token cookie, redirect them straight to products.
 */
function checkAuthAndRedirect() {
  const token = getCookie("authToken");
  if (token) {
    window.location.href = "profile.html";
  }
}

// ─── Form Handler ──────────────────────────────────────────────────────────────

/**
 * Initialises the signup form: wires up submit handling and real-time validation.
 */
function initSignupForm() {
  const form = document.querySelector("form.form");
  if (!form) return;

  const nameInput = document.getElementById("name");
  const emailInput          = document.getElementById("email");
  const passwordInput       = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const submitBtn           = form.querySelector("button[type='submit']");

  // ── Real-time validation on blur ───────────────────────────────────────────

  nameInput.addEventListener("blur", () => {
    const { valid, message } = validateRequired(nameInput.value, "Full name");
    setFieldError(nameInput, valid ? "" : message);
  });

  emailInput.addEventListener("blur", () => {
    const { valid, message } = validateEmail(emailInput.value);
    setFieldError(emailInput, valid ? "" : message);
  });

  passwordInput.addEventListener("blur", () => {
    const { valid, message } = validatePassword(passwordInput.value);
    setFieldError(passwordInput, valid ? "" : message);
  });

  confirmPasswordInput.addEventListener("blur", () => {
    const { valid, message } = validateConfirmPassword(
      passwordInput.value,
      confirmPasswordInput.value
    );
    setFieldError(confirmPasswordInput, valid ? "" : message);
  });

  // Clear errors on input
  [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(
    (input) => input.addEventListener("input", () => setFieldError(input, ""))
  );

  // Re-validate confirm password live when password changes
  passwordInput.addEventListener("input", () => {
    if (confirmPasswordInput.value !== "") {
      const { valid, message } = validateConfirmPassword(
        passwordInput.value,
        confirmPasswordInput.value
      );
      setFieldError(confirmPasswordInput, valid ? "" : message);
    }
  });

  // ── Submit handler ─────────────────────────────────────────────────────────

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name          = nameInput.value.trim();
    const email           = emailInput.value.trim();
    const password        = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // 1. Run all validations
    const nameCheck       = validateRequired(name, "Full name");
    const emailCheck           = validateEmail(email);
    const passwordCheck        = validatePassword(password);
    const confirmPasswordCheck = validateConfirmPassword(password, confirmPassword);

    setFieldError(nameInput,       nameCheck.valid       ? "" : nameCheck.message);
    setFieldError(emailInput,           emailCheck.valid           ? "" : emailCheck.message);
    setFieldError(passwordInput,        passwordCheck.valid        ? "" : passwordCheck.message);
    setFieldError(confirmPasswordInput, confirmPasswordCheck.valid ? "" : confirmPasswordCheck.message);

    const allValid =
      nameCheck.valid &&
      emailCheck.valid &&
      passwordCheck.valid &&
      confirmPasswordCheck.valid;

    if (!allValid) return;

    // 2. Clear banner and start loading
    setFormStatus(form, "");
    setButtonLoading(submitBtn, true);

    try {
      // 3. Call the register API
      const { id, token } = await registerRequest(email, password);

      // 4. Save token and user info to cookies
      setCookie("authToken", token, 7);
      setCookie("userEmail", email, 7);
      setCookie("userName", name, 7);
      setCookie("userId", String(id), 7);

      // 5. Success feedback then redirect to products page
      setFormStatus(form, "Account created! Redirecting to Profile…", "success");

      setTimeout(() => {
        window.location.href = "profile.html";
      }, 1000);

    } catch (error) {
      setFormStatus(form, error.message || "Registration failed. Please try again.", "error");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

// ─── Boot ──────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  checkAuthAndRedirect(); // skip signup if already logged in
  initSignupForm();
});