// Small transient status message at the bottom of the screen — used for
// things the user needs to notice but that don't warrant blocking a click
// (e.g. "no free slot left for this course").

const Toast = (() => {
  const DURATION = 3600;
  let timer = null;

  function show(msg) {
    const el = document.getElementById("toast");
    const msgEl = document.getElementById("toastMsg");
    const barEl = document.getElementById("toastBar");

    msgEl.textContent = msg;

    // Drop the "show" class and force a reflow before re-adding it, so a
    // second toast firing while one is still on screen replays the pop-in
    // and countdown bar from scratch instead of just swapping the text.
    el.classList.remove("show");
    barEl.style.transition = "none";
    barEl.style.width = "100%";
    void el.offsetWidth;

    el.classList.add("show");
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
