import OpenAI from "openai";
import { kv } from "@vercel/kv";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const { message } = await req.json();
    if (!message) {
      return new Response(
        JSON.stringify({ error: "Missing message" }),
        { status: 400 }
      );
    }

    // ─────────────────────────────
    // Get or create active conversation
    // ─────────────────────────────
    let conversationId = await kv.get("conversation:active");

    if (!conversationId) {
      conversationId = crypto.randomUUID();

      await kv.set("conversation:active", conversationId);
      await kv.lpush("conversations:list", conversationId);

      await kv.set(`conversation:${conversationId}`, {
        id: conversationId,
        title: message.slice(0, 40),
        messages: [],
        totals: { input: 0, output: 0, total: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const convo = await kv.get(`conversation:${conversationId}`);

    // ─────────────────────────────
    // Build prompt with history
    // ─────────────────────────────
    const chatMessages = convo.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    chatMessages.push({ role: "user", content: message });

    // ─────────────────────────────
    // Call OpenAI
    // ─────────────────────────────
    const response = await client.responses.create({
      model: "gpt-4.1",
      input: chatMessages,
      max_output_tokens: 500
    });

    const reply = response.output_text || "No response generated.";

    const usage = response.usage || {};
    const inputTokens = usage.input_tokens || 0;
    const outputTokens = usage.output_tokens || 0;
    const totalTokens = inputTokens + outputTokens;

    // ─────────────────────────────
    // Persist messages
    // ─────────────────────────────
    convo.messages.push(
      { role: "user", content: message },
      { role: "assistant", content: reply }
    );

    convo.totals.input += inputTokens;
    convo.totals.output += outputTokens;
    convo.totals.total += totalTokens;
    convo.updatedAt = new Date().toISOString();

    await kv.set(`conversation:${conversationId}`, convo);

    // ─────────────────────────────
    // RETURN FULL STATE (IMPORTANT)
    // ─────────────────────────────
    return new Response(
      JSON.stringify({
        conversationId,
        messages: convo.messages,
        tokens: convo.totals
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
