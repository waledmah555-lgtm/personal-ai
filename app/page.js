"use client";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

async function send() {
  setLoading(true);
  setReply("Thinking...");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    const data = await res.json();
    setReply(data.reply || "No reply returned");

  } catch (err) {
    console.error(err);
    setReply("ERROR: " + err.message);
  }

  setLoading(false);
}

  return (
    <main style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>My Personal AI</h2>

      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Ask anything..."
        style={{ width: "100%", height: 120 }}
      />

      <br /><br />

      <button onClick={send} disabled={loading}>
        Send
      </button>

      <pre style={{
        marginTop: 20,
        background: "#111",
        color: "#eee",
        padding: 15
      }}>
        {reply}
      </pre>
    </main>
  );
}
