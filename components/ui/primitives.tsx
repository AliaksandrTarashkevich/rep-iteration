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

// Button-like pill. variant: default | ghost | accent; size: md | sm.
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
        "pill",
        variant === "ghost" && "pill--ghost",
        variant === "accent" && "pill--accent",
        size === "sm" && "pill--sm",
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
