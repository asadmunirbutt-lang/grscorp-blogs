# Happy Nannying — Project Context

## What This Is
A household management SPA for GRSCORP nannies/caretakers, deployed at **blogs.grscorp.us/nanny/**

Single-file app: `/home/user/grscorp-blogs/nanny/index.html` (HTML + CSS + JS, no build step)

---

## Firebase Setup
- **Project**: nanny-22cb0
- **SDK**: Firebase Compat v9.23.0 (app, auth, firestore, storage)
- **Plan**: Blaze (paid — Storage enabled)
- **Config** (in index.html around line 1285):
  ```js
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDpe1XWs4eZDm7FbID2mBRPKoV76Fiyv6c",
    authDomain: "nanny-22cb0.firebaseapp.com",
    projectId: "nanny-22cb0",
    storageBucket: "nanny-22cb0.firebasestorage.app",
    messagingSenderId: "1074639853147",
    appId: "1:1074639853147:web:86968de12c2f3f20e5517e"
  };
  const ADMIN_EMAILS = ['amb@grscorp.us'];
  const FACILITY = 'grscorp';
  ```
- **Admin email**: amb@grscorp.us (always gets admin role)
- **Secondary Firebase app** used for staff creation so admin stays logged in

---

## Firestore Collections
| Collection | Purpose |
|---|---|
| `submissions` | Task checklist submissions per shift |
| `notes` | Staff notes with optional photo |
| `supplies` | Supply requests (pending/ordered status) |
| `laundry` | Laundry load log entries |
| `facilities/grscorp` | Rooms config + carry-overs map |
| `staff` | Staff email list (admin manages) |
| `users` | User profiles + roles |

**Important**: Queries use single-field `orderBy` only (no compound indexes). Facility filtering is done client-side.

---

## Rooms (DEFAULT_ROOMS)
17 rooms split into two floors:

**Upstairs** (floor: 'upstairs'):
1. Azlan's Room
2. Azlan's Bathroom
3. Asad's Room
4. Asad's Bathroom
5. Hallways Upstairs
6. Pet Care 🐾 ← pets live here, NOT a separate floor

**Downstairs** (floor: 'downstairs'):
7. Hallways Downstairs
8. Stairs
9. Study Room
10. Living Room
11. Dining Area
12. Kitchen
13. Office
14. Downstairs Bathroom
15. Final Checks
16. Laundry Room (tracks loads, not a standard checklist room)

**Note**: There are only TWO floors — Upstairs and Downstairs. No "Pets" floor. Pet Care is Upstairs.

### Task fields on each room:
```js
{ id: 'task-id', name: 'Task Name', desc: 'Optional italic description', monFriOnly: true }
```
- `monFriOnly: true` — task only shows on Mondays and Fridays (e.g. expiry check in Kitchen)
- `desc` — shown as italic subtitle under task name

### Carry-overs (Later tasks):
Stored in `facilities/grscorp` as:
```js
carryOvers[roomId][taskName] = { count: N, note: '...' }
```
- count=1 → shows purple "Carry Over" badge
- count≥2 → shows red pulsing "CRITICAL" badge, second shift must address it

---

## UI Layout (3-column)
```
| Laundry (230px) | Tasks (flex) | Notes + Supplies (330px) |
```
CSS grid template areas: `"laundry tasks notes"`

Responsive breakpoints:
- ≤960px: 2-col (tasks+notes top, laundry below)
- ≤620px: 1-col stacked

---

## Shifts
**Weekdays group** (Mon–Fri):
- Morning ☀️
- Mid 🌤
- Night 🌙

**Weekends group**:
- A Shift 🅰
- B Shift 🅱

Rules:
- Non-admin: once a shift is selected it locks (other group hidden, card disabled)
- Admin: can freely change shift at any time

---

## Task Status Flow
Each task has three buttons:
- ✅ Yes (done)
- 🚫 Not Needed
- ⏳ Later (requires note — shown as carry-over next shift)

---

## Laundry Tracker (left column)
Categories: Wearable Clothes, Cleaning Cloths, Linen & Bed Sheets

Types logged per entry: Wash 🫧, Dryer 🌀, Fold 👕

Entries stored with: category, type, who, timestamp — grouped by date (collapsible).

---

## Notes (right column)
- Staff can add text notes + optional photo (camera or gallery)
- Photos uploaded to Firebase Storage
- Newest notes appear at top
- Admin can delete notes

## Supplies (right column, below notes)
- Staff request supplies with item name + quantity
- Admin can mark status: Pending / Ordered
- Admin can delete entries

---

## Admin-Only Features
- Daily tab (📅) and Weekly tab (📊) — hidden from non-admin
- Delete buttons on notes and supplies
- Admin panel (⚙️ tab) with sub-tabs:
  - Staff management (create/list staff)
  - Room/task management (add/delete tasks per room)

---

## Color Scheme (CSS variables)
```css
--bg:       #0a0818   /* deep navy */
--surface:  #120e2e
--card:     #1a1240
--card2:    #221850
--coral:    #ff5252
--orange:   #ff8c00
--yellow:   #ffd000
--mint:     #00e5a0
--blue:     #2979ff
--pink:     #ff4081
--lavender: #b44eff
--teal:     #00bcd4
--lime:     #76ff03
```

Animated rainbow shimmer used on: app name, progress bar, submit button, admin heading.

---

## Git / Deployment
- **Repo**: asadmunirbutt-lang/grscorp-blogs
- **Deploy branch**: master (GitHub Pages)
- **Feature branch**: claude/site-clone-github-integration-RBLAf
- **Workflow**: develop on feature branch → merge directly to master (no PR needed)
- Push command: `git push origin master`

---

## Known Quirks / Watch-outs
1. **visibleTasks must be defined BEFORE the `let html =` line** in `renderTasks()` — was a past bug that caused no tasks to show
2. `needsReset` in `loadRooms()` checks for missing `floor` field OR `floor === 'pets'` to force Firestore data migration
3. Firestore queries must NOT combine `.where('facility')` + `.orderBy('timestamp')` — no compound index exists; filter facility client-side instead
4. `populateRoomSel` and `populateAdminRoomSel` both use groups: `[['upstairs','🔼 Upstairs'],['downstairs','🔽 Downstairs']]` only
