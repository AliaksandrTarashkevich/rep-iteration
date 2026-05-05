"use client"

/**
 * RepCardStory
 * ------------
 * The final "YOUR REP CARD" artifact — rendered in the exact same visual
 * language as every other story-flow slide so the final reveal feels like
 * the natural closing shot of the sequence (silver/platinum gradient
 * border, neural-mesh background, metallic-silver hero stat, italic
 * mint-bordered pull quote, Verified-by-REP watermark).
 *
 * Used in two places, by design:
 *   1. The last slide of /stories (SummaryStory)
 *   2. The /claim screen (the card the user is about to "lock in")
 *
 * Keeping the chrome identical is a deliberate product choice: it
 * reinforces continuity from story → claim → profile. The optional
 * `footer` slot is where screen-specific CTAs (Seal, Lock in, Connect)
 * live, so the card itself stays consistent across both screens.
 */

import Image from "next/image"
import { useEffect, useRef, useState, type ReactNode } from "react"
import type { RankTier } from "@/lib/auth-context"

// ---------------------------------------------------------------------------
// Rank tier visual map (mirrors the story slides)
// ---------------------------------------------------------------------------

const rankRingColors: Record<RankTier, string> = {
  "ꙮ": "ring-amber-400",
  yo: "ring-primary",
  ToT: "ring-emerald-400",
  roko: "ring-purple-400",
  droog: "ring-sky-400",
  cicada: "ring-muted-foreground",
  pilgrim: "ring-muted-foreground",
}

const rankBadges: Record<RankTier, string> = {
  "ꙮ": "/images/ranks/crown.png",
  yo: "/images/ranks/base.png",
  ToT: "/images/ranks/star.jpg",
  roko: "/images/ranks/star.jpg",
  droog: "/images/ranks/star.jpg",
  cicada: "/images/ranks/star.jpg",
  pilgrim: "/images/ranks/star.jpg",
}

// ---------------------------------------------------------------------------
// Internal primitives — same shape as the ones inline in /stories so the
// card matches the rest of the flow 1:1.
// ---------------------------------------------------------------------------

/** Hero stat — minimal cyan-accented mono number. */
function BigStat({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center py-1">
      <div className="num text-6xl font-medium leading-none tracking-[-0.02em] text-ink sm:text-7xl">
        {children}
      </div>
    </div>
  )
}

/** Italic Fraunces pull quote — accent border. */
function PullQuote({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-2 border-accent/60 pl-3 font-serif text-sm italic leading-[1.45] text-ink-mute">
      {children}
    </p>
  )
}

/** Count-up number animation, triggered on intersection. */
function CountUp({
  end,
  duration = 1600,
}: {
  end: number
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let start: number | null = null
    let raf = 0
    const step = (t: number) => {
      if (start === null) start = t
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.floor(eased * end))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [visible, end, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface RepCardStat {
  label: string
  value: string | number
}

export interface RepCardStoryProps {
  handle: string
  avatarUrl: string
  repScore: number
  overallRank: number
  totalUsers: number
  aiOneLiner: string
  cardType: string // e.g. "Full REP Card" / "Social REP Card" / "Onchain REP Card"
  rankTier: RankTier
  /** Sub-stats rendered in the grid under the hero stat. 2 or 4 items look best. */
  stats?: RepCardStat[]
  /** Optional notable follower avatars row. */
  notableFollowers?: Array<{ handle: string; avatarUrl?: string }>
  /** Optional achievement chips row. */
  achievements?: string[]
  /** If true, renders a subtle "Partial" hint next to the card type. */
  isIncomplete?: boolean
  /** Top-right mono label. Defaults to "YOUR REP CARD". */
  label?: string
  /** Optional CTA slot rendered above the watermark (e.g. "Lock in REP"). */
  footer?: ReactNode
  /** Entry animation. Disable if the parent is orchestrating animation. */
  animate?: boolean
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RepCardStory({
  handle,
  avatarUrl,
  repScore,
  overallRank,
  totalUsers,
  aiOneLiner,
  cardType,
  rankTier,
  stats,
  notableFollowers,
  achievements,
  isIncomplete = false,
  label = "YOUR REP CARD",
  footer,
  animate = true,
  className,
}: RepCardStoryProps) {
  const ringClass = rankRingColors[rankTier] ?? "ring-primary"
  const badgeSrc = rankBadges[rankTier] ?? rankBadges.yo

  return (
    <div
      className={[
        "relative w-full max-w-md overflow-hidden rounded-[20px] border border-line bg-card-bg",
        animate
          ? "animate-in fade-in slide-in-from-bottom-4 duration-500"
          : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative z-[1] p-6">
        {/* ---- Header row: avatar + handle + card type + mono label ---- */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-offset-1 ring-offset-background ${ringClass}`}
            >
              <Image
                src={avatarUrl}
                alt={handle}
                fill
                sizes="36px"
                className="object-cover"
              />
              <img
                src={badgeSrc}
                alt={rankTier}
                className="absolute -bottom-1 -right-1 z-10 h-4 w-4 object-contain drop-shadow-md"
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">
                @{handle}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="truncate">{cardType}</span>
                {isIncomplete && (
                  <span className="text-amber-400">· Partial</span>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
            {label}
          </div>
        </div>

        {/* ---- Hero: REP Score ---- */}
        <div className="mb-1 text-center">
          <BigStat>
            <CountUp end={repScore} />
          </BigStat>
          <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
            REP Score
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            #{overallRank.toLocaleString()} of {totalUsers.toLocaleString()}
          </div>
        </div>

        {/* ---- Sub-stats grid ---- */}
        {stats && stats.length > 0 && (
          <div
            className={`mb-5 mt-5 grid gap-3 rounded-xl border border-border/40 bg-background/20 p-3 ${
              stats.length >= 3 ? "grid-cols-3" : "grid-cols-2"
            }`}
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl font-semibold text-foreground">
                  {s.value}
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---- Notable followers stack ---- */}
        {notableFollowers && notableFollowers.length > 0 && (
          <div className="mb-5">
            <div className="mb-2 text-center font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
              FOLLOWED BY
            </div>
            <div className="flex items-center justify-center -space-x-2">
              {notableFollowers.slice(0, 5).map((f, i) => (
                <div
                  key={f.handle}
                  className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-background"
                  style={{ zIndex: 5 - i }}
                >
                  {f.avatarUrl ? (
                    <Image
                      src={f.avatarUrl}
                      alt={f.handle}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                      {f.handle.charAt(1)?.toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
              {notableFollowers.length > 5 && (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground ring-2 ring-background">
                  +{notableFollowers.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- Achievement chips ---- */}
        {achievements && achievements.length > 0 && (
          <div className="mb-5 flex flex-wrap justify-center gap-2">
            {achievements.slice(0, 4).map((a) => (
              <span
                key={a}
                className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        {/* ---- AI one-liner, rendered as the pull quote of the card ---- */}
        <PullQuote>{aiOneLiner}</PullQuote>

        {/* ---- Optional CTA slot (Seal / Lock in / Connect / Share) ---- */}
        {footer && <div className="mt-5">{footer}</div>}

        {/* ---- Screenshot-friendly watermark ---- */}
        <div className="mt-6 flex items-center justify-center border-t border-line pt-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            Verified by REP
            <span className="mx-2 inline-block h-1 w-1 rounded-full bg-accent align-middle shadow-[0_0_6px_rgba(140,213,254,0.6)]" />
            rep.xyz
          </span>
        </div>
      </div>
    </div>
  )
}
