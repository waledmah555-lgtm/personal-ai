import { kv } from "@vercel/kv";

export async function GET() {
  try {
    const ids = await kv.lrange("conversations:list", 0, -1) || [];

    const conversations = [];

    for (const id of ids) {
      const convo = await kv.get(`conversation:${id}`);
      if (convo) {
        conversations.push({
          id: convo.id,
          title: convo.title,
          updatedAt: convo.updatedAt
        });
      }
    }

    // Most recent first
    conversations.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    return new Response(JSON.stringify(conversations), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
