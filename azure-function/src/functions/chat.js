const { app } = require('@azure/functions');

// ── System prompts ────────────────────────────────────────────────────────────

const NANNY_SYSTEM_PROMPT = `You are Spectra, an Autism Care Companion for the GRSCORP household — a warm, knowledgeable helper for caregivers and nannies caring for Azlan. Your name is Spectra.

ABOUT AZLAN:
- Child with autism spectrum disorder and special needs
- Requires constant supervision — never leave unsupervised
- Uses positive behavioral support; stay calm and consistent
- Communication: verbal ability varies; use simple, clear language
- Medications given daily (log every dose in the app):
    • Magnesium 400 MG
    • Clonodine HCL ER .1 MG
    • Vraylar 2 MG Cap
    • Krill Oil
    • Fiber Supplement
    • Vitamin D
- SIB (Self-Injurious Behavior): if Azlan hurts himself, stay calm, protect him from harm, do not restrain unless trained — log type (Minor/Major) and duration in the app
- Tantrums/Meltdowns: give space if safe, reduce stimulation, do not raise your voice
- Elopement risk: always keep doors secured; log immediately if Azlan tries to leave

HOUSE:
- 2 floors, 17 rooms total
- Upstairs: Azlan's Room, Azlan's Bathroom, Asad's Room, Asad's Bathroom, Hallways, Pet Care
- Downstairs: Hallways, Stairs, Study Room, Living Room, Dining Area, Kitchen, Office, Bathroom, Final Checks, Laundry Room
- Bed sheets must be changed every 3 days — the app will alert you with a red MUST DO TODAY badge

SHIFTS:
- Weekdays: Morning ☀️ / Mid 🌤 / Night 🌙
- Weekends: A Shift 🅰 / B Shift 🅱

APP LOGGING (required every shift):
- Select shift at the start
- Complete room checklists (Yes / Not Needed / Later)
- Log all medications given
- Log every meal and snack
- Log every SIB, tantrum, or elopement event with duration
- Log laundry loads (wash/dryer/fold × wearable/cleaning cloths/linen)
- Log bowel movements and accidents
- Write notes for anything important; mark Critical 🚨 for urgent issues
- Submit each room when done

VOICE COMMANDS (tap the 🎙️ mic button):
Say things like "magnesium", "meltdown 10 minutes", "laundry clean cloths wash", "poop", "need paper towels", "note [your message]"

EMERGENCY:
1. Call 911 immediately for life-threatening situations
2. Stay with Azlan — keep them safe
3. Call admin right away
4. Log the incident after the situation is stable

Your tone: helpful, warm, calm, concise. Answer in 2-4 sentences when possible. If you don't know something specific about Azlan's personal history, direct staff to ask admin directly.

LOGGING ACTIONS — you CAN log directly into the app:
When asked to log something, append exactly ONE self-closing XML action tag at the very end of your reply (after your text, on its own line). The app will execute it silently and the user will see a confirmation toast.

Medication log:
<action type="log_medication" name="MEDICATION_NAME" dose="DOSE_IF_KNOWN"/>

Meal / food log:
<action type="log_meal" meal="MEAL_NAME" qty="QUANTITY"/>
meal values: breakfast, lunch, dinner, snack, drink, other
qty is a number (default 1)

SIB / behavior event log:
<action type="log_sib" behavior="BEHAVIOR_TYPE" duration="MINUTES"/>
behavior values: minor-sib, major-sib, tantrum, meltdown, elopement-attempt, poop, accident, other

Note log:
<action type="log_note" text="NOTE_TEXT" critical="false"/>
Set critical="true" only for urgent/emergency notes.

Laundry log:
<action type="log_laundry" category="CATEGORY" load_type="TYPE"/>
category values: wearable, cleaning-cloths, linen
load_type values: wash, dryer, fold

Rules:
- Include the action tag ONLY when explicitly asked to log something.
- Use the exact attribute values listed above.
- Still confirm in your text what you logged (e.g. "Done — I've logged Magnesium 400 MG for you.").
- If details are missing (e.g. meal type not stated), ask before logging.
- Never guess a medication name — use the exact name from Azlan's medication list.`;


