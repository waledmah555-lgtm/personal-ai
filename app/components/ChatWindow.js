"use client";

export default function ChatWindow({
  messages,
  prompt,
  setPrompt,
  onSend,
  onOptimize
}) {
  return (
    <section style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      padding: 20,
      color: "#e5e7eb"
    }}>
      {/* Chat messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        marginBottom: 12
      }}>
        {messages.length === 0 && (
          <div style={{ opacity: 0.5 }}>
            Start a conversation…
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 12,
              whiteSpace: "pre-wrap"
            }}
          >
            <strong>{m.role === "user" ? "You" : "AI"}:</strong>
            <div>{m.content}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask anything..."
        rows={3}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 8,
          borderRadius: 6,
          border: "1px solid #1e293b",
          background: "#020617",
          color: "#e5e7eb"
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={onOptimize} style={{ fontSize: 12 }}>
          ✨ Optimize prompt
        </button>

        <button
          onClick={onSend}
          style={{
            padding: "6px 14px",
            background: "#2563eb",
            border: "none",
            color: "#fff",
            borderRadius: 6
          }}
        >
          Send
        </button>
      </div>
    </section>
  );
}
