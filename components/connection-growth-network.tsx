"use client"

/**
 * Connection Growth Network
 * -------------------------------------------------------------------
 * A real-time mycelium / neural-network visualisation that is *built*
 * as the user waits for their account to finish connecting.
 *
 * Each checklist step triggers a distinct "growth event":
 *   step 0  → root node appears (the user)
 *   step 1  → a spray of nodes branches into one sector
 *   step 2  → a dense cluster blooms in another sector
 *   step 3  → a third sector sprouts (multi-level branches)
 *   step 4  → scattered nodes attach to existing leaves
 *   step N  → completion pulse + REP reveal
 *
 * The whole graph is built deterministically on mount with a seeded
 * RNG, so every run draws a clean, asymmetric "mycelium" shape and
 * the edges/children stay stable across re-renders. Nodes pop in with
 * an ease-out-back overshoot; edges draw progressively from parent to
 * child; everything settles into a static network at completion where
 * a single mint ring expands from the root and the REP score fades in.
 */

import { useEffect, useMemo, useRef } from "react"

// --- Types ----------------------------------------------------------------

export type GrowthVariant = "wallet" | "x"

interface GraphNode {
  id: number
  x: number
  y: number
  parent: number | null
  /** step index at which this node is spawned */
  step: number
  /** ms offset within that step (for staggered bloom) */
  offset: number
  /** base radius (px) */
  size: number
  isRoot: boolean
}

interface GraphEdge {
  from: number
  to: number
  step: number
  offset: number
}

interface StepSpec {
  /** primary node count for this step */
  count: number
  /** angular sector [startRad, endRad] relative to the center */
  angle: [number, number]
  /** radial distance range (in layout units) for primary nodes */
  dist: [number, number]
  /** probability a primary node also spawns 1–2 children (cluster feel) */
  clusterProb?: number
  /** max sub-children per primary (1..N) */
  clusterMax?: number
  /** if true, attach new primary nodes to a random *existing* leaf
   *  rather than to the root (used for "scattered tokens" style) */
  attachToLeaf?: boolean
}

// --- Per-variant growth choreography --------------------------------------
// Angles use standard math convention: 0 = right, +y = down in canvas.

const WALLET_GROWTH: StepSpec[] = [
  // 0 — Connecting wallet (root only)
  { count: 0, angle: [0, 0], dist: [0, 0] },
  // 1 — Checking transactions → wide spray to the lower-right hemisphere
  { count: 6, angle: [-0.3, 1.7], dist: [70, 125], clusterProb: 0.35, clusterMax: 1 },
  // 2 — Scanning NFT holdings → dense cluster to the upper-left
  { count: 4, angle: [3.3, 4.5], dist: [70, 110], clusterProb: 0.75, clusterMax: 2 },
  // 3 — Analyzing DeFi activity → branch shooting upper-right
  { count: 4, angle: [-1.8, -0.5], dist: [80, 130], clusterProb: 0.55, clusterMax: 2 },
  // 4 — Fetching token balances → scattered leaves on existing branches
  {
    count: 6,
    angle: [0, Math.PI * 2],
    dist: [22, 45],
    attachToLeaf: true,
    clusterProb: 0.35,
    clusterMax: 1,
  },
  // 5 — Calculating REP → final densification + outer ring of leaves
  //      (previously a silent "pulse only" step, which read as the graph
  //      freezing before the payoff; now it keeps growing right up to the
  //      REP reveal so the visualisation matches the loader copy).
  {
    count: 6,
    angle: [0, Math.PI * 2],
    dist: [30, 55],
    attachToLeaf: true,
    clusterProb: 0.5,
    clusterMax: 2,
  },
]

const X_GROWTH: StepSpec[] = [
  // 0 — Connecting to X (root only)
  { count: 0, angle: [0, 0], dist: [0, 0] },
  // 1 — Checking subscribers
  { count: 6, angle: [-0.2, 1.6], dist: [70, 120], clusterProb: 0.35, clusterMax: 1 },
  // 2 — Analyzing TwitterScore (small dense badge cluster)
  { count: 3, angle: [-1.9, -1.1], dist: [65, 95], clusterProb: 0.8, clusterMax: 2 },
  // 3 — Fetching social graph (large mass to the left)
  { count: 5, angle: [2.6, 4.2], dist: [80, 130], clusterProb: 0.65, clusterMax: 2 },
  // 4 — Finding your closest friends (scattered leaf-attached)
  { count: 5, angle: [0, Math.PI * 2], dist: [22, 45], attachToLeaf: true, clusterProb: 0.4, clusterMax: 1 },
  // 5 — Calculating REP → outer ring of fresh leaves so the graph keeps
  //      growing while the score is being computed (fixes "last 2–3 steps
  //      the graph froze" feedback).
  { count: 5, angle: [0, Math.PI * 2], dist: [28, 52], attachToLeaf: true, clusterProb: 0.55, clusterMax: 2 },
  // 6 — Finalizing profile → final polish burst on the outer rim so the
  //      mycelium visibly "fills in" right before the completion pulse.
  { count: 6, angle: [0, Math.PI * 2], dist: [24, 48], attachToLeaf: true, clusterProb: 0.6, clusterMax: 2 },
]

// --- Seeded RNG -----------------------------------------------------------

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// --- Graph builder --------------------------------------------------------

function buildGraph(variant: GrowthVariant): {
  nodes: GraphNode[]
  edges: GraphEdge[]
} {
  const spec = variant === "wallet" ? WALLET_GROWTH : X_GROWTH
  const rand = mulberry32(variant === "wallet" ? 0x7a1d_3f21 : 0x2e9c_b0a4)

  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  // Root
  nodes.push({
    id: 0,
    x: 0,
    y: 0,
    parent: null,
    step: 0,
    offset: 0,
    size: 5.5,
    isRoot: true,
  })

  spec.forEach((s, stepIdx) => {
    if (s.count === 0) return

    for (let i = 0; i < s.count; i++) {
      // Pick parent. Either root or a random non-root existing leaf.
      let parentId = 0
      if (s.attachToLeaf) {
        const leafCandidates = nodes.filter(n => !n.isRoot)
        if (leafCandidates.length > 0) {
          parentId =
            leafCandidates[Math.floor(rand() * leafCandidates.length)].id
        }
      }
      const parent = nodes[parentId]

      const angle = s.angle[0] + rand() * (s.angle[1] - s.angle[0])
      const dist = s.dist[0] + rand() * (s.dist[1] - s.dist[0])
      const x = parent.x + Math.cos(angle) * dist
      const y = parent.y + Math.sin(angle) * dist

      const id = nodes.length
      const baseOffset = i * 110 + rand() * 80 // staggered bloom within step
      nodes.push({
        id,
        x,
        y,
        parent: parentId,
        step: stepIdx,
        offset: baseOffset,
        size: 1.7 + rand() * 1.2,
        isRoot: false,
      })
      edges.push({
        from: parentId,
        to: id,
        step: stepIdx,
        offset: baseOffset,
      })

      // Sub-children → feels organic, like real hyphal branching
      if (s.clusterProb && rand() < s.clusterProb) {
        const childCount = 1 + Math.floor(rand() * (s.clusterMax ?? 1))
        for (let k = 0; k < childCount; k++) {
          const ca = angle + (rand() - 0.5) * 1.1
          const cd = 22 + rand() * 32
          const cx = x + Math.cos(ca) * cd
          const cy = y + Math.sin(ca) * cd
          const cid = nodes.length
          const childOffset = baseOffset + 220 + k * 80 + rand() * 50
          nodes.push({
            id: cid,
            x: cx,
            y: cy,
            parent: id,
            step: stepIdx,
            offset: childOffset,
            size: 1.3 + rand() * 0.8,
            isRoot: false,
          })
          edges.push({
            from: id,
            to: cid,
            step: stepIdx,
            offset: childOffset,
          })
        }
      }
    }
  })

  return { nodes, edges }
}

// --- Easing ---------------------------------------------------------------

/** ease-out-back: overshoots to ~1.15, settles at 1 */
function easeOutBack(x: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

// --- Component ------------------------------------------------------------

interface Props {
  variant: GrowthVariant
  /** highest step index that has started (0..steps.length) */
  activeStep: number
  /** true once all steps have completed; triggers mint pulse + REP reveal */
  complete: boolean
  /** REP score to reveal at completion. Pass null while loading. */
  repScore: number | null
}

const APPEAR_MS = 550
const LINE_MS = 450
const COMPLETE_PULSE_MS = 1200

export function ConnectionGrowthNetwork({
  variant,
  activeStep,
  complete,
  repScore,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { nodes, edges } = useMemo(() => buildGraph(variant), [variant])

  /** wall time (performance.now) when a given step became active */
  const stepStartTimesRef = useRef<Array<number | null>>([])
  const completionStartRef = useRef<number | null>(null)
  const prefersReducedMotionRef = useRef<boolean>(false)

  // Record step start times as activeStep advances.
  useEffect(() => {
    const now = performance.now()
    // Ensure array is long enough.
    while (stepStartTimesRef.current.length <= activeStep) {
      stepStartTimesRef.current.push(null)
    }
    for (let i = 0; i <= activeStep; i++) {
      if (stepStartTimesRef.current[i] == null) {
        stepStartTimesRef.current[i] = now
      }
    }
  }, [activeStep])

  // Record completion start time.
  useEffect(() => {
    if (complete && completionStartRef.current == null) {
      completionStartRef.current = performance.now()
    }
  }, [complete])

  // Detect prefers-reduced-motion once.
  useEffect(() => {
    if (typeof window === "undefined") return
    prefersReducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
  }, [])

  // Canvas render loop.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let cancelled = false

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const render = (now: number) => {
      if (cancelled) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const cx = w / 2
      const cy = h / 2

      ctx.clearRect(0, 0, w, h)

      const reduced = prefersReducedMotionRef.current

      // --- Completion mint pulse (expanding ring from center) ---
      let completionTint = 0 // 0..1 how "mint" the network looks right now
      if (completionStartRef.current != null) {
        const el = now - completionStartRef.current
        if (el < COMPLETE_PULSE_MS) {
          const p = el / COMPLETE_PULSE_MS
          const pulseRadius = 30 + p * 260
          const ringAlpha = (1 - p) * 0.55
          const grad = ctx.createRadialGradient(
            cx,
            cy,
            Math.max(1, pulseRadius * 0.55),
            cx,
            cy,
            pulseRadius,
          )
          grad.addColorStop(0, "rgba(0, 210, 190, 0)")
          grad.addColorStop(0.75, `rgba(0, 210, 190, ${ringAlpha})`)
          grad.addColorStop(1, "rgba(0, 210, 190, 0)")
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2)
          ctx.fill()
          // Tint decays with the pulse.
          completionTint = Math.max(0, 1 - p)
        }
      }

      // --- Edges ---
      ctx.lineCap = "round"
      for (const e of edges) {
        const stepStart = stepStartTimesRef.current[e.step]
        if (stepStart == null) continue
        const elapsed = now - stepStart - e.offset
        if (elapsed < 0) continue
        const progress = reduced
          ? 1
          : Math.min(1, elapsed / LINE_MS)
        if (progress <= 0) continue

        const a = nodes[e.from]
        const b = nodes[e.to]
        const ax = cx + a.x
        const ay = cy + a.y
        const bx = ax + (cx + b.x - ax) * progress
        const by = ay + (cy + b.y - ay) * progress

        // Silver base + optional mint tint during completion pulse.
        const baseAlpha = 0.32 + progress * 0.12
        const r = Math.round(200 + (0 - 200) * completionTint * 0.4)
        const g = Math.round(208 + (210 - 208) * completionTint * 0.4)
        const bch = Math.round(225 + (190 - 225) * completionTint * 0.5)
        ctx.strokeStyle = `rgba(${r}, ${g}, ${bch}, ${baseAlpha})`
        ctx.lineWidth = 0.65
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()
      }

      // --- Nodes ---
      for (const n of nodes) {
        const stepStart = stepStartTimesRef.current[n.step]
        if (stepStart == null) continue
        const elapsed = now - stepStart - n.offset
        if (elapsed < 0) continue

        const raw = reduced ? 1 : Math.min(1, elapsed / APPEAR_MS)
        const scale = reduced ? 1 : easeOutBack(raw)
        const opacity = Math.min(1, raw * 2)

        const x = cx + n.x
        const y = cy + n.y

        // Root gets an extra soft silver glow so the "user" anchor reads first.
        if (n.isRoot) {
          const glowR = 22
          const g = ctx.createRadialGradient(x, y, 0, x, y, glowR)
          g.addColorStop(0, `rgba(230, 234, 245, ${opacity * 0.35})`)
          g.addColorStop(1, "rgba(230, 234, 245, 0)")
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(x, y, glowR, 0, Math.PI * 2)
          ctx.fill()
        }

        // Nodes spawned in the *currently active* step get a subtle extra glow
        // while they're still "fresh", so the eye follows the growth point.
        const isFresh =
          n.step === activeStep &&
          !reduced &&
          elapsed < APPEAR_MS + 300 &&
          !completionStartRef.current
        if (isFresh && !n.isRoot) {
          const glowR = n.size * 4
          const g = ctx.createRadialGradient(x, y, 0, x, y, glowR)
          g.addColorStop(0, `rgba(220, 225, 240, ${opacity * 0.22})`)
          g.addColorStop(1, "rgba(220, 225, 240, 0)")
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(x, y, glowR, 0, Math.PI * 2)
          ctx.fill()
        }

        // Mint glow during completion pulse.
        if (completionTint > 0 && !n.isRoot) {
          const glowR = n.size * 5 * completionTint
          if (glowR > 0.5) {
            const g = ctx.createRadialGradient(x, y, 0, x, y, glowR)
            g.addColorStop(0, `rgba(0, 210, 190, ${0.45 * completionTint})`)
            g.addColorStop(1, "rgba(0, 210, 190, 0)")
            ctx.fillStyle = g
            ctx.beginPath()
            ctx.arc(x, y, glowR, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        // Core dot — silver, slightly warmer while mint-tinted.
        const r = Math.round(230 - 30 * completionTint)
        const gC = Math.round(234 + 6 * completionTint)
        const bC = Math.round(245 - 10 * completionTint)
        ctx.fillStyle = `rgba(${r}, ${gC}, ${bC}, ${opacity})`
        ctx.beginPath()
        ctx.arc(x, y, n.size * scale, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [nodes, edges, activeStep])

  return (
    <div className="relative aspect-square w-full max-w-[420px]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      {/* Subtle radial vignette behind the network so it floats. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(180,188,205,0.04) 0%, transparent 65%)",
        }}
      />

      {/* Dark radial mask — fades in with the REP reveal so the score reads
          clearly against the mycelium. Darkens the center (where the number
          lives) while letting the outer graph stay visible and alive. */}
      {complete && repScore != null && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-in fade-in duration-700"
          style={{
            background:
              "radial-gradient(circle at center, rgba(5,7,10,0.88) 0%, rgba(5,7,10,0.72) 28%, rgba(5,7,10,0.4) 52%, transparent 78%)",
          }}
        />
      )}

      {/* REP reveal — fades in once the completion pulse starts. */}
      {complete && repScore != null && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="animate-in fade-in zoom-in-95 duration-700 text-center"
            style={{
              animationDelay: "350ms",
              animationFillMode: "backwards",
            }}
          >
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              REP Score
            </div>
            <div className="metallic-text-silver text-7xl font-bold leading-none">
              {repScore}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
