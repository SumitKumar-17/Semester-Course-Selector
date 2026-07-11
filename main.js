// Wires DOM events to Planner's mutators and triggers re-renders. This is
// the only file that touches addEventListener — Planner never reaches into
// the DOM, and Render never mutates state, so all three stay easy to reason
// about in isolation.

document.getElementById("catalogueBody").addEventListener("click", (e) => {
  const target = e.target.closest("[data-action]");
  if (!target) return;
  const { action, slot, code, key, letter } = target.dataset;

  if (action === "pick") {
    const result = Planner.togglePick(slot, code);
    result.needsChoice ? Render.catalogue() : Render.all();
  } else if (action === "taken") {
    Planner.toggleTaken(code);
    Render.all();
  } else if (action === "flag") {
    Planner.toggleFlagged(code);
    Render.all();
  } else if (action === "toggle-group") {
    Planner.toggleCollapsed(key);
    Render.catalogue();
  } else if (action === "confirm-choice") {
    Planner.confirmChoice(slot, code, letter);
    Render.all();
  } else if (action === "cancel-choice") {
    Planner.cancelChoice();
    Render.catalogue();
  }
});

document.getElementById("catalogueBody").addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const target = e.target.closest("[data-action='toggle-group']");
  if (!target) return;
  e.preventDefault();
  Planner.toggleCollapsed(target.dataset.key);
  Render.catalogue();
});

document.getElementById("picksBody").addEventListener("click", (e) => {
  const target = e.target.closest("[data-action='remove']");
  if (!target) return;
  Planner.removePick(target.dataset.slot);
  Render.all();
});

document.getElementById("collapseAllBtn").addEventListener("click", () => {
  Planner.areAllCollapsed() ? Planner.expandAll() : Planner.collapseAll();
  Render.catalogue();
});

document.getElementById("searchBox").addEventListener("input", Render.catalogue);

document.getElementById("completedBody").addEventListener("click", (e) => {
  const target = e.target.closest("[data-action='undo-taken']");
  if (!target) return;
  Planner.toggleTaken(target.dataset.code);
  Render.all();
});

Render.all();
