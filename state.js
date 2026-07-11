// Owns all planner state and its mutations: what's reserved in each of the
// 4 slots, which courses are marked already-taken, and persistence to
// localStorage. Nothing here touches the DOM — Render reads from Planner's
// getters, and main.js calls Planner's mutators in response to clicks.
//
// Each pick is stored as { code, letter } — `letter` is the specific slot
// option (from the course's slotOptions) reserved for that pick. For
// single-option courses (most lectures) this is the only choice anyway; for
// multi-option lab courses (e.g. "J,K,L,N,P,X") it's whichever option the
// user confirmed via the chooser strip in the catalogue.

const Planner = (() => {
  const STORAGE_KEY = "cs-sem9-planner-v1";

  const PICK_SLOTS = [
    { key: "e1", label: "Elective 1" },
    { key: "e2", label: "Elective 2" },
    { key: "e3", label: "Elective 3" },
    { key: "ta", label: "TA Course", isTa: true },
  ];

  let state = load();

  // Not persisted — tracks a course mid-way through choosing which specific
  // slot option to reserve. Only set for multi-option courses.
  let pendingChoice = null; // { slotKey, code } | null

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          picks: { e1: null, e2: null, e3: null, ta: null, ...parsed.picks },
          taken: new Set(parsed.taken || []),
          flagged: new Set(parsed.flagged || []),
          collapsed: new Set(parsed.collapsed || []),
        };
      }
    } catch (e) { /* corrupt storage, start fresh */ }
    return { picks: { e1: null, e2: null, e3: null, ta: null }, taken: new Set(), flagged: new Set(), collapsed: new Set() };
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      picks: state.picks,
      taken: [...state.taken],
      flagged: [...state.flagged],
      collapsed: [...state.collapsed],
    }));
  }

  function courseByCode(code) {
    return COURSES.find(c => c.code === code);
  }

  // Catalogue group key: single-option courses group by their one letter;
  // multi-option (flexible/lab) courses share one bucket since they don't
  // strictly own a slot; slot-less courses (projects etc) get "NONE".
  function groupKeyFor(course) {
    const opts = slotOptions(course.slot);
    if (opts.length === 0) return "NONE";
    if (opts.length === 1) return opts[0];
    return "MULTI";
  }

  // Letters already reserved by picks OTHER than excludeKey.
  function usedLettersExcluding(excludeKey) {
    const used = new Set();
    for (const { key } of PICK_SLOTS) {
      if (key === excludeKey) continue;
      const pick = state.picks[key];
      if (pick) used.add(pick.letter);
    }
    return used;
  }

  // Which of this course's slot options would still be free if placed into
  // slotKey. Only meaningful when slotKey is empty — a filled slot must be
  // cleared before anything else can go there (no silent overwriting), so
  // callers should check that separately.
  function availableOptionsFor(course, slotKey) {
    const used = usedLettersExcluding(slotKey);
    return slotOptions(course.slot).filter(l => !used.has(l));
  }

  // Where a course currently stands: already in your semester, boxed out by
  // your other picks with nowhere left to go, or still open to pick.
  function rowStatus(course) {
    if (state.taken.has(course.code)) return { status: "taken" };

    for (const { key, label } of PICK_SLOTS) {
      const pick = state.picks[key];
      if (pick && pick.code === course.code) return { status: "picked", label, letter: pick.letter };
    }

    const emptySlots = PICK_SLOTS.filter(({ key }) => !state.picks[key]);
    if (emptySlots.length === 0) {
      return { status: "blocked", reason: "All 4 picks are already filled — remove one first" };
    }

    const canGoSomewhere = emptySlots.some(({ key }) => availableOptionsFor(course, key).length > 0);
    if (canGoSomewhere) return { status: "open" };

    return { status: "blocked", reason: "Its slot conflicts with your other current picks — remove one first to free it up" };
  }

  // Returns { needsChoice } — true means the caller should show the chooser
  // strip instead of a full re-render (nothing was assigned yet).
  function togglePick(slotKey, code) {
    const course = courseByCode(code);
    const current = state.picks[slotKey];

    if (current && current.code === code) {
      state.picks[slotKey] = null;
      pendingChoice = null;
      save();
      return { needsChoice: false };
    }

    if (current && current.code !== code) {
      const label = PICK_SLOTS.find(p => p.key === slotKey).label;
      Toast.show(`${label} already has ${current.code} — remove it first before picking a different course here.`);
      return { needsChoice: false };
    }

    const available = availableOptionsFor(course, slotKey);
    if (available.length === 0) {
      const opts = slotOptions(course.slot);
      const plural = opts.length > 1;
      Toast.show(`No free slot left for ${course.code} — its option${plural ? "s" : ""} (${opts.join(", ")}) ${plural ? "are" : "is"} already covered by your other picks.`);
      return { needsChoice: false };
    }

    if (available.length === 1) {
      state.picks[slotKey] = { code, letter: available[0] };
      pendingChoice = null;
      save();
      return { needsChoice: false };
    }

    // Multiple free options — the UI should ask which slot to reserve
    // rather than silently guessing one.
    pendingChoice = { slotKey, code };
    return { needsChoice: true };
  }

  function confirmChoice(slotKey, code, letter) {
    state.picks[slotKey] = { code, letter };
    pendingChoice = null;
    save();
  }

  function cancelChoice() {
    pendingChoice = null;
  }

  function removePick(slotKey) {
    state.picks[slotKey] = null;
    save();
  }

  function unassignFromPicks(code) {
    for (const { key } of PICK_SLOTS) {
      if (state.picks[key] && state.picks[key].code === code) state.picks[key] = null;
    }
  }

  function toggleTaken(code) {
    if (state.taken.has(code)) {
      state.taken.delete(code);
    } else {
      state.taken.add(code);
      unassignFromPicks(code);
    }
    save();
  }

  // A personal note that a course looks tough / you'd rather avoid it — pure
  // annotation. It stays in the catalogue and stays pickable; this only adds
  // a visible reminder on the row, unlike "taken" which hides the course.
  function toggleFlagged(code) {
    if (state.flagged.has(code)) state.flagged.delete(code);
    else state.flagged.add(code);
    save();
  }

  function toggleCollapsed(groupKey) {
    if (state.collapsed.has(groupKey)) state.collapsed.delete(groupKey);
    else state.collapsed.add(groupKey);
    save();
  }

  function allGroupKeys() {
    return [...new Set(COURSES.map(groupKeyFor))];
  }

  function areAllCollapsed() {
    const keys = allGroupKeys();
    return keys.length > 0 && keys.every(k => state.collapsed.has(k));
  }

  function collapseAll() {
    state.collapsed = new Set(allGroupKeys());
    save();
  }

  function expandAll() {
    state.collapsed = new Set();
    save();
  }

  return {
    PICK_SLOTS,
    get state() { return state; },
    get pendingChoice() { return pendingChoice; },
    courseByCode, groupKeyFor, availableOptionsFor, rowStatus,
    togglePick, confirmChoice, cancelChoice, removePick,
    toggleTaken, toggleFlagged, toggleCollapsed,
    allGroupKeys, areAllCollapsed, collapseAll, expandAll,
  };
})();
