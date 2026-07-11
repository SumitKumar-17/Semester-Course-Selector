// Small transient status message at the bottom of the screen — used for
// things the user needs to notice but that don't warrant blocking a click
// (e.g. "no free slot left for this course").

const Toast = (() => {
  let timer = null;

  function show(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("show"), 3600);
  }

  return { show };
})();
