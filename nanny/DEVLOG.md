# Happy Nannying — Dev Log & Azure Bot Plan

> Last updated: June 9, 2026  
> Repo: `asadmunirbutt-lang/grscorp-blogs`  
> Live URL: https://blogs.grscorp.us/nanny/  
> Working branch: `claude/nanny-app-XUtYD` → merged to `master`

---

## Session Summary — June 9, 2026

All changes are live on `master` and deployed via GitHub Pages.

---

### 1. Notes — Date-Grouped Dropdowns

**What changed:** Notes are now grouped by date with collapsible headers (same visual pattern as the laundry log). Today's group starts expanded, older dates collapsed.

**Files:** `nanny/index.html`  
**Functions:** `loadNotes()`, `toggleNotesGroup()`, `buildNoteElHtml()`  
**CSS classes:** `.notes-date-group`, `.notes-date-hdr`, `.notes-date-entries`, `.ndh-arrow`

---

### 2. Shift Acknowledgment Modal

**What changed:** When any staff member taps a shift card, a modal appears showing all notes from the last 48 hours. They must click "I've Read These Notes — Start Shift" before the shift locks.

**Files:** `nanny/index.html`  
**Functions:** `selectShift()`, `showShiftAckModal()`, `confirmShiftAck()`, `finalizeShiftSelect()`  
**HTML:** `#shift-ack-overlay`, `#shift-ack-modal`  
**CSS classes:** `.sam-*`  

---

### 3. Task Removals (Jade's Feedback)

Removed the following tasks from `DEFAULT_ROOMS` and bumped `ROOMS_VERSION` to `4`:

| Room | Task Removed |
|---|---|
| Azlan's Room | Steam mop floor |
| Stairs | Steam mop |
| Stairs | Spot wall cleaning |
| Hallways Upstairs | Clean windows |
| Hallways Downstairs | Clean windows |
| Downstairs Bathroom | Clean windows |

---

### 4. Daily Report — Prev/Next Day Navigation

**What changed:** Replaced the bare date picker with ◀ / date label / ▶ navigation arrows plus a **Today** button. The tab auto-loads today's data when opened.

**Functions:** `stepDailyDate(delta)`, `jumpDailyToday()`, `loadDailyReport()`  
**HTML:** `.date-nav-row`, `#daily-date-label`, `#daily-next-btn`

---

### 5. Daily Report — Missed Rooms Section

**What changed:** After the submitted rooms, the daily report now shows an **❌ Not Submitted** section listing every room that had no checklist entry for that date.

**Logic:** Compares `rooms` global array against submitted `roomId` / `room` fields  
**CSS:** `.daily-section-hdr`, `.sub-card-missed`, `.sub-pill-missed`

---

### 6. Profile Pictures in Reports

**What changed:** Staff profile photos now appear as circular avatars on every submission card in the daily and weekly reports.

**How it works:**
- `userPhotoURL` is now saved in each submission document at write time
- On report load, any submission missing `userPhotoURL` triggers a live lookup from the `users` Firestore collection
- Falls back to colored initials if no photo exists

**Functions:** `buildAvatarHtml(name, photoURL)`, updated `buildSubCard()`, updated `loadDailyReport()`, updated `loadWeeklyReport()`  
**CSS:** `.sub-avatar`, `.sub-avatar-init`

---

### 7. Food Log, Medication Log, Incidents — Date-Grouped History

**What changed:** All three logs now use the same collapsible date-group pattern as laundry and notes. Today's entries start expanded.

**Functions:** `loadFoodLog()`, `loadMedications()`, `loadIncidents()`  
Reuses existing `.laundry-date-group` CSS and `toggleLaundryGroup()` function.

---

### 8. AI Nanny Assistant Bot

**What changed:** A floating 💬 button at the bottom-right of the screen (visible after login) opens a chat panel. Powered by a keyword-matching knowledge base covering:

- App usage (shifts, checklist, tasks, notes, supplies, laundry, logs)
- Azlan's care (routine, diet, communication — with graceful "ask admin" fallbacks for private details)
- House rules and expectations
- Emergency steps

**Files:** `nanny/index.html`  
**HTML:** `#bot-btn`, `#bot-panel`  
**Functions:** `toggleBot()`, `sendBotMessage()`, `getBotReply()`, `appendBotMsg()`, `appendBotTyping()`  
**Data:** `BOT_KB` array (knowledge base), `BOT_WELCOME` string  
**CSS classes:** `#bot-btn`, `#bot-panel`, `.bot-*`

> **Note:** The bot currently uses keyword matching. Azure OpenAI integration is ready to wire in — see plan below.

---

## Azure Bot Integration Plan

> **Status:** Waiting for Azure nonprofit grant activation  
> **Grant account:** admin@grscorp.onmicrosoft.com  
> **Grant amount:** $2,000/year  
> **Azure Portal:** https://portal.azure.com

---

### Step 1 — Create Azure OpenAI Resource

1. Log in to https://portal.azure.com with `admin@grscorp.onmicrosoft.com`
2. Search for **Azure OpenAI**
3. Create a new resource:
   - Subscription: your nonprofit subscription
   - Resource group: `grscorp-nanny` (create new)
   - Region: `East US` (best availability)
   - Name: `grscorp-openai`
   - Pricing tier: Standard S0
4. Once created → go to **Keys and Endpoint** → copy **Key 1** and **Endpoint URL**

---

### Step 2 — Deploy a Model

