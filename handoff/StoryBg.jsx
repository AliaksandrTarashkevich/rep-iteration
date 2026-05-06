/**
 * StoryBg — Topographic background with drifting onchain glyphs.
 * Pulled from variant C2: topographic contour rings + 14 fake-tx-hash glyphs that subtly drift.
 *
 * Usage:
 *   <StoryBg width={1080} height={1920}>
 *     <YourStoryCard />
 *   </StoryBg>
 *
 * Defaults to full-viewport (100% / 100%) if width/height not passed.
 *
 * Customize:
 *   - `centers`: prop, array of {cx, cy} where topo rings emanate from. Default: 3 off-center clusters.
 *   - `glyphCount`: number of drifting hex strings (default 14).
 *   - `seed`: rng seed for deterministic glyph layout (default 7).
 *
 * Card surface (paste this style on whatever card you put on top):
 *
 *   {
 *     background: 'linear-gradient(180deg, #0a0e15, #050810)',
 *     border: '1px solid rgba(140,213,254,0.22)',
 *     boxShadow:
 *       '0 0 60px rgba(140,213,254,0.15), ' +
 *       '0 30px 80px rgba(0,0,0,0.7), ' +
 *       'inset 0 1px 0 rgba(140,213,254,0.10)',
 *     borderRadius: 24,
 *   }
 */

import React, { useMemo, useId } from "react";

const KEYFRAMES = `
  @keyframes storyBgGlyphDrift {
    0% { transform: translate(0, 0); opacity: 0.3; }
    100% { transform: translate(-12px, -6px); opacity: 0.5; }
  }
`;

const DEFAULT_CENTERS = [
  { cx: 360, cy: 380 },
  { cx: 920, cy: 800 },
  { cx: 1100, cy: 240 },
];

function TopoLines({ centers, count = 12, step = 40, startR = 80, gradId }) {
  return (
    <>
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(140,213,254,0.4)" />
          <stop offset="100%" stopColor="rgba(140,213,254,0)" />
        </radialGradient>
      </defs>
      {centers.map((c, ci) =>
        Array.from({ length: count }).map((_, i) => (
          <circle
            key={`${ci}-${i}`}
            cx={c.cx}
            cy={c.cy}
            r={startR + i * step}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="1"
            opacity={0.18 - i * 0.012}
          />
        ))
      )}
    </>
  );
}

export function StoryBg({
  children,
  width = "100%",
  height = "100%",
  bgWidth = 1280, // virtual width for glyph layout — keep at 1280 for canonical look
  bgHeight = 1200,
  centers = DEFAULT_CENTERS,
  glyphCount = 14,
  seed = 7,
  pageBg = "#010305",
  style,
}) {
  const gradId = useId();

  const glyphs = useMemo(() => {
    const hex = "0123456789abcdef";
    let s = seed;
    const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const arr = [];
    for (let i = 0; i < glyphCount; i++) {
      const length = 6 + Math.floor(r() * 4);
      let str = "0x";
      for (let j = 0; j < length; j++) str += hex[Math.floor(r() * 16)];
      arr.push({
        text: str,
        x: r() * bgWidth,
        y: r() * bgHeight,
        opacity: 0.15 + r() * 0.35,
        size: 11 + Math.floor(r() * 4),
        delay: (i % 7) * 0.6,
        duration: 12 + (i % 5) * 3,
      });
    }
    return arr;
  }, [glyphCount, seed, bgWidth, bgHeight]);

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
        background: pageBg,
        ...style,
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Topo rings */}
      <svg
        viewBox={`0 0 ${bgWidth} ${bgHeight}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <TopoLines centers={centers} gradId={gradId} />
      </svg>

      {/* Drifting glyphs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "relative",
            width: bgWidth,
            height: bgHeight,
            transform: `scale(${typeof width === "number" ? width / bgWidth : 1})`,
            transformOrigin: "0 0",
          }}
        >
          {glyphs.map((g, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: g.x,
                top: g.y,
                fontFamily: "var(--ff-mono)",
                fontSize: g.size,
                letterSpacing: "0.05em",
                color: `rgba(140,213,254,${g.opacity})`,
                animation: `storyBgGlyphDrift ${g.duration}s ease-in-out ${g.delay}s infinite alternate`,
              }}
            >
              {g.text}
            </div>
          ))}
        </div>
      </div>

      {/* Content slot */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Recommended card style to pair with StoryBg — paste this onto your story card root.
 */
export const STORY_CARD_STYLE = {
  background: "linear-gradient(180deg, #0a0e15, #050810)",
  border: "1px solid rgba(140,213,254,0.22)",
  boxShadow:
    "0 0 60px rgba(140,213,254,0.15), 0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(140,213,254,0.10)",
  borderRadius: 24,
};

export default StoryBg;
