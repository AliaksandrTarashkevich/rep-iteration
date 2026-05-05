"use client"

/**
 * ChatRuleBuilder
 * ---------------------------------------------------------------------------
 * Visual builder for chat access gates. Tuned for a zoomer who has never
 * seen a boolean expression and just wants to say "you need a gold medal
 * AND you need to be an athlete — either hockey or football, I don't care".
 *
 * Mental model we expose in the UI:
 *
 *   "Members need to match EVERY requirement below.
 *    Each requirement lists achievements — any one counts."
 *
 * Which maps to a fixed two-level rule tree under the hood:
 *
 *   root: AND-group (every requirement must be met)
 *     └── requirement #1: OR-group of achievements (any one counts)
 *     └── requirement #2: OR-group of achievements (any one counts)
 *     └── ...
 *
 * Adding achievements: the picker is OUT. The catalog lives next to this
 * builder (AchievementCatalog component). Each requirement card has an
 * "active" state — the next achievement picked from the catalog lands in
 * the active row. Tapping a non-active row activates it. The "+ OR" inline
 * button is gone for the same reason: one mental model, not two.
 */

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { EcosystemIcon } from "@/components/icons"

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type LogicOp = "and" | "or"

export type RuleNode =
  | { type: "achievement"; achievementId: string }
  | { type: "group"; op: LogicOp; children: RuleNode[] }

export interface AchievementOption {
  id: string
  name: string
  description: string
  icon: string
  ecosystem:
    | "polymarket"
    | "hyperliquid"
    | "solana"
    | "ethereum"
    | "base"
    | "bnb"
  category: "onchain" | "social"
  repValue: number
}

interface ChatRuleBuilderProps {
  rule: RuleNode
  onChange: (next: RuleNode) => void
  achievements: AchievementOption[]
  /** How many achievement leaves the entire rule may contain. */
  maxTotal?: number
  /** Index of the currently-active requirement (next pick lands here). */
  activeIndex: number
  /** Set the active requirement (clicking a row activates it). */
  onActivate: (index: number) => void
  /** Optional id of the most recently added chip — used to play arrival anim. */
  recentlyAddedAchievementId?: string | null
}

// ---------------------------------------------------------------------------
// Tree helpers
// ---------------------------------------------------------------------------

function countAchievements(node: RuleNode): number {
  if (node.type === "achievement") return 1
  return node.children.reduce((sum, c) => sum + countAchievements(c), 0)
}

function collectAchievementIds(node: RuleNode): string[] {
  if (node.type === "achievement") return [node.achievementId]
  return node.children.flatMap(collectAchievementIds)
}

/**
 * Natural-language preview for the plain-English hint box. We keep each
 * requirement on its own bulleted line and only use lowercase "or" within
 * a row — this reads like a checklist, not like code.
 */
function formatRequirementRows(
  node: Extract<RuleNode, { type: "group" }>,
  lookup: Map<string, AchievementOption>,
): string[] {
  return node.children
    .map((child) => {
      if (child.type === "achievement") {
        return lookup.get(child.achievementId)?.name ?? "Unknown"
      }
      const names = child.children
        .map((c) =>
          c.type === "achievement"
            ? (lookup.get(c.achievementId)?.name ?? "Unknown")
            : "",
        )
        .filter(Boolean)
      if (names.length === 0) return ""
      if (names.length === 1) return names[0]
      return names.join(" or ")
    })
    .filter(Boolean)
}

/**
 * Coerce any incoming RuleNode into the strict two-level shape the UI
 * expects (root AND of OR-groups). Handles legacy data and defensive cases.
 */
function normalize(node: RuleNode): Extract<RuleNode, { type: "group" }> {
  const wrapAsOr = (n: RuleNode): Extract<RuleNode, { type: "group" }> => {
    if (n.type === "achievement") {
      return { type: "group", op: "or", children: [n] }
    }
    if (n.op === "or") return n
    const leaves = collectAchievementIds(n).map<RuleNode>((id) => ({
      type: "achievement",
      achievementId: id,
    }))
    return { type: "group", op: "or", children: leaves }
  }

  if (node.type === "achievement") {
    return { type: "group", op: "and", children: [wrapAsOr(node)] }
  }
  if (node.op === "or") {
    return { type: "group", op: "and", children: [node] }
  }
  return {
    type: "group",
    op: "and",
    children: node.children.map(wrapAsOr),
  }
}

