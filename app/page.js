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

  useEffect(() => {
    refreshConversations();
  }, []);

  async function refreshConversations() {
    const res = await fetch("/api/conversations");
    setConversations(await res.json());
  }

  async function loadConversation(id) {
    const res = await fetch(`/api/conversations/${id}`);
    const convo = await res.json();

    setActiveId(id);
    setMessages(convo.messages.map(m => ({ role: m.role, content: m.content })));
    setTokens(convo.totals);
  }

  async function send() {
    if (!prompt.trim()) return;
    const msg = prompt;
    setPrompt("");

    setMessages(prev => [...prev, { role: "user", content: msg }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    const data = await res.json();
    setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    setTokens(data.tokens);

    if (!activeId) setActiveId(data.conversationId);
    refreshConversations();
  }

  async function startNewConversation() {
    await fetch("/api/conversations/reset", { method: "POST" });
    setMessages([]);
    setTokens({ total: 0 });
    setActiveId(null);
    refreshConversations();
  }

  async function renameConversation(convo) {
    const title = prompt("New title:", convo.title);
    if (!title) return;

    await fetch(`/api/conversations/${convo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });

    refreshConversations();
  }

  async function deleteConversation(id) {
    await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    if (id === activeId) {
      setMessages([]);
      setTokens({ total: 0 });
      setActiveId(null);
    }
    refreshConversations();
  }

  function optimize() {
    setPrompt(`Rewrite this prompt to be clearer and cheaper:\n\n${prompt}`);
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
