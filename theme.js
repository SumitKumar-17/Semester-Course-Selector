// Light/dark theme toggle. The initial theme (saved choice, else system
// preference) is set synchronously by an inline script in index.html's
// <head> — before this file even loads — so there's no flash on load.
// This module only owns the toggle button and persisting a manual choice.

const Theme = (() => {
  const STORAGE_KEY = "cs-sem9-theme";

  function current() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function set(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateButton();
  }

  function toggle() {
    set(current() === "dark" ? "light" : "dark");
  }

  function updateButton() {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    const isDark = current() === "dark";
    btn.textContent = isDark ? "☀" : "☾";
    btn.title = isDark ? "Switch to light theme" : "Switch to dark theme";
  }

  return { toggle, updateButton };
})();
