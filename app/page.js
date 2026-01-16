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

  async function refreshConversations() {
    const res = await fetch("/api/conversations", { cache: "no-store" });
    setConversations(await res.json());
  }

  useEffect(() => {
    refreshConversations();
  }, []);

  async function loadConversation(id) {
    const res = await fetch(`/api/conversations/${id}`, { cache: "no-store" });
    const convo = await res.json();

    setActiveId(id);
    setMessages(convo.messages || []);
    setTokens(convo.totals || { total: 0 });
  }

  async function send() {
    if (!prompt.trim()) return;

    const msg = prompt;
    setPrompt("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    const data = await res.json();

    // ✅ DO NOT CLEAR — REPLACE WITH BACKEND STATE
    setActiveId(data.conversationId);
    setMessages(data.messages || []);
    setTokens(data.tokens || { total: 0 });

    await refreshConversations();
  }

  async function startNewConversation() {
    await fetch("/api/conversations/new", { method: "POST" });

    setMessages([]);
    setTokens({ total: 0 });
    setActiveId(null);

    await refreshConversations();
  }

  async function renameConversation(convo) {
    const title = prompt("New title:", convo.title);
    if (!title) return;

    await fetch(`/api/conversations/${convo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });

    await refreshConversations();
  }

  async function deleteConversation(id) {
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });

    if (id === activeId) {
      setMessages([]);
      setTokens({ total: 0 });
      setActiveId(null);
    }

    await refreshConversations();
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
