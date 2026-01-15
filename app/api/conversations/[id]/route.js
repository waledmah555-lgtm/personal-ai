import { kv } from "@vercel/kv";

export async function GET(req, { params }) {
  try {
    const convo = await kv.get(`conversation:${params.id}`);

    if (!convo) {
      return new Response(
        JSON.stringify({ error: "Conversation not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(convo), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
