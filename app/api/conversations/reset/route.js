import { kv } from "@vercel/kv";

export async function POST() {
  try {
    await kv.del("conversation:active");

    return new Response(
      JSON.stringify({ status: "ok" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
