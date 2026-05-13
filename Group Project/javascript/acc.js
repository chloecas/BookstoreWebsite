
function getCookie(name) {
  const key   = encodeURIComponent(name) + "=";
  const found = document.cookie.split("; ").find((c) => c.startsWith(key));
  return found ? decodeURIComponent(found.slice(key.length)) : null;
}

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login");
  if (!loginBtn) return;

  const isLoggedIn  = !!getCookie("authToken");

  // Detect if we are in the /pages/ subfolder or in the root
  const inPages     = window.location.pathname.includes("/pages/");
  const profilePath = inPages ? "profile.html"      : "pages/profile.html";
  const loginPath   = inPages ? "login.html"         : "pages/login.html";

  const caption = loginBtn.querySelector("figcaption");

  if (isLoggedIn) {
    if (caption) caption.textContent = "My Account";
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = profilePath;
    });
  } else {
    if (caption) caption.textContent = "Access Account";
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = loginPath;
    });
  }
});