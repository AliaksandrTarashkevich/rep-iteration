"use client"

import { useEffect, useRef } from "react"

/**
 * StoryCardBackground
 * --------------------
 * Abstract neural-network / Physarum-style background for story cards.
 *
 * Design goals:
 *  - Fills the entire card rect, edge-to-edge, top-to-bottom.
 *  - Pattern is abstract: thin silver segments + small dots. No roots,
 *    no trunks, no directional branches — nothing that reads as botanical.
 *  - Nodes are distributed across the whole area with slight density
 *    variation (jittered grid), not concentrated in any one region.
 *  - Connections are short, local segments (each node → its 2 nearest
 *    neighbors within a distance cap). The resulting graph reads as a
 *    neural lattice rather than a growth pattern.
 *  - Kept at ~8–10 % opacity via the wrapper so it never competes with
 *    card content.
 *  - Deterministic per-seed (each card gets a stable, unique mesh) and
 *    static (no rAF loop).
 */

// --------------------------------------------------------------------------
// Seeded PRNG (mulberry32) — identical seed → identical mesh.
// --------------------------------------------------------------------------
function mulberry32(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), 1 | t)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seedFromString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

interface Point {
  x: number
  y: number
  size: number
}

interface StoryCardBackgroundProps {
  /** Deterministic seed so every card gets a stable, unique mesh. */
  seed: number
  /** Wrapper opacity (0–1). Tuned default ~9 %. */
  opacity?: number
  /** Number of faint mint accent dots. Set to 0 to disable. */
  accentCount?: number
  className?: string
}

export function StoryCardBackground({
  seed,
  opacity = 0.09,
  accentCount = 2,
  className = "",
}: StoryCardBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      const rect = parent.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.floor(rect.width))
      const height = Math.max(1, Math.floor(rect.height))

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const rand = mulberry32(seed)

      // -------------------------------------------------------------
      // 1. Jittered-grid point distribution.
      //    - One cell ≈ 1 node. Target spacing ~32 px → good density
      //      without overwhelming the card.
      //    - Jitter each point inside its cell for organic variation.
      //    - Skip ~8 % of cells at random for *slight* density variance,
      //      never enough to create a cluster or gap.
      //    - Extend 1 cell beyond each edge so lines can still reach the
      //      true edges/corners of the card rect.
      // -------------------------------------------------------------
      const targetSpacing = 32
      const cols = Math.max(4, Math.ceil(width / targetSpacing) + 2)
      const rows = Math.max(4, Math.ceil(height / targetSpacing) + 2)
      const cellW = (width + targetSpacing * 2) / cols
      const cellH = (height + targetSpacing * 2) / rows
      const originX = -targetSpacing
      const originY = -targetSpacing

      const points: Point[] = []
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          if (rand() < 0.08) continue // slight density variation
          const jx = 0.15 + rand() * 0.7
          const jy = 0.15 + rand() * 0.7
          const x = originX + (gx + jx) * cellW
          const y = originY + (gy + jy) * cellH
          // Mostly tiny dots; ~8 % larger "anchor" nodes give visual rhythm.
          const size = rand() < 0.08 ? 1.3 + rand() * 0.5 : 0.7 + rand() * 0.4
          points.push({ x, y, size })
        }
      }

      // -------------------------------------------------------------
      // 2. Local connections: each point connects to its k=2 nearest
      //    neighbors within a distance cap. Short local segments → reads
      //    as neural lattice, not branching strands.
      // -------------------------------------------------------------
      const maxDist = targetSpacing * 1.9
      const maxDistSq = maxDist * maxDist
      const k = 2

      const edges: Array<{ a: number; b: number }> = []
      const seen = new Set<string>()

      for (let i = 0; i < points.length; i++) {
        const pi = points[i]
        const candidates: Array<{ idx: number; dSq: number }> = []
        for (let j = 0; j < points.length; j++) {
          if (i === j) continue
          const pj = points[j]
          const dx = pi.x - pj.x
          const dy = pi.y - pj.y
          const dSq = dx * dx + dy * dy
          if (dSq <= maxDistSq) candidates.push({ idx: j, dSq })
        }
        candidates.sort((a, b) => a.dSq - b.dSq)
        const take = Math.min(k, candidates.length)
        for (let n = 0; n < take; n++) {
          const j = candidates[n].idx
          const key = i < j ? `${i}-${j}` : `${j}-${i}`
          if (seen.has(key)) continue
          seen.add(key)
          edges.push({ a: i, b: j })
        }
      }

      // -------------------------------------------------------------
      // 3. Render — silver lines first (thin, pale), dots on top.
      //    ~15 % of edges are slightly brighter so the mesh has life
      //    without introducing any directional bias.
      // -------------------------------------------------------------
      ctx.lineWidth = 0.6
      ctx.lineCap = "round"
      for (let e = 0; e < edges.length; e++) {
        const a = points[edges[e].a]
        const b = points[edges[e].b]
        const bright = (e * 2654435761) % 100 < 15
        ctx.strokeStyle = bright
          ? "rgba(220, 225, 238, 0.9)"
          : "rgba(200, 208, 225, 0.55)"
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }

      // Dots: uniform silver core.
      ctx.fillStyle = "rgba(220, 226, 240, 0.95)"
      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // -------------------------------------------------------------
      // 4. A couple of barely-there mint pinpoints tie the mesh to
      //    the brand. No connecting lines; placed on existing nodes.
      // -------------------------------------------------------------
      for (let a = 0; a < accentCount && points.length > 0; a++) {
        const p = points[Math.floor(rand() * points.length)]
        const r = 3 + rand() * 2
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3)
        grad.addColorStop(0, "rgba(0, 210, 190, 0.5)")
        grad.addColorStop(1, "rgba(0, 210, 190, 0)")
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = "rgba(120, 235, 220, 0.85)"
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    render()
    const ro = new ResizeObserver(render)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [seed, accentCount])

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit] ${className}`}
      style={{ opacity }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
