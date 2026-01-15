"use client";

const COST_PER_1K = 0.03; // GPT-4.1 approx blended cost

export default function Insights({ tokens }) {
  const totalTokens = tokens?.total || 0;
  const estimatedCost = ((totalTokens / 1000) * COST_PER_1K).toFixed(4);

  return (
    <aside style={{
      width: 260,
      background: "#020617",
      borderLeft: "1px solid #1e293b",
      padding: 16,
      color: "#cbd5f5"
    }}>
      <h4 style={{ marginBottom: 12 }}>Insights</h4>

      <div style={{ fontSize: 14, marginBottom: 8 }}>
        <strong>Tokens used</strong>
        <div>{totalTokens.toLocaleString()}</div>
      </div>

      <div style={{ fontSize: 14 }}>
        <strong>Estimated cost</strong>
        <div>${estimatedCost}</div>
      </div>
    </aside>
  );
}
