import * as React from "react"
import { cn } from "@/lib/utils"

// Tabular, mono number — use for every numeric value.
export function Num({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span data-slot="num" className={cn("num", className)} {...rest}>
      {children}
    </span>
  )
}

// Mono uppercase eyebrow with leading hairline (cyan by default).
export function Kicker({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <span className={cn("kicker", className)}>{children}</span>
}

// Short uppercase mono label without the leading line — for column headers, meta.
export function MonoCap({
  className,
  children,
  size = "md",
}: {
  className?: string
  children: React.ReactNode
  size?: "sm" | "md"
}) {
  return (
    <div className={cn(size === "sm" ? "mono-cap-sm" : "mono-cap", className)}>
      {children}
    </div>
  )
}

// Base tile. Extend with className or variant props as needed.
export function Tile({
  className,
  accent = false,
  category,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  accent?: boolean
  category?: string
}) {
  return (
    <div
      data-slot="tile"
      className={cn("tile", accent && "tile--accent", className)}
      style={category ? { borderTop: `2px solid ${category}` } : undefined}
      {...rest}
    >
      {children}
    </div>
  )
}

// Glass tile — REP glass panel via @dancingteeth/rep-design's canonical
// `rep-surface-glass-blur` utility (1px white/0.2 border, black/0.3 fill,
// rep-card radius 40px, inset shadow, 8px backdrop blur).
//
// Variants layer the gradient-stroke ring extracted from
// `rep-cmp-leaderboard-summary-card`:
//   - "plain"   → just the package surface (default)
//   - "bright"  → stat tiles & summary panels (lit-from-above edge)
//   - "muted"   → list/achievement cards (softer ring)
//
// `interactive` adds cursor + cyan hover glow for clickable tiles.
export function GlassTile({
  variant = "plain",
  interactive = false,
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "plain" | "bright" | "muted"
  interactive?: boolean
}) {
  return (
    <div
      data-slot="glass-tile"
      data-variant={variant}
      className={cn(
        "rep-surface-glass-blur p-6",
        variant === "bright" && "rep-glass-stroke-bright",
        variant === "muted" && "rep-glass-stroke-muted",
        interactive && "rep-glass-hover-glow",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

// Button-like pill. variant: default | ghost | accent; size: md | sm.
// Maps onto @dancingteeth/rep-design's `rep-btn` system primitive
// (rep-primitives.css). All variants get the pill radius + focus ring.
export function Pill({
  variant = "default",
  size = "md",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "accent"
  size?: "md" | "sm"
}) {
  return (
    <button
      data-slot="pill"
      className={cn(
        "rep-btn rep-btn-pill rep-focus-ring",
        size === "sm" ? "rep-btn-sm" : "rep-btn-md",
        variant === "ghost" && "rep-btn-ghost",
        variant === "accent" && "rep-btn-primary",
        variant === "default" && "rep-btn-secondary",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

// Tag/chip — shorter, quieter than a pill. Mono, 11px.
export function Chip({
  accent = false,
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & { accent?: boolean }) {
  return (
    <span
      data-slot="chip"
      className={cn("chip", accent && "chip--accent", className)}
      {...rest}
    >
      {children}
    </span>
  )
}

// Page title — wraps <em> children in Fraunces italic cyan automatically via .title em.
export function Title({
  as: Tag = "h1",
  className,
  children,
}: {
  as?: "h1" | "h2" | "h3"
  className?: string
  children: React.ReactNode
}) {
  return <Tag className={cn("title", className)}>{children}</Tag>
}

// Section heading — Graphik LCG Semibold 24px uppercase, line-height 100%,
// letter-spacing 0, with the cyan→white 103.55deg gradient (`.rep-section-title-gradient`
// in globals.css — exact Figma spec). Single look for all section titles across
// the app: ACHIEVEMENTS / LEADERBOARDS / REFERRAL NETWORK / SOCIAL GRAPH / etc.
// Override size with `className="text-lg"` etc. when nested in tighter rows.
export function SectionTitle({
  as: Tag = "h2",
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3"
}) {
  return (
    <Tag
      className={cn(
        "rep-section-title-gradient font-display text-2xl font-semibold uppercase leading-none tracking-normal",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
