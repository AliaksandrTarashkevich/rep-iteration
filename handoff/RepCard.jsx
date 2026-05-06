/**
 * RepCard — 3D-tilted holographic identity card.
 *
 * Usage:
 *   <RepCard
 *     revealPct={100}
 *     data={[
 *       { label: "HANDLE",        value: "@kellas" },
 *       { label: "X · FOLLOWERS", value: "12 480" },
 *       { label: "SMART FOLL.",   value: "448" },
 *       { label: "WALLET AGE",    value: "4.2 yrs" },
 *       { label: "INNER CIRCLE",  value: "38" },
 *       { label: "RANK",          value: "yo" },
 *       { label: "REP",           value: "1180", highlight: true },
 *     ]}
 *     wordmark={<MyWordmark size={14} color="rgba(140,213,254,0.65)" />}
 *   />
 *
 * Notes:
 * - Set `revealPct` to 100 for a static rendered card. Drive it 0→100 to animate row-by-row reveal during a loader.
 * - The 3D tilt uses `perspective` + `rotateX/Y` on the parent. Don't remove perspective or the tilt looks wrong.
 * - The glow comes from a double box-shadow (outer + inset). Tune intensity by changing the rgba alpha.
 * - Last row is auto-styled with accent color. Or set `highlight: true` on any row to force it.
 */

import React from "react";

const ACCENT = "#8CD5FE";

const KEYFRAMES = `
  @keyframes repcardFlicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
`;

export function RepCard({
  data = [],
  revealPct = 100,
  wordmark = null,
  width = 480,
  height = 520,
  title = "REP / IDENTITY CARD",
  footnote = "VERIFIED ONCHAIN · BASE",
  tilt = true,
}) {
  return (
    <div style={{ position: "relative", width, height, perspective: "1200px" }}>
      <style>{KEYFRAMES}</style>
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: 32,
          position: "relative",
          borderRadius: 24,
          border: "1px solid rgba(140,213,254,0.4)",
          background:
            "linear-gradient(135deg, rgba(140,213,254,0.08), rgba(140,213,254,0.02))",
          boxShadow:
            "0 0 80px rgba(140,213,254,0.18), inset 0 0 40px rgba(140,213,254,0.04)",
          transform: tilt ? "rotateX(8deg) rotateY(-6deg)" : "none",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Corner ticks */}
        {[
          { top: 8, left: 8 },
          { top: 8, right: 8 },
          { bottom: 8, left: 8 },
          { bottom: 8, right: 8 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 14,
              height: 14,
              ...pos,
              borderTop: pos.top !== undefined ? "1px solid rgba(140,213,254,0.5)" : "none",
              borderBottom: pos.bottom !== undefined ? "1px solid rgba(140,213,254,0.5)" : "none",
              borderLeft: pos.left !== undefined ? "1px solid rgba(140,213,254,0.5)" : "none",
              borderRight: pos.right !== undefined ? "1px solid rgba(140,213,254,0.5)" : "none",
            }}
          />
        ))}

        {/* Title */}
        <div
          style={{
            fontFamily: "var(--ff-mono)",
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: ACCENT,
            marginBottom: 8,
            animation: "repcardFlicker 2s linear infinite",
          }}
        >
          {title}
        </div>
        <div style={{ height: 1, background: "rgba(140,213,254,0.25)", marginBottom: 24 }} />

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data.map((row, i) => {
            // Compute the threshold this row appears at
            const threshold = ((i + 1) / data.length) * 100;
            const visible = revealPct >= threshold - (100 / data.length) * 0.2;
            const isHighlight = row.highlight ?? i === data.length - 1;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(8px)",
                  transition: "all 400ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--ff-mono)",
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    color: "var(--ink-faint)",
                  }}
                >
                  {row.label}
                </span>
                <span
                  className="num"
                  style={{
                    fontSize: 18,
                    color: isHighlight ? ACCENT : "var(--ink)",
                  }}
                >
                  {row.value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 32,
            right: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 16,
            borderTop: "1px solid rgba(140,213,254,0.18)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--ff-mono)",
              fontSize: 9,
              letterSpacing: "0.3em",
              color: "var(--ink-faint)",
            }}
          >
            {footnote}
          </span>
          {wordmark}
        </div>
      </div>
    </div>
  );
}

export default RepCard;
