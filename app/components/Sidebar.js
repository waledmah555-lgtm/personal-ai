"use client";

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete
}) {
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
          padding: "10px",
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
          <div
            onClick={() => onSelect(c.id)}
            style={{ cursor: "pointer", fontSize: 14 }}
          >
            {c.title || "New Conversation"}
          </div>

          <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRename(c);
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
