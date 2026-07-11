// All DOM rendering for the catalogue (left panel) and the semester picks
// (right panel). Only reads Planner's state; never mutates it — mutations
// happen through Planner's functions, called by main.js's event handlers,
// which then call Render.all()/Render.catalogue() again.

const Render = (() => {
  function groupCourses(list) {
    const groups = new Map();
    for (const c of list) {
      const key = Planner.groupKeyFor(c);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(c);
    }
    const sortedKeys = [...groups.keys()].sort((a, b) => {
      if (a === "MULTI") return 1;
      if (b === "MULTI") return -1;
      if (a === "NONE") return 1;
      if (b === "NONE") return -1;
      return a.localeCompare(b);
    });
    return sortedKeys.map(k => ({ key: k, courses: groups.get(k) }));
  }

  function matchesSearch(course, q) {
    if (!q) return true;
    const hay = `${course.code} ${course.name} ${course.faculty}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  }

  function groupHeaderChip(groupKey) {
    if (groupKey === "NONE") return `<span class="slot-chip" style="background:#6B7280">N/A</span>`;
    if (groupKey === "MULTI") return `<span class="slot-chip" style="background:#6B7280">multi</span>`;
    return `<span class="slot-chip" style="background:${slotColor(groupKey)}">Slot ${groupKey}</span>`;
  }

  function groupHeaderTitle(groupKey) {
    if (groupKey === "NONE") return "no fixed weekly slot (project / training / internship)";
    if (groupKey === "MULTI") return "flexible — scheduled into whichever of its listed slots is free";
    return "one pick max from this slot";
  }

  function statusBadge(info) {
    if (info.status === "picked") return `<span class="row-badge badge-picked">picked · ${info.label}</span>`;
    if (info.status === "blocked") return `<span class="row-badge badge-blocked" title="${info.reason}">blocked</span>`;
    return "";
  }

  function catalogue() {
    const search = document.getElementById("searchBox").value.trim();
    const body = document.getElementById("catalogueBody");
    const state = Planner.state;

    // Completed courses live only in the Completed Courses card below — never
    // mixed into the pickable catalogue. Flagged ("tough, prefer to avoid")
    // courses stay right here — flagging is a note, not a hide.
    const visible = COURSES.filter(c => !state.taken.has(c.code) && matchesSearch(c, search));

    if (visible.length === 0) {
      body.innerHTML = `<div class="empty-msg">No courses match. Try clearing the search.</div>`;
    } else {
      const groups = groupCourses(visible);

      body.innerHTML = groups.map(g => {
        const collapsed = state.collapsed.has(g.key);
        const rows = g.courses.map(c => courseRow(c)).join("");
        return `
          <div class="slot-group ${collapsed ? "collapsed" : ""}" data-key="${g.key}">
            <div class="slot-group-head" data-action="toggle-group" data-key="${g.key}"
            role="button" tabindex="0" aria-expanded="${!collapsed}">
              <span class="caret">▾</span>
              ${groupHeaderChip(g.key)}
              <span class="slot-group-title">${groupHeaderTitle(g.key)}</span>
              <span class="slot-group-count">${g.courses.length}</span>
            </div>
            <div class="slot-group-body">${rows}</div>
          </div>
        `;
      }).join("");
    }

    document.getElementById("collapseAllBtn").textContent = Planner.areAllCollapsed() ? "Expand all" : "Collapse all";

    // Real candidate pool: total courses minus ones already completed or
    // flagged as tough/avoid — separate from `visible`, which is just the
    // current search filter. Against still-needed picks, this reads as
    // e.g. "3/10" — 3 picks still needed out of 10 real candidates left.
    const poolSize = COURSES.length - state.taken.size - state.flagged.size;
    const stillNeeded = Planner.PICK_SLOTS.filter(({ key }) => !state.picks[key]).length;
    document.getElementById("poolStat").textContent = `${stillNeeded}/${poolSize} to choose`;
  }

  // Every course reaching this function is, by construction, not completed
  // (catalogue() already filtered those out) — so no "already taken" branch
  // is needed here; the ✓ button only ever moves a course *into* Completed.
  function courseRow(course) {
    const opts = slotOptions(course.slot);
    const isMulti = opts.length > 1;
    const info = Planner.rowStatus(course);
    const myLetter = info.status === "picked" ? info.letter : null;
    const usedElsewhere = Planner.allUsedLetters();

    const optionChips = opts.length
      ? `<span class="option-chips">${opts.map(l => {
          const cls = l === myLetter ? "reserved" : usedElsewhere.has(l) ? "used" : "";
          return `<span class="mini-chip ${cls}" style="background:${slotColor(l)}" title="${cls === "used" ? "Already used by another pick" : cls === "reserved" ? "Reserved for this pick" : "Still free"}">${l}</span>`;
        }).join("")}${isMulti ? `<span class="option-count">${opts.filter(l => !usedElsewhere.has(l) || l === myLetter).length}/${opts.length} free</span>` : ""}</span>`
      : "";

    const buttons = Planner.PICK_SLOTS.map(({ key, label, isTa }) => {
      const pick = Planner.state.picks[key];
      const isActive = pick && pick.code === course.code;
      const occupiedByOther = pick && !isActive;
      const shortLabel = isTa ? "TA" : key.slice(1);

      let disabled, title;
      if (isActive) {
        disabled = false;
        title = `Remove from ${label} (using slot ${pick.letter})`;
      } else if (occupiedByOther) {
        disabled = true;
        title = `${label} already has ${pick.code} — remove it first`;
      } else {
        const available = Planner.availableOptionsFor(course, key);
        disabled = available.length === 0;
        title = disabled ? "Blocked — clashes with your other picks" : `Set as ${label}`;
      }

      return `<button class="pick-btn ${isTa ? "ta" : ""} ${isActive ? "active" : ""} ${occupiedByOther ? "held" : ""}"
        title="${title}"
        data-action="pick" data-slot="${key}" data-code="${course.code}"
        ${disabled ? "disabled" : ""}>${shortLabel}</button>`;
    }).join("");

    const pending = Planner.pendingChoice;
    const isChoosing = pending && pending.code === course.code;
    const chooserStrip = isChoosing ? chooserStripFor(course) : "";
    const rowStateClass = info.status === "picked" ? "is-picked" : info.status === "blocked" ? "is-blocked" : "";
    const isFlagged = Planner.state.flagged.has(course.code);
    const flagBadge = isFlagged
      ? `<span class="row-badge badge-flagged" title="You marked this as tough / prefer not to take">tough</span>`
      : "";

    return `
      <div class="course-row ${rowStateClass} ${isChoosing ? "choosing" : ""}">
        <div class="course-main">
          <div>
            <span class="course-code">${course.code}</span><span class="course-name">${course.name}</span>${isMulti ? optionChips : ""}
            ${statusBadge(info)}${flagBadge}
          </div>
          <div class="course-meta">${course.faculty}${course.room ? " · " + course.room : ""}</div>
          ${chooserStrip}
        </div>
        <div class="course-stats">${course.ltp} · ${course.credits} cr</div>
        <div class="course-actions">
          ${buttons}
          <button class="taken-btn" title="Mark as completed" data-action="taken" data-code="${course.code}">✓</button>
          <button class="flag-btn ${isFlagged ? "active" : ""}" title="${isFlagged ? "Unmark tough course" : "Mark as tough — prefer not to take"}"
            data-action="flag" data-code="${course.code}">⚑</button>
        </div>
      </div>
    `;
  }

  function chooserStripFor(course) {
    const { slotKey, code } = Planner.pendingChoice;
    const label = Planner.PICK_SLOTS.find(p => p.key === slotKey).label;
    const available = Planner.availableOptionsFor(course, slotKey);
    const chips = available.map(l =>
      `<button class="choice-chip" style="background:${slotColor(l)}" data-action="confirm-choice" data-slot="${slotKey}" data-code="${code}" data-letter="${l}">${l}</button>`
    ).join("");
    return `
      <div class="chooser-strip">
        <span>This course has multiple slot options — pick one for ${label}:</span>
        ${chips}
        <button class="chooser-cancel" data-action="cancel-choice">cancel</button>
      </div>
    `;
  }

  function slotMap() {
    const el = document.getElementById("slotMap");
    const letters = [...new Set(COURSES.flatMap(c => slotOptions(c.slot)))].sort();
    const occupied = new Set(
      Planner.PICK_SLOTS.map(({ key }) => Planner.state.picks[key]).filter(Boolean).map(p => p.letter)
    );
    el.innerHTML = letters.map(l => {
      const filled = occupied.has(l);
      const color = slotColor(l);
      const style = filled ? `background:${color};border-color:${color}` : `border-color:${color}55`;
      return `<span class="slot-map-item ${filled ? "filled" : ""}" style="${style}" title="Slot ${l}${filled ? " — in use" : ""}">${l}</span>`;
    }).join("");
  }

  function picks() {
    const el = document.getElementById("picksBody");
    el.innerHTML = Planner.PICK_SLOTS.map(({ key, label, isTa }) => {
      const pick = Planner.state.picks[key];
      const course = pick ? Planner.courseByCode(pick.code) : null;
      const filledClass = course ? "filled" : "";
      const taClass = isTa ? "ta-card" : "";
      const opts = course ? slotOptions(course.slot) : [];
      const multiNote = course && opts.length > 1
        ? `<span class="pick-multi-note">using slot ${pick.letter} (${opts.length} options for this course)</span>`
        : "";
      const inner = course
        ? `<div class="pick-course-name">${course.name}</div>
           <div class="pick-course-sub">
             <span class="course-code">${course.code}</span>
             <span class="slot-chip" style="background:${slotColor(pick.letter)}">${pick.letter}</span>
             <span>${course.credits} cr</span>
           </div>
           ${multiNote}`
        : `<div class="pick-empty">${isTa ? "Pick the course you're TAing" : "No course selected yet"}</div>`;
      return `
        <div class="pick-card ${filledClass} ${taClass}">
          <div class="pick-label">
            <span class="${isTa ? "tag-ta" : ""}">${label}</span>
            ${course ? `<button class="remove-btn" data-action="remove" data-slot="${key}">remove</button>` : ""}
          </div>
          <div class="pick-content">${inner}</div>
        </div>
      `;
    }).join("");
  }

  function completed() {
    const body = document.getElementById("completedBody");
    const countEl = document.getElementById("completedCount");
    const list = COURSES.filter(c => Planner.state.taken.has(c.code));

    countEl.textContent = `${list.length} course${list.length === 1 ? "" : "s"}`;

    if (list.length === 0) {
      body.innerHTML = `<div class="empty-msg">Nothing marked completed yet — use the ✓ on a catalogue row to move it here.</div>`;
      return;
    }

    body.innerHTML = list.map(c => {
      const opts = slotOptions(c.slot);
      const chips = opts.length
        ? `<span class="option-chips">${opts.map(l => `<span class="mini-chip" style="background:${slotColor(l)}">${l}</span>`).join("")}</span>`
        : "";
      return `
        <div class="completed-row">
          <div class="completed-main">
            <span class="course-code">${c.code}</span><span class="course-name">${c.name}</span>${chips}
          </div>
          <div class="completed-stats">${c.credits} cr</div>
          <button class="ghost-btn" data-action="undo-taken" data-code="${c.code}">Undo</button>
        </div>
      `;
    }).join("");
  }

  function summary() {
    const missing = Planner.PICK_SLOTS.filter(({ key }) => !Planner.state.picks[key]);
    const filled = Planner.PICK_SLOTS.length - missing.length;
    document.querySelector(".selection .panel-sub").textContent = `${filled} of 4 picks`;

    const stillNeededEl = document.getElementById("stillNeeded");
    stillNeededEl.innerHTML = missing.length === 0
      ? `<span class="still-needed-done">All 4 picks made</span>`
      : `<span class="still-needed-label">Still need:</span> ${missing.map(({ label }) => `<span class="still-needed-chip">${label}</span>`).join("")}`;

    const totalCredits = Planner.PICK_SLOTS.reduce((sum, { key }) => {
      const pick = Planner.state.picks[key];
      return pick ? sum + Planner.courseByCode(pick.code).credits : sum;
    }, 0);
    document.getElementById("creditsTotal").textContent = `${totalCredits} credit${totalCredits === 1 ? "" : "s"} selected`;
  }

  function all() {
    catalogue();
    slotMap();
    picks();
    summary();
    completed();
  }

  return { all, catalogue };
})();
