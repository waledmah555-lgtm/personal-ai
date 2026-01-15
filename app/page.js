"use client";

import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

export default function Page() {
  // ─────────────────────────────────────
  // State
  // ─────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");

  // ─────────────────────────────────────
  // Load conversation list on page load
  // ─────────────────────────────────────
  useEffect(() => {
 async function startNewConversation() {
  await fetch("/api/conversations/reset", { method: "POST" });

  setMessages([]);
  setActiveId(null);

  const res = await fetch("/api/conversations");
  setConversations(await res.json());
}



    loadConversations();
  }, []);

  // ─────────────────────────────────────
  // Send message
  // ─────────────────────────────────────
  async function send() {
    if (!prompt.trim()) return;

    // Optimistic UI update
    setMessages(prev => [
      ...prev,
      { role: "user", content: prompt }
    ]);

    const currentPrompt = prompt;
    setPrompt("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentPrompt })
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.reply }
      ]);

      // Reload sidebar titles (updated timestamps)
      const listRes = await fetch("/api/conversations");
      const listData = await listRes.json();
      setConversations(listData);

      // Set active conversation (first time only)
      if (!activeId && data.conversationId) {
        setActiveId(data.conversationId);
      }

    } catch (err) {
      console.error("Send failed", err);
    }
  }

  // ─────────────────────────────────────
  // Prompt optimizer (Phase 2 stub)
  // ─────────────────────────────────────
  function optimize() {
    setPrompt(
      `Rewrite the following prompt to be clearer, more structured, and concise:\n\n${prompt}`
    );
  }

  // ─────────────────────────────────────
  // Start new conversation (UI only for now)
  // ─────────────────────────────────────
async function startNewConversation() {
  try {
    await fetch("/api/conversations/reset", {
      method: "POST"
    });

    setMessages([]);
    setActiveId(null);

    // Reload sidebar
    const res = await fetch("/api/conversations");
    const data = await res.json();
    setConversations(data);

  } catch (err) {
    console.error("Failed to start new conversation", err);
  }
}


  // ─────────────────────────────────────
  // Layout
  // ─────────────────────────────────────
  return (
    <main
      style={{
        display: "flex",
        height: "100vh",
        background: "#020617",
        fontFamily: "Inter, system-ui"
      }}
    >
      {/* LEFT SIDEBAR */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={loadConversation}
        onNew={startNewConversation}
      />

      {/* CENTER CHAT */}
      <ChatWindow
        messages={messages}
        prompt={prompt}
        setPrompt={setPrompt}
        onSend={send}
        onOptimize={optimize}
      />

      {/* RIGHT PANEL (Phase 3 placeholder) */}
      <aside
        style={{
          width: 260,
          background: "#020617",
          borderLeft: "1px solid #1e293b",
          padding: 16,
          color: "#64748b"
        }}
      >
        <h4 style={{ marginBottom: 8 }}>Insights</h4>
        <div>Tokens & cost coming next</div>
      </aside>
    </main>
  );
}