export function createEmptyRule(_op: LogicOp = "and"): RuleNode {
  // Root = AND ("every requirement must be met"), starting with one empty
  // OR-requirement so the user sees a target to drop achievements into.
  return {
    type: "group",
    op: "and",
    children: [{ type: "group", op: "or", children: [] }],
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ChatRuleBuilder({
  rule,
  onChange,
  achievements,
  maxTotal = 10,
  activeIndex,
  onActivate,
  recentlyAddedAchievementId,
}: ChatRuleBuilderProps) {
  const byId = useMemo(
    () => new Map(achievements.map((a) => [a.id, a])),
    [achievements],
  )
  const normalized = useMemo(() => normalize(rule), [rule])
  const total = countAchievements(normalized)
  const rows = formatRequirementRows(normalized, byId)

  const updateRequirement = (
    reqIndex: number,
    transform: (g: Extract<RuleNode, { type: "group" }>) => RuleNode,
  ) => {
    const nextChildren = normalized.children.map((child, i) => {
      if (i !== reqIndex) return child
      if (child.type !== "group") return child
      return transform(child as Extract<RuleNode, { type: "group" }>)
    })
    onChange({ ...normalized, children: nextChildren })
  }

  const addRequirement = () => {
    onChange({
      ...normalized,
      children: [
        ...normalized.children,
        { type: "group", op: "or", children: [] },
      ],
    })
    // Auto-activate the new requirement — user just created it, they're
    // about to fill it.
    onActivate(normalized.children.length)
  }

  const removeRequirement = (reqIndex: number) => {
    if (normalized.children.length <= 1) return
    onChange({
      ...normalized,
      children: normalized.children.filter((_, i) => i !== reqIndex),
    })
    if (activeIndex >= normalized.children.length - 1) {
      onActivate(Math.max(0, normalized.children.length - 2))
    }
  }

  const removeAchievement = (reqIndex: number, achIndex: number) => {
    updateRequirement(reqIndex, (g) => ({
      ...g,
      children: g.children.filter((_, i) => i !== achIndex),
    }))
  }

  const hasAnyAchievement = total > 0

  return (
    <div className="space-y-3">
      {/* ============ Live plain-English preview ============
          The glanceable summary of the gate. Uses tile--accent so it
          matches the accent surfaces used elsewhere in the app. */}
      {hasAnyAchievement && (
        <div className="tile tile--accent">
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent font-semibold">
            To join, members need
          </p>
          <ul className="space-y-1 text-sm leading-relaxed text-foreground">
            {rows.map((row, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent"
                  aria-hidden
                />
                <span className="break-words">{row}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ============ Requirement rows with AND divider between ============ */}
      <div className="space-y-1">
        {normalized.children.map((child, i) => {
          if (child.type !== "group") return null
          const requirement = child as Extract<RuleNode, { type: "group" }>
          return (
            <div key={i}>
              {i > 0 && <AndDivider />}
              <RequirementCard
                index={i}
                total={normalized.children.length}
                requirement={requirement}
                byId={byId}
                isActive={activeIndex === i}
                canRemove={normalized.children.length > 1}
                onActivate={() => onActivate(i)}
                onRemoveAchievement={(achIndex) =>
                  removeAchievement(i, achIndex)
                }
                onRemoveRequirement={() => removeRequirement(i)}
                recentlyAddedAchievementId={
                  activeIndex === i ? recentlyAddedAchievementId : null
                }
              />
            </div>
          )
        })}
      </div>

      {/* ============ AND — add another top-level requirement ============
          Uses the project's Pill primitive (ghost variant) so it reads as
          part of the same UI vocabulary as the rest of the site. */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={addRequirement}
          disabled={total >= maxTotal}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
            total >= maxTotal
              ? "cursor-not-allowed border-[var(--line)] text-[var(--ink-faint)] opacity-50"
              : "border-[var(--line-strong)] text-[var(--ink)] hover:border-[rgba(140,213,254,0.4)] hover:text-accent",
          )}
          aria-label="Need something else too"
        >
          <PlusIcon /> Need something else too
        </button>
        {total >= maxTotal && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-warning">
            Max reached
          </span>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RequirementCard — one OR-group of achievements ("any one of these counts").
// ---------------------------------------------------------------------------

function RequirementCard({
  index,
  total,
  requirement,
  byId,
  isActive,
  canRemove,
  onActivate,
  onRemoveAchievement,
  onRemoveRequirement,
  recentlyAddedAchievementId,
}: {
  index: number
  total: number
  requirement: Extract<RuleNode, { type: "group" }>
  byId: Map<string, AchievementOption>
  isActive: boolean
  canRemove: boolean
  onActivate: () => void
  onRemoveAchievement: (achIndex: number) => void
  onRemoveRequirement: () => void
  recentlyAddedAchievementId: string | null | undefined
}) {
  const isEmpty = requirement.children.length === 0
  const multi = requirement.children.length > 1

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return
    if (!isActive) onActivate()
  }

  // Show the index badge only when there are multiple requirements -
  // a single requirement doesn't need numbering.
  const showIndex = total > 1

  return (
    <div
      onClick={handleCardClick}
      role={isActive ? undefined : "button"}
      aria-current={isActive ? "true" : undefined}
      aria-label={isActive ? undefined : `Activate requirement ${index + 1}`}
      className={cn(
        "tile relative transition-all",
        isActive
          ? "tile--accent shadow-[0_0_24px_-12px_rgba(140,213,254,0.4)]"
          : "cursor-pointer hover:border-[rgba(140,213,254,0.25)]",
      )}
    >
      {/* Top-right index badge (only when multiple requirements) */}
      {showIndex && (
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-semibold tabular-nums",
              isActive
                ? "bg-[rgba(140,213,254,0.18)] text-accent"
                : "bg-[rgba(255,255,255,0.06)] text-[var(--ink-faint)]",
            )}
          >
            {index + 1}
          </span>
          {canRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemoveRequirement()
              }}
              className="p-0.5 text-[var(--ink-faint)] transition-colors hover:text-destructive"
              aria-label={`Remove requirement ${index + 1}`}
            >
              <XIcon />
            </button>
          )}
        </div>
      )}
      {!showIndex && canRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemoveRequirement()
          }}
          className="absolute right-3 top-3 p-0.5 text-[var(--ink-faint)] transition-colors hover:text-destructive"
          aria-label={`Remove requirement ${index + 1}`}
        >
          <XIcon />
        </button>
      )}

      {/* ============ Empty state ============
          Designed as the inviting hero of the card, not a placeholder
          inside it. Big icon + one-line copy, no double-border. */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center text-center py-3">
          <div
            className={cn(
              "mb-2.5 flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              isActive
                ? "bg-[rgba(140,213,254,0.12)] text-accent"
                : "bg-[rgba(255,255,255,0.04)] text-[var(--ink-faint)]",
            )}
          >
            <BadgePlusIcon />
          </div>
          <p
            className={cn(
              "text-sm font-medium leading-tight",
              isActive ? "text-foreground" : "text-[var(--ink-faint)]",
            )}
          >
            {isActive ? "Pick what they need" : "Or pick something else"}
          </p>
          <p
            className={cn(
              "mt-1 text-xs",
              isActive
                ? "text-[rgba(255,255,255,0.55)]"
                : "text-[var(--ink-faint)]",
            )}
          >
            {isActive ? (
              <>
                <span className="hidden md:inline">Tap any achievement on the right.</span>
                <span className="md:hidden">Tap any achievement below.</span>
              </>
            ) : (
              "Tap to activate"
            )}
          </p>
        </div>
      ) : (
        <>
          {/* Header eyebrow - tells the user what this row means */}
          <div className="mb-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)] font-mono">
              {multi ? "They need any of" : "They need"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {requirement.children.map((child, ai) => {
              if (child.type !== "achievement") return null
              const ach = byId.get(child.achievementId)
              return (
                <span
                  key={`${child.achievementId}-${ai}`}
                  className="inline-flex items-center gap-1.5"
                >
                  {ai > 0 && (
                    <span
                      className="font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]"
                      aria-hidden
                    >
                      or
                    </span>
                  )}
                  <AchievementChip
                    achievement={ach}
                    justAdded={recentlyAddedAchievementId === child.achievementId}
                    onRemove={() => onRemoveAchievement(ai)}
                  />
                </span>
              )
            })}
          </div>

          {/* Active hint - subtle, sits below chips */}
          {isActive && (
            <p className="mt-3 text-[10px] font-mono uppercase tracking-[0.18em] text-accent/60">
              + Tap to add more
            </p>
          )}
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// AndDivider — visual separator between requirement rows (top-level AND).
// ---------------------------------------------------------------------------

function AndDivider() {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-[rgba(140,213,254,0.2)]" />
      <span className="rounded-full bg-[rgba(140,213,254,0.1)] px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-accent">
        and
      </span>
      <div className="h-px flex-1 bg-[rgba(140,213,254,0.2)]" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// AchievementChip — single achievement inside a requirement row.
// ---------------------------------------------------------------------------

function AchievementChip({
  achievement,
  justAdded,
  onRemove,
}: {
  achievement?: AchievementOption
  justAdded: boolean
  onRemove: () => void
}) {
  if (!achievement) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs italic text-muted-foreground">
        Unknown
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Remove"
        >
          <XIcon />
        </button>
      </div>
    )
  }

  // 1px left-border accent line replaces the previous colored dot.
  const isOnchain = achievement.category === "onchain"
  const accentLine = isOnchain ? "before:bg-primary/70" : "before:bg-accent/70"

  return (
    <div
      className={cn(
        "group relative inline-flex items-center gap-1.5 overflow-hidden rounded-md border border-border/70 bg-card pl-3 pr-2 py-1",
        "before:absolute before:left-0 before:top-1/2 before:h-3 before:w-px before:-translate-y-1/2",
        accentLine,
        justAdded &&
          "animate-in zoom-in-95 fade-in duration-200 shadow-[0_0_12px_-4px_rgba(80,120,255,0.4)]",
      )}
    >
      <EcosystemIcon
        ecosystem={achievement.ecosystem}
        className="h-3 w-3 flex-shrink-0 text-muted-foreground"
      />
      <span className="text-xs font-medium text-foreground">
        {achievement.name}
      </span>
      <span className="font-mono text-[10px] tabular-nums text-primary">
        {achievement.repValue}
      </span>
      <button
        onClick={onRemove}
        className="ml-0.5 text-muted-foreground opacity-60 transition-all hover:text-destructive group-hover:opacity-100"
        aria-label={`Remove ${achievement.name}`}
      >
        <XIcon />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tiny inline icons.
// ---------------------------------------------------------------------------

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function BadgePlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="M9 12h6M12 9v6" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Re-exports for consumers that want the raw helpers.
// ---------------------------------------------------------------------------

export { countAchievements, collectAchievementIds }
