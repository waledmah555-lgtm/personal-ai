"use client";

const COST_PER_1K = 0.03; // GPT-4.1 approx

export default function Insights({ tokens }) {
  const total = tokens?.total || 0;
  const cost = ((total / 1000) * COST_PER_1K).toFixed(4);

  return (
    <aside style={{
      width: 260,
      background: "#020617",
      borderLeft: "1px solid #1e293b",
      padding: 16,
      color: "#cbd5f5"
    }}>
      <h4 style={{ marginBottom: 12 }}>Insights</h4>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Tokens used</div>
        <div style={{ fontSize: 18 }}>{total.toLocaleString()}</div>
      </div>

      <div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Estimated cost</div>
        <div style={{ fontSize: 18 }}>${cost}</div>
      </div>
    </aside>
  );
}
