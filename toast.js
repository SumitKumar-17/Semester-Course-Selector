// Small transient status message at the bottom of the screen. Every
// meaningful action shows one — type controls color/icon so a successful
// pick doesn't look like an error:
//   "success" (default) - added/removed/marked/flagged something
//   "error"             - blocked pick, can't do that
//   "info"              - neutral note (undo, unflag)

const Toast = (() => {
  const DURATION = 3600;
  const TYPES = ["success", "error", "info"];
  const ICONS = { success: "✓", error: "⚠", info: "•" };
  let timer = null;

  function show(msg, type = "success") {
    const el = document.getElementById("toast");
    const msgEl = document.getElementById("toastMsg");
    const barEl = document.getElementById("toastBar");
    const iconEl = document.getElementById("toastIcon");

    msgEl.textContent = msg;
    iconEl.textContent = ICONS[type] || ICONS.success;

    // Drop the "show" class and force a reflow before re-adding it, so a
    // second toast firing while one is still on screen replays the pop-in
    // and countdown bar from scratch instead of just swapping the text.
    el.classList.remove("show", ...TYPES.map(t => `toast-${t}`));
    barEl.style.transition = "none";
    barEl.style.width = "100%";
    void el.offsetWidth;

    el.classList.add(`toast-${TYPES.includes(type) ? type : "success"}`, "show");
    const raf = typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : setTimeout;
    raf(() => {
      barEl.style.transition = `width ${DURATION}ms linear`;
      barEl.style.width = "0%";
    });

    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("show"), DURATION);
  }

  return { show };
})();
