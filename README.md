# Semester Course Selector

A small local tool for planning course registration: pick electives + a TA
course from your department's subject list, with automatic conflict-checking
so you never double-book a timetable slot.

Repo: https://github.com/SumitKumar-17/Semester-Course-Selector

## Use it

No install, no build step — just open `index.html` in a browser.

- Courses are grouped by timetable slot; picking one blocks others in the
  same slot automatically (multi-option lab slots are handled too).
- Mark courses **completed** or **tough/avoid** to keep your view organized.
- Everything (picks, completed, flags) is saved in your browser's
  `localStorage` — nothing leaves your machine, nothing to log into.

## Using it for your own subjects

The course list lives in `data.js`, as a plain `COURSES` array. To reuse this
for your own department/semester:

1. Copy your subject list from your college ERP's course allocation page
   (subject code, name, faculty, L-T-P, credits, slot, room).
2. Replace the entries in the `COURSES` array in `data.js` with your own,
   following the same shape:
   ```js
   { code: "CS10003", name: "...", faculty: "...", ltp: "3-0-0", credits: 3, slot: "B31,B32,B33", room: "..." }
   ```
3. For `slot`, just paste the raw slot code(s) as your ERP lists them:
   - A lecture slot like `B31,B32,B33` (same letter repeated) is treated as
     one slot — "Slot B".
   - A lab slot with several different letters like `J,K,L,N,P,X` is treated
     as multiple *alternative* options, not one big conflict.
4. Update the `PICK_SLOTS` list in `state.js` if you need a different number
   of picks than "3 electives + 1 TA course."

That's it — no other file needs to change.
