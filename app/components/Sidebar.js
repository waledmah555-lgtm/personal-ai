"use client";
import { useState } from "react";

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete
}) {
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");

  return (
    <aside style={{
      width: 260,
      background: "#0f172a",
      color: "#e5e7eb",
      padding: 16,
      borderRight: "1px solid #1e293b"
    }}>
      <button
        onClick={onNew}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 16,
          background: "#2563eb",
          border: "none",
          color: "#fff",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        + New Conversation
      </button>

      {conversations.map(c => (
        <div
          key={c.id}
          style={{
            padding: 10,
            borderRadius: 6,
            marginBottom: 6,
            background: c.id === activeId ? "#1e293b" : "transparent"
          }}
        >
          {editingId === c.id ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                onRename({ ...c, title });
                setEditingId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onRename({ ...c, title });
                  setEditingId(null);
                }
              }}
              style={{
                width: "100%",
                background: "#020617",
                color: "#e5e7eb",
                border: "1px solid #334155",
                borderRadius: 4,
                padding: 4
              }}
            />
          ) : (
            <div
              onClick={() => onSelect(c.id)}
              style={{ cursor: "pointer", fontSize: 14 }}
            >
              {c.title || "New conversation"}
            </div>
          )}

          <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingId(c.id);
                setTitle(c.title || "");
              }}
              style={{ fontSize: 11 }}
            >
              Rename
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c.id);
              }}
              style={{ fontSize: 11, color: "#f87171" }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </aside>
  );
}
