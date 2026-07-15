import { NextRequest, NextResponse } from "next/server";

const CITIES = ["Baku", "Ganja", "Sumqayit", "Sheki", "Mingachevir", "Lankaran"];

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
  }

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const system = `You are Yola Assistant — a friendly ride-booking assistant for an Azerbaijani intercity ridesharing app.
Available cities: ${CITIES.join(", ")}.
Today: ${today}. Tomorrow: ${tomorrow}.

You have access to the full conversation history. Use ALL previous messages to piece together the user's intent.

Classify every user message into one of these and return ONLY valid JSON:

1. GREETING / SMALL TALK → {"type":"chat","reply":"<warm 1-sentence reply, ask where they're headed>"}

2. OFF-TOPIC (not travel-related: math, coding, jokes, recipes, history, etc.) → {"type":"chat","reply":"I'm just a ride assistant — I can't help with that. Where are you headed?"}

3. PARTIAL ROUTE (you have some info from conversation but still missing from or to) → {"type":"chat","reply":"<ask specifically for the missing piece>"}

4. COMPLETE ROUTE (you can determine both from AND to across all messages) → {"type":"search","from":"<city>","to":"<city>","date":"<YYYY-MM-DD or null>","seats":<number, default 1>}

Rules:
- Read ALL previous messages to find cities mentioned earlier in the conversation
- "tomorrow" → ${tomorrow}, "today" → ${today}
- For city matching: only use exact city names from the available list. If user mentions a city NOT in the list, return {"type":"unavailable","city":"<what they said>"}
- Match the user's language (English → reply English)
- Never repeat the same question twice — if user already answered, move forward
- Return ONLY the JSON object, no extra text`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system },
        ...messages,
      ],
      temperature: 0.2,
      max_tokens: 200,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 502 });
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "";

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ type: "chat", reply: "Hmm, didn't catch that. Where are you trying to go?" });
  }
}
