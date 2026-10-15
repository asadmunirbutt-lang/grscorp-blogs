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

Your tone: helpful, warm, calm, concise. Answer in 2-4 sentences when possible. If you don't know something specific about Azlan's personal history, direct staff to ask admin directly.`;


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

Your tone: warm, empathetic, practical, non-judgmental. Use plain language. Acknowledge the difficulty of caregiving. Celebrate small victories.`;

// ── Helper: call Anthropic API ────────────────────────────────────────────────

async function callAnthropicAPI(systemPrompt, messages) {
    const key   = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022';

    const reqHeaders = {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
    };
    const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
    if (workspaceId) reqHeaders['anthropic-workspace-id'] = workspaceId;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({
            model,
            max_tokens: 600,
            system: systemPrompt,
            messages,
            temperature: 0.7
        })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Anthropic API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || "I'm having trouble responding right now. Please try again.";
}

// ── Allowed origins ───────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
    'https://blogs.grscorp.us',
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
            const { messages, mode } = body;

            // messages = [{ role: 'user'|'assistant', content: '...' }, ...]
            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                return { status: 400, headers, body: JSON.stringify({ error: 'messages array required' }) };
            }

            // Pick system prompt based on mode
            const systemPrompt = mode === 'autism-family'
                ? AUTISM_FAMILY_SYSTEM_PROMPT
                : NANNY_SYSTEM_PROMPT;

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