1. In the Azure OpenAI resource → click **Go to Azure OpenAI Studio**
2. Under **Deployments** → click **+ New deployment**
3. Model: `gpt-4o-mini` (cheap, fast, great for chat)
4. Deployment name: `nanny-bot` (remember this name)
5. Click Deploy

---

### Step 3 — Create an Azure Function (API proxy)

The API key must NOT be in the front-end code. An Azure Function acts as a secure proxy.

1. In Azure Portal → create a **Function App**:
   - Name: `grscorp-nanny-api`
   - Runtime: Node.js 20
   - Region: East US
   - Plan: Consumption (pay-per-use, near-free at low volume)

2. Create a function called `chat` (HTTP trigger):

```javascript
// Azure Function: chat/index.js
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
);

const SYSTEM_PROMPT = `You are a helpful assistant for the Happy Nannying app used by 
nannies at the GRSCorp household. Help new staff understand their duties and Azlan's care.

== ABOUT AZLAN ==
[Admin: fill in — age, personality, communication style, diagnosis if relevant]

== DAILY ROUTINE ==
[Admin: fill in — wake time, meal times, activities, bedtime]

== FOOD & DIET ==
[Admin: fill in — likes, dislikes, allergies, portion sizes]

== SPECIAL CONSIDERATIONS ==
[Admin: fill in — medical needs, sensory preferences, triggers, calming strategies]

== APP USAGE ==
- 17 rooms across 2 floors (Upstairs and Downstairs)
- Shifts: Weekdays (Morning ☀️ / Mid 🌤 / Night 🌙), Weekends (A Shift / B Shift)
- Mark tasks: Yes ✅ / Not Needed 🚫 / Later ⏳ (Later requires a note)
- Notes, Supplies, and Laundry are in the right/left columns
- Submit each room after completing it

== HOUSE RULES ==
[Admin: fill in — phone policy, hygiene standards, punctuality, visitors]

== EMERGENCY ==
- Life-threatening: call 911 immediately, then call admin
- Incidents: log in the Incidents section of the app
- Emergency contacts: [Admin: add numbers here]

Keep answers concise, warm, and practical. If unsure, suggest asking the admin.`;

module.exports = async function (context, req) {
  const { message } = req.body;
  if (!message) { context.res = { status: 400, body: 'No message' }; return; }

  const response = await client.getChatCompletions('nanny-bot', [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: message }
  ], { maxTokens: 400, temperature: 0.5 });

  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ reply: response.choices[0].message.content })
  };
};
```

3. In Function App → **Configuration** → add Application Settings:
   - `AZURE_OPENAI_ENDPOINT` = `https://grscorp-openai.openai.azure.com/`
   - `AZURE_OPENAI_KEY` = (paste Key 1 from Step 1)

---

### Step 4 — Wire Up the Bot in the App

In `nanny/index.html`, find the `getBotReply()` function and replace it:

```javascript
// Replace this:
function getBotReply(msg) {
  const lower = msg.toLowerCase();
  for (const entry of BOT_KB) {
    if (entry.k.some(kw => lower.includes(kw))) return entry.a;
  }
  return `I'm not sure about that — try rephrasing...`;
}

// With this:
async function getBotReply(msg) {
  try {
    const resp = await fetch('https://grscorp-nanny-api.azurewebsites.net/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();
    return data.reply;
  } catch (e) {
    // Fallback to keyword KB if AI is unavailable
    const lower = msg.toLowerCase();
    for (const entry of BOT_KB) {
      if (entry.k.some(kw => lower.includes(kw))) return entry.a;
    }
    return `I'm having trouble connecting right now. Try the Team Guide or ask your admin.`;
  }
}
```

Also update `sendBotMessage()` to use `await`:
```javascript
const reply = await getBotReply(text);  // add await
```

---

### Step 5 — Fill in Azlan's Details

Edit the `SYSTEM_PROMPT` in the Azure Function (Step 3) to fill in all the `[Admin: fill in]` sections with Azlan's real information. This is the only place you need to add personal details — it stays server-side and is never exposed to the front end.

---

## Cost Estimate (Azure OpenAI)

| Usage | Model | Estimated Monthly Cost |
|---|---|---|
| ~200 queries/day | gpt-4o-mini | ~$1–3/month |
| ~500 queries/day | gpt-4o-mini | ~$3–8/month |

Well within the $2,000/year grant budget.

---

## Firestore Collections (current)

| Collection | Purpose |
|---|---|
| `submissions` | Task checklist submissions per shift (now includes `userPhotoURL`) |
| `notes` | Staff notes with optional photo (`acknowledged`, `critical` fields) |
| `supplies` | Supply requests (pending/ordered) |
| `laundry` | Laundry load log entries |
| `facilities/grscorp` | Rooms config + carry-overs map (`roomsVersion: 4`) |
| `staff` | Staff email list |
| `users` | User profiles + roles + `photoURL` |
| `foodlog` | Azlan's food/meal entries |
| `medications` | Medication log entries |
| `incidents` | Incident log entries (poop/accident/other) |

---

## Reminders

- **Azure grant follow-up call:** June 16, 2026 (Microsoft Concierge)
- **Azure grant renewal:** June 9, 2027 (reminder set for May 10, 2027)
- **Renew at:** https://nonprofit.microsoft.com → Nonprofit grants → $2,000 Azure Grant
- **ROOMS_VERSION is now 4** — bump to 5 next time rooms/tasks change
- **Deploy branch:** `master` (GitHub Pages auto-deploys)
