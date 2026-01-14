import OpenAI from "openai";
import { kv } from "@vercel/kv";
import { profile } from "../../../lib/profile";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    // Session ID (single-user personal tool)
    const sessionKey = "session:default";

    // Get last messages (session memory)
    let sessionMemory = (await kv.get(sessionKey)) || [];

    // Add user message
    sessionMemory.push({ role: "user", content: message });

    // Keep last 10 messages
    sessionMemory = sessionMemory.slice(-10);

    const response = await client.responses.create({
      model: "gpt-5",
      input: [
        { role: "system", content: profile },
        ...sessionMemory
      ],
      max_output_tokens: 500
    });

    const reply = response.output_text;

    // Add assistant reply
    sessionMemory.push({ role: "assistant", content: reply });
    sessionMemory = sessionMemory.slice(-10);

    // Save memory
    await kv.set(sessionKey, sessionMemory);

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "AI error" }),
      { status: 500 }
    );
  }
}
