import OpenAI from "openai";
import { kv } from "@vercel/kv";
import { profile } from "../../../lib/profile";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function now() {
  return new Date().toISOString();
}

export async function POST(req) {
  try {
    const { message } = await req.json();
    if (!message) {
      throw new Error("Missing message");
    }

    // ─────────────────────────────────────
    // 1️⃣ Get or create active conversation
    // ─────────────────────────────────────
    let conversationId = await kv.get("conversation:active");

    if (!conversationId) {
      conversationId = crypto.randomUUID();

      await kv.set("conversation:active", conversationId);
      await kv.lpush("conversations:list", conversationId);

      await kv.set(`conversation:${conversationId}`, {
        id: conversationId,
        title: message.slice(0, 40),
        model: "gpt-4.1",
        messages: [],
        totals: { input: 0, output: 0, total: 0 },
        createdAt: now(),
        updatedAt: now()
      });
    }

    let convo = await kv.get(`conversation:${conversationId}`);
    if (!convo) {
      throw new Error("Conversation not found in KV");
    }

    // ─────────────────────────────────────
    // 2️⃣ Build prompt WITH memory replay
    // ─────────────────────────────────────
    const history = convo.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const chatMessages = [
      { role: "system", content: profile },
      ...history,
      { role: "user", content: message }
    ];

    // ─────────────────────────────────────
    // 3️⃣ Call OpenAI
    // ─────────────────────────────────────
    const response = await client.responses.create({
      model: "gpt-4.1",
      input: chatMessages,
      max_output_tokens: 500
    });

    const reply = response.output_text || "No response generated.";

    // ─────────────────────────────────────
    // 4️⃣ Token usage (safe extraction)
    // ─────────────────────────────────────
    const usage = response.usage || {};
    const inputTokens = usage.input_tokens || 0;
    const outputTokens = usage.output_tokens || 0;
    const totalTokens = inputTokens + outputTokens;

    // ─────────────────────────────────────
    // 5️⃣ Persist messages
    // ─────────────────────────────────────
    convo.messages.push(
      {
        role: "user",
        content: message,
        tokens: {
          input: inputTokens,
          output: 0,
          total: inputTokens
        },
        timestamp: now()
      },
      {
        role: "assistant",
        content: reply,
        tokens: {
          input: 0,
          output: outputTokens,
          total: outputTokens
        },
        timestamp: now()
      }
    );

    // Auto-generate title from first user message
if (!convo.title || convo.title === "New Conversation") {
  const firstUserMessage = convo.messages.find(
    m => m.role === "user"
  );

  if (firstUserMessage) {
    convo.title = firstUserMessage.content.slice(0, 40);
  }
}


    convo.totals.input += inputTokens;
    convo.totals.output += outputTokens;
    convo.totals.total += totalTokens;
    convo.updatedAt = now();

    await kv.set(`conversation:${conversationId}`, convo);

    // ─────────────────────────────────────
    // 6️⃣ Respond to frontend
    // ─────────────────────────────────────
    return new Response(
      JSON.stringify({
        reply,
        tokens: convo.totals,
        conversationId
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("CHAT ERROR:", err);

    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
