"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowUp, MessageCircle } from "lucide-react"
import { StoryShareActions } from "@/components/story-share-actions"
import { Num } from "@/components/ui/primitives"
import { USER, SHARE_TEXT, type StoryId } from "@/lib/mock-stories"
import { STORY_CARD_STYLE } from "./story-bg"

export function CountUp({
  end,
  duration = 1500,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  /** Number of decimals to render (e.g. 1 for 8.4, 2 for 94.25). */
  decimals?: number
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(easeOut * end)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  const formatted =
    decimals > 0
      ? count.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.floor(count).toLocaleString()

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}

export function AnimatedBar({
  percentage,
  delay = 0,
  colorClass = "bg-primary",
}: {
  percentage: number
  delay?: number
  colorClass?: string
}) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), delay)
    return () => clearTimeout(timer)
  }, [percentage, delay])

  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export function StoryCard({
  children,
  label,
  isSummary = false,
  variant = "data",
  reactions,
}: {
  children: React.ReactNode
  label: string
  isSummary?: boolean
  variant?: "data" | "prompt" | "blurred"
  /** Retained for back-compat; no longer used (constellation bg removed). */
  seedKey?: string
  reactions?: { upvotes?: number; comments?: number }
}) {
  const showUserHeader = variant === "data" || isSummary
  const showFooter = variant === "data" || isSummary

  return (
    <div
      className="relative w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={STORY_CARD_STYLE}
    >
      <div className="relative z-[1] p-6">
        {showUserHeader && (
          <div className="mb-5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-line-strong">
                <Image
                  src={USER.avatarUrl}
                  alt={USER.handle}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[14px] font-medium text-ink">
                  @{USER.handle}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                  <span>RANK 6</span>
                  <span>·</span>
                  <span>4h</span>
                </div>
              </div>
            </div>
            <span className="flex-shrink-0 font-serif text-[14px] italic leading-none text-accent/85">
              verified
            </span>
          </div>
        )}

        <div className="kicker mb-5 !text-[12px] !tracking-[0.24em]">
          {label}
        </div>

        {children}

        {showFooter && (
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-1.5 font-mono text-[12px] text-ink-mute transition-colors hover:text-ink"
                aria-label="Upvote"
              >
                <ArrowUp size={14} />
                <Num>{(reactions?.upvotes ?? 1200).toLocaleString()}</Num>
              </button>
              <button
                className="flex items-center gap-1.5 font-mono text-[12px] text-ink-mute transition-colors hover:text-ink"
                aria-label="Comments"
              >
                <MessageCircle size={14} />
                <Num>{reactions?.comments ?? 48}</Num>
              </button>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              <span className="mr-2 inline-block h-1 w-1 rounded-full bg-accent align-middle shadow-[0_0_6px_rgba(140,213,254,0.6)]" />
              Verified by REP
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function ShareRow({ storyId }: { storyId: StoryId }) {
  const text = SHARE_TEXT[storyId]?.(USER.handle)
  if (!text) return null
  return (
    <StoryShareActions
      storyId={storyId}
      shareText={text}
      handle={USER.handle}
    />
  )
}

// Subtle accent glow for hero numbers — doesn't fight the minimal aesthetic
// because it's only on the largest numerical reveal in each card.
const HERO_GLOW = {
  textShadow:
    "0 0 28px rgba(140, 213, 254, 0.32), 0 0 10px rgba(140, 213, 254, 0.18)",
} as const

export function BigStat({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center py-1">
      <div
        className="num text-7xl font-medium leading-none tracking-[-0.02em] text-ink"
        style={HERO_GLOW}
      >
        {children}
      </div>
    </div>
  )
}

export function MidStat({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center py-1">
      <div
        className="num text-5xl font-medium leading-none tracking-[-0.02em] text-ink"
        style={HERO_GLOW}
      >
        {children}
      </div>
    </div>
  )
}

export function SubStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: React.ReactNode
  label: string
}) {
  return (
    <div className="text-center">
      <div className="text-2xl font-semibold text-foreground">{value}</div>
      <div className="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <Icon className="h-3 w-3 text-foreground/60" />
        {label}
      </div>
    </div>
  )
}

export function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 border-l-2 border-accent/60 pl-3 font-serif text-sm italic leading-[1.45] text-ink-mute">
      {children}
    </p>
  )
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: "neutral" | "positive" | "negative" | "accent"
}) {
  const toneClasses = {
    neutral: "border-border/60 bg-background/40 text-foreground/80",
    positive: "border-positive/40 bg-positive/15 text-positive",
    negative: "border-red-500/40 bg-red-500/10 text-red-300",
    accent: "border-accent/40 bg-accent/15 text-accent",
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}

/**
 * Editorial tier label - Fraunces italic accent text, no border.
 * Used for tier names (Bull Run Survivor, Diamond, Power User, etc.) so they
 * read like an editorial caption rather than a UI badge.
 */
export function TierLabel({
  children,
  tone = "accent",
}: {
  children: React.ReactNode
  tone?: "accent" | "positive" | "negative" | "muted"
}) {
  const toneClass = {
    accent: "text-accent",
    positive: "text-positive",
    negative: "text-red-300",
    muted: "text-ink-mute",
  }[tone]
  return (
    <div className="text-center">
      <span className={`font-serif text-[22px] italic leading-tight ${toneClass}`}>
        {children}
      </span>
    </div>
  )
}

/**
 * Animated donut chart - arc fills from 0 to `percentage` on mount.
 * The number inside also count-ups in sync.
 */
export function AnimatedDonut({
  percentage,
  duration = 1400,
  size = 140,
  stroke = 14,
}: {
  percentage: number
  duration?: number
  size?: number
  stroke?: number
}) {
  const [pct, setPct] = useState(0)
  const [textPct, setTextPct] = useState(0)

  useEffect(() => {
    const start = setTimeout(() => setPct(percentage), 80)

    let raf: number
    let startTime: number | null = null
    const animate = (t: number) => {
      if (startTime === null) startTime = t
      const progress = Math.min((t - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setTextPct(Math.round(eased * percentage))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    return () => {
      clearTimeout(start)
      cancelAnimationFrame(raf)
    }
  }, [percentage, duration])

  const r = size / 2 - stroke / 2
  const C = 2 * Math.PI * r
  const dash = (pct / 100) * C
  const fakePct = 100 - percentage

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash.toFixed(2)} ${(C - dash).toFixed(2)}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: `stroke-dasharray ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)` }}
      />
      <text
        x={size / 2}
        y={size / 2 - 2}
        textAnchor="middle"
        className="fill-ink"
        fontSize="14"
        fontWeight="600"
        fontFamily="var(--font-serif)"
        fontStyle="italic"
      >
        real
      </text>
      <text
        x={size / 2}
        y={size / 2 + 14}
        textAnchor="middle"
        className="fill-ink-faint"
        fontSize="10"
      >
        {textPct}% / {fakePct}%
      </text>
    </svg>
  )
}

export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
      {children}
    </div>
  )
}
