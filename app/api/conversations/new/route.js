import { kv } from "@vercel/kv";
import { randomUUID } from "crypto";

export async function POST() {
  const id = randomUUID();

  const convo = {
    id,
    title: "New conversation",
    messages: [],
    totals: { total: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await kv.set(`conversation:${id}`, convo);
  await kv.lpush("conversations:list", id);
  await kv.set("conversation:active", id);

  return new Response(JSON.stringify(convo), {
    headers: { "Content-Type": "application/json" }
  });
}
