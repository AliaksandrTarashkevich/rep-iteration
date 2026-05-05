"use client"

import { useId, useMemo, type ReactNode } from "react"

const KEYFRAMES = `
  @keyframes storyBgGlyphDrift {
    0% { transform: translate(0, 0); opacity: 0.3; }
    100% { transform: translate(-12px, -6px); opacity: 0.5; }
  }
`

const DEFAULT_CENTERS = [
  { cx: 360, cy: 380 },
  { cx: 920, cy: 800 },
  { cx: 1100, cy: 240 },
]

interface TopoLinesProps {
  centers: Array<{ cx: number; cy: number }>
  count?: number
  step?: number
  startR?: number
  gradId: string
}

function TopoLines({
  centers,
  count = 12,
  step = 40,
  startR = 80,
  gradId,
}: TopoLinesProps) {
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
        )),
      )}
    </>
  )
}

interface StoryBgProps {
  children?: ReactNode
  bgWidth?: number
  bgHeight?: number
  centers?: Array<{ cx: number; cy: number }>
  glyphCount?: number
  seed?: number
  pageBg?: string
  className?: string
}

/**
 * Story background — topographic contour rings + drifting onchain hex glyphs.
 * Adapted from handoff/StoryBg.jsx (variant C2).
 */
export function StoryBg({
  children,
  bgWidth = 1280,
  bgHeight = 1200,
  centers = DEFAULT_CENTERS,
  glyphCount = 14,
  seed = 7,
  pageBg = "#010305",
  className,
}: StoryBgProps) {
  const gradId = useId()

  const glyphs = useMemo(() => {
    const hex = "0123456789abcdef"
    let s = seed
    const r = () => (s = (s * 9301 + 49297) % 233280) / 233280
    const arr = []
    for (let i = 0; i < glyphCount; i++) {
      const length = 6 + Math.floor(r() * 4)
      let str = "0x"
      for (let j = 0; j < length; j++) str += hex[Math.floor(r() * 16)]
      arr.push({
        text: str,
        x: r() * bgWidth,
        y: r() * bgHeight,
        opacity: 0.15 + r() * 0.35,
        size: 11 + Math.floor(r() * 4),
        delay: (i % 7) * 0.6,
        duration: 12 + (i % 5) * 3,
      })
    }
    return arr
  }, [glyphCount, seed, bgWidth, bgHeight])

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: pageBg,
      }}
    >
      <style>{KEYFRAMES}</style>

      <svg
        viewBox={`0 0 ${bgWidth} ${bgHeight}`}
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <TopoLines centers={centers} gradId={gradId} />
      </svg>

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "relative",
            width: bgWidth,
            height: bgHeight,
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

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Card surface style from handoff/StoryBg.jsx — paste on every story card root.
 */
export const STORY_CARD_STYLE = {
  background: "linear-gradient(180deg, #0a0e15, #050810)",
  border: "1px solid rgba(140,213,254,0.22)",
  boxShadow:
    "0 0 60px rgba(140,213,254,0.15), 0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(140,213,254,0.10)",
  borderRadius: 24,
} as const
