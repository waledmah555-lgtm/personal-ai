"use client";

import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import Insights from "./components/Insights";

export default function Page() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [tokens, setTokens] = useState({ total: 0 });

  // Load sidebar conversations
  useEffect(() => {
    loadConversationList();
  }, []);

  async function loadConversationList() {
    const res = await fetch("/api/conversations");
    const data = await res.json();
    setConversations(data);
  }

  // ✅ THIS FUNCTION EXISTS AND IS IN SCOPE
  async function loadConversation(id) {
    const res = await fetch(`/api/conversations/${id}`);
    const convo = await res.json();

    setActiveId(id);
    setMessages(
      (convo.messages || []).map(m => ({
        role: m.role,
        content: m.content
      }))
    );
    setTokens(convo.totals || { total: 0 });
  }

  async function send() {
    if (!prompt.trim()) return;

    const userMsg = prompt;
    setPrompt("");

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg })
    });

    const data = await res.json();

    setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    setTokens(data.tokens || { total: 0 });

    if (!activeId) setActiveId(data.conversationId);
    loadConversationList();
  }

  async function startNewConversation() {
    await fetch("/api/conversations/reset", { method: "POST" });
    setMessages([]);
    setTokens({ total: 0 });
    setActiveId(null);
    loadConversationList();
  }

 async function renameConversation(convo) {
  const title = prompt("New title:", convo.title);
  if (!title) return;

  // 1️⃣ Optimistic UI update
  setConversations(prev =>
    prev.map(c =>
      c.id === convo.id ? { ...c, title } : c
    )
  );

  // 2️⃣ Backend update
  try {
    await fetch(`/api/conversations/${convo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });
  } catch (err) {
    console.error("Rename failed", err);
  }

  // 3️⃣ Re-sync
  refreshConversations();
}


async function deleteConversation(id) {
  // 1️⃣ Optimistically update UI immediately
  setConversations(prev => prev.filter(c => c.id !== id));

  if (id === activeId) {
    setMessages([]);
    setTokens({ total: 0 });
    setActiveId(null);
  }

  // 2️⃣ Fire-and-forget backend delete
  try {
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
  } catch (err) {
    console.error("Delete failed", err);
  }

  // 3️⃣ Re-sync silently (safety)
  refreshConversations();
}


  function optimize() {
    setPrompt(`Rewrite this prompt to be clearer:\n\n${prompt}`);
  }

  return (
    <main style={{ display: "flex", height: "100vh", background: "#020617" }}>
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={loadConversation}
        onNew={startNewConversation}
        onRename={renameConversation}
        onDelete={deleteConversation}
      />

      <ChatWindow
        messages={messages}
        prompt={prompt}
        setPrompt={setPrompt}
        onSend={send}
        onOptimize={optimize}
      />

      <Insights tokens={tokens} />
    </main>
  );
}
