import { kv } from "@vercel/kv";

export async function GET(req, { params }) {
  const convo = await kv.get(`conversation:${params.id}`);
  if (!convo) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify(convo), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function PATCH(req, { params }) {
  const { title } = await req.json();
  const convo = await kv.get(`conversation:${params.id}`);

  if (!convo) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  convo.title = title;
  convo.updatedAt = new Date().toISOString();

  await kv.set(`conversation:${params.id}`, convo);

  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function DELETE(req, { params }) {
  await kv.del(`conversation:${params.id}`);

  const ids = await kv.lrange("conversations:list", 0, -1);
  const remaining = ids.filter(i => i !== params.id);

  await kv.del("conversations:list");
  if (remaining.length) {
    await kv.lpush("conversations:list", ...remaining);
  }

  return new Response(JSON.stringify({ status: "deleted" }), {
    headers: { "Content-Type": "application/json" }
  });
}
