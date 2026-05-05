"use client"

/**
 * AchievementCatalog
 * ---------------------------------------------------------------------------
 * Persistent picker that lives next to the rule builder during chat creation.
 * Replaces the inline AchievementPicker that used to open from each
 * RequirementCard.
 *
 * The catalog is the *visible source of truth* for what's pickable. Every
 * achievement is always on screen (search-filtered + category-filtered).
 * Tapping one fires `onPick(id)` — the parent decides which requirement
 * receives it (the "active requirement" pattern). Already-used achievements
 * are dimmed and badged "IN USE", click is a no-op.
 */

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { EcosystemIcon } from "@/components/icons"
import type { AchievementOption } from "@/components/chat-rule-builder"

type CatalogFilter = "all" | "onchain" | "social"

export interface AchievementCatalogProps {
  achievements: AchievementOption[]
  usedIds: string[]
  onPick: (id: string) => void
  totalSelected: number
  maxTotal: number
  /** When true, the catalog is fully disabled (e.g. wizard moved off step 1). */
  disabled?: boolean
  /** Class applied to the outer wrapper. */
  className?: string
}

export function AchievementCatalog({
  achievements,
  usedIds,
  onPick,
  totalSelected,
  maxTotal,
  disabled = false,
  className,
}: AchievementCatalogProps) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<CatalogFilter>("all")

  const used = useMemo(() => new Set(usedIds), [usedIds])
  const atMax = totalSelected >= maxTotal

  // Filter, search, and sort. We *show* used items (dimmed) so the user can
  // see "this is already in play" rather than wonder where it went.
  const items = useMemo(() => {
    return achievements
      .filter((a) => (filter === "all" ? true : a.category === filter))
      .filter((a) => {
        if (!query.trim()) return true
        const q = query.trim().toLowerCase()
        return (
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.ecosystem.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        // Used items sink to the bottom; otherwise sort by repValue desc.
        const aUsed = used.has(a.id) ? 1 : 0
        const bUsed = used.has(b.id) ? 1 : 0
        if (aUsed !== bUsed) return aUsed - bUsed
        return b.repValue - a.repValue
      })
  }, [achievements, filter, query, used])

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {/* Eyebrow header — pro-infrastructure feel, monospaced counter */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Achievements
        </span>
        <span
          className={cn(
            "font-mono text-[11px] tabular-nums",
            atMax ? "text-warning" : "text-muted-foreground",
          )}
        >
          {totalSelected} / {maxTotal} selected
        </span>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search achievements"
          className="h-8 font-mono text-xs placeholder:font-mono"
        />
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1 px-3 pb-2">
        {(["all", "onchain", "social"] as const).map((id) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
              filter === id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60",
            )}
          >
            {id === "all" ? "All" : id === "onchain" ? "Onchain" : "Social"}
          </button>
        ))}
      </div>

      <div className="h-px bg-border" />

      {/* List — flex-1 + overflow so it scrolls inside its panel */}
      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {items.length === 0 ? (
          <p className="py-6 text-center text-xs italic text-muted-foreground">
            Nothing matches.
          </p>
        ) : atMax && used.size >= achievements.length ? (
          <p className="py-6 text-center text-xs italic text-muted-foreground">
            All achievements in play. Remove a chip to swap.
          </p>
        ) : (
          <ul className="space-y-1">
            {items.map((ach) => {
              const isUsed = used.has(ach.id)
              const isDisabled = isUsed || (atMax && !isUsed)
              return (
                <li key={ach.id}>
                  <button
                    type="button"
                    onClick={() => !isDisabled && onPick(ach.id)}
                    disabled={isDisabled}
                    aria-label={
                      isUsed
                        ? `${ach.name} already in use`
                        : `Add ${ach.name} to rule`
                    }
                    aria-disabled={isDisabled}
                    className={cn(
                      "group flex w-full items-start gap-2.5 rounded-md border px-2.5 py-2 text-left transition-colors",
                      isUsed
                        ? "border-border/40 bg-muted/10 opacity-40"
                        : isDisabled
                          ? "cursor-not-allowed border-border/40 opacity-30"
                          : "border-border/60 hover:border-primary/40 hover:bg-primary/5",
                    )}
                  >
                    {/* Left accent line — replaces the colored category dot.
                        Onchain = primary, Social = accent. 1px wide, full height. */}
                    <span
                      className={cn(
                        "mt-0.5 h-9 w-px flex-shrink-0",
                        ach.category === "onchain" ? "bg-primary/60" : "bg-accent/60",
                      )}
                      aria-hidden
                    />
                    <EcosystemIcon
                      ecosystem={ach.ecosystem}
                      className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium text-foreground">
                          {ach.name}
                        </p>
                        {isUsed && (
                          <span className="ml-1 rounded-sm bg-muted/60 px-1 py-px font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                            In use
                          </span>
                        )}
                        <span className="ml-auto font-mono text-[10px] tabular-nums text-primary">
                          {ach.repValue}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70">
                          {ach.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40">
                          ·
                        </span>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {ach.description}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
