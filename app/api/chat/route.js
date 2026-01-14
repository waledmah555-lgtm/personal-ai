import OpenAI from "openai";
import { kv } from "@vercel/kv";
import { profile } from "../../../lib/profile";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    const sessionKey = "session:default";
    let sessionMemory = (await kv.get(sessionKey)) || [];

    sessionMemory.push({ role: "user", content: message });
    sessionMemory = sessionMemory.slice(-10);

    const response = await client.responses.create({
      model: "gpt-5",
      input: [
        { role: "system", content: profile },
        ...sessionMemory
      ],
      max_output_tokens: 500
    });

    const reply =
      response.output?.[0]?.content?.[0]?.text ||
      "No response generated";

    sessionMemory.push({ role: "assistant", content: reply });
    sessionMemory = sessionMemory.slice(-10);

    await kv.set(sessionKey, sessionMemory);

    console.log("OpenAI response received");

    return new Response(
      JSON.stringify({ reply }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("API ERROR:", err);

    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