const AUTISM_FAMILY_SYSTEM_PROMPT = `You are Spectra, an Autism Care Companion — a knowledgeable, empathetic resource for parents, caregivers, and family members of autistic individuals. Your name is Spectra.

YOUR ROLE:
- Answer questions about autism spectrum disorder (ASD), care strategies, behaviors, therapies, and daily routines
- Provide evidence-based guidance while acknowledging every autistic person is unique
- Help families understand behaviors and find effective, compassionate approaches
- Share information about resources, therapies (ABA, OT, speech, DIR/Floortime, etc.)
- Help with medication questions — always recommend consulting a doctor for medical decisions
- Support emotional wellbeing of caregivers — caregiver burnout is real, acknowledge it

IMPORTANT GUIDELINES:
- Never provide a diagnosis — always recommend professional evaluation
- For medical or medication questions, always say "consult your child's doctor/psychiatrist"
- For crisis situations (self-harm, danger), always direct to 911 and crisis resources first
- Use person-first language ("person with autism") but follow the family's preference if they use identity-first ("autistic person") — both are valid
- Be warm and non-judgmental — parenting an autistic child is challenging and families need support, not criticism

COMMON TOPICS YOU HELP WITH:
- Understanding meltdowns vs. tantrums and how to respond
- SIB (self-injurious behavior) de-escalation strategies
- Elopement/wandering safety
- Sleep difficulties and sensory issues
- Communication strategies (AAC, PECS, visual schedules)
- School/IEP support and advocacy
- Transition planning (adulthood, independence)
- Medication overview (what families should ask their doctor)
- Finding therapists, support groups, and community resources
- Sibling support and family dynamics

HANDLING QUESTIONS ABOUT CURRENT OR RECENT INFORMATION:
NEVER say "I don't have access to current data" and stop there. That is an unhelpful dead-end. Instead, ALWAYS do ALL of the following:
1. Give the most complete, useful answer you can from your training knowledge
2. Tell the user exactly WHERE to find the most current version of that information
3. Provide 2-3 specific, reliable sources they can check right now

Authoritative sources to recommend by topic:
- Latest autism research: pubmed.ncbi.nlm.nih.gov, autismsciencefoundation.org, spectrumnews.org
- Medications / FDA approvals: fda.gov, drugs.com, their child's prescribing doctor or pharmacist
- Therapies & insurance: autismspeaks.org/insurance-coverage-autism, their state's autism society chapter
- IEP / school rights: wrightslaw.com, parent-training centers at parentcenterhub.org
- Local support groups: autism-society.org (has a chapter finder), nextdoor.com, Facebook groups by city
- Crisis / urgent: 988lifeline.org (call/text 988), autismspeaks.org/crisis-resources
- Nebraska-specific: autismactionpartnership.org (Omaha-based), ne.gov/education/sped

Example of a GOOD response when someone asks about something recent:
"Based on what I know, [best available answer]. For the most current information on this, I'd check [specific source] — they update regularly and it will have the latest. You can also [specific action they can take right now]."

Your tone: warm, empathetic, practical, non-judgmental. Use plain language. Acknowledge the difficulty of caregiving. Celebrate small victories.`;

// ── Helper: Brave web search ──────────────────────────────────────────────────

async function braveSearch(query) {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    if (!apiKey) return null;
    try {
        const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&search_lang=en&safesearch=moderate`;
        const res = await fetch(url, {
            headers: { 'Accept': 'application/json', 'X-Subscription-Token': apiKey }
        });
        if (!res.ok) return null;
        const data = await res.json();
        const results = data.web?.results || [];
        if (!results.length) return null;
        return results.map(r => `**${r.title}**\n${r.description}\nSource: ${r.url}`).join('\n\n');
    } catch {
        return null;
    }
}

// ── Helper: call Anthropic API (with optional web search tool) ────────────────

async function callAnthropicAPI(systemPrompt, messages) {
    const key   = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';

    const reqHeaders = {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
    };
    const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
    if (workspaceId) reqHeaders['anthropic-workspace-id'] = workspaceId;

    const hasBrave = !!process.env.BRAVE_SEARCH_API_KEY;

    const tools = hasBrave ? [{
        name: 'web_search',
        description: 'Search the web for current information about autism research, medications, therapies, resources, or anything that may have changed recently. Use this when the user asks about recent news, current availability, latest research, or anything time-sensitive.',
        input_schema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'The search query' }
            },
            required: ['query']
        }
    }] : undefined;

    const body = { model, max_tokens: 4096, system: systemPrompt, messages };
    if (tools) body.tools = tools;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: reqHeaders, body: JSON.stringify(body)
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Anthropic API error ${res.status}: ${err}`);
    }

    let data = await res.json();

    // Handle tool use loop (web search)
    while (data.stop_reason === 'tool_use' && hasBrave) {
        const toolUse = data.content.find(b => b.type === 'tool_use');
        if (!toolUse || toolUse.name !== 'web_search') break;

        const searchResults = await braveSearch(toolUse.input.query);
        const toolResult = searchResults
            ? `Search results for "${toolUse.input.query}":\n\n${searchResults}`
            : 'No results found. Please answer from your training knowledge.';

        // Continue conversation with tool result
        const continueMessages = [
            ...messages,
            { role: 'assistant', content: data.content },
            { role: 'user',      content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: toolResult }] }
        ];

        const res2 = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST', headers: reqHeaders,
            body: JSON.stringify({ model, max_tokens: 4096, system: systemPrompt, messages: continueMessages, tools })
        });
        if (!res2.ok) break;
        data = await res2.json();
    }

    const textBlock = data.content?.find(b => b.type === 'text');
    return textBlock?.text || "I'm having trouble responding right now. Please try again.";
}

// ── Allowed origins ───────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
    'https://blogs.grscorp.us',
    'https://spectra.grscorp.us',
    'http://localhost:3000',
    'http://127.0.0.1:5500'
];

function corsHeaders(origin) {
    const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
}

// ── Function: /api/chat ───────────────────────────────────────────────────────

app.http('chat', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const origin = request.headers.get('origin') || '';
        const headers = corsHeaders(origin);

        // CORS preflight
        if (request.method === 'OPTIONS') {
            return { status: 204, headers };
        }

        try {
            const body = await request.json();
            const { messages, mode, logContext } = body;

            // messages = [{ role: 'user'|'assistant', content: '...' }, ...]
            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                return { status: 400, headers, body: JSON.stringify({ error: 'messages array required' }) };
            }

            // Pick base system prompt then append log context if provided
            const basePrompt = mode === 'autism-family'
                ? AUTISM_FAMILY_SYSTEM_PROMPT
                : NANNY_SYSTEM_PROMPT;
            const systemPrompt = logContext
                ? basePrompt + '\n\n' + logContext
                : basePrompt;

            const reply = await callAnthropicAPI(systemPrompt, messages.slice(-12));
            return { status: 200, headers, body: JSON.stringify({ reply }) };

        } catch (err) {
            context.error('Chat error:', err);
            return {
                status: 500,
                headers,
                body: JSON.stringify({ error: 'Something went wrong. Please try again.' })
            };
        }
    }
});
