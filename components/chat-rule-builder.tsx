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
 *   Example: gate a chat with
 *     `(Gold Olympics OR Gold World Cup) AND (Hockey OR Football)`
 *   The creator just adds two requirement rows — the first with the two
 *   gold medals, the second with the two sports. No operator toggles, no
 *   "add sub-group" button, no parentheses. The words AND / OR never
 *   appear as controls; they only appear in the natural-language preview.
 *
 * Rule shape (kept intentionally generic so we can evolve it later without
 * a migration) stays:
 *
 *   type RuleNode =
 *     | { type: "achievement"; achievementId: string }
 *     | { type: "group"; op: "and" | "or"; children: RuleNode[] }
 */

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
 *
 * Returns an array of strings, one per requirement row.
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
 * expects (root AND of OR-groups). Handles legacy data and defensive cases:
 *   - bare achievement leaf → wrap as one OR-requirement with one option
 *   - a single OR-group → wrap in an AND-root with that one requirement
 *   - an AND-group whose children are a mix of leaves / OR-groups / ANDs →
 *     wrap bare leaves as single-option OR-requirements, keep OR children,
 *     flatten accidental ANDs into an OR of their leaves.
 */
function normalize(node: RuleNode): Extract<RuleNode, { type: "group" }> {
  const wrapAsOr = (n: RuleNode): Extract<RuleNode, { type: "group" }> => {
    if (n.type === "achievement") {
      return { type: "group", op: "or", children: [n] }
    }
    if (n.op === "or") return n
    // Accidental AND where we wanted OR — flatten its leaves into an OR row.
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
}: ChatRuleBuilderProps) {
  const byId = useMemo(
    () => new Map(achievements.map((a) => [a.id, a])),
    [achievements],
  )
  const normalized = useMemo(() => normalize(rule), [rule])
  const total = countAchievements(normalized)
  const rows = formatRequirementRows(normalized, byId)
  const usedIds = collectAchievementIds(normalized)

  // Only one inline picker open at a time — keyed by requirement index.
  const [pickerIndex, setPickerIndex] = useState<number | null>(null)

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
  }

  const removeRequirement = (reqIndex: number) => {
    // Keep at least one empty requirement visible as a drop target.
    if (normalized.children.length <= 1) return
    onChange({
      ...normalized,
      children: normalized.children.filter((_, i) => i !== reqIndex),
    })
  }

  const addAchievement = (reqIndex: number, achievementId: string) => {
    updateRequirement(reqIndex, (g) => ({
      ...g,
      children: [...g.children, { type: "achievement", achievementId }],
    }))
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
      {/* Header text ("Who can join? / Add what people need...") was
          removed per design feedback — the example text was noisy and
          the example + hint now live as the achievement picker's input
          placeholder and the picker list's empty state. */}

      {/* ============ Live plain-English preview ============
          The glanceable summary of the currently-configured rule tree.
          Mint/teal accent + brighter background so it reads as the
          *source of truth* at the top of the builder. */}
      {hasAnyAchievement && (
        <div
          className="rounded-xl border border-accent/40 px-3 py-2.5 shadow-[0_0_20px_-10px_var(--accent-glow)]"
          style={{ backgroundColor: "rgba(0, 210, 190, 0.08)" }}
        >
          <p className="mb-1.5 text-[10px] uppercase tracking-wider text-accent">
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
                canRemove={normalized.children.length > 1}
                onAddClick={() => setPickerIndex(i)}
                onRemoveAchievement={(achIndex) =>
                  removeAchievement(i, achIndex)
                }
                onRemoveRequirement={() => removeRequirement(i)}
                atMaxTotal={total >= maxTotal}
                pickerOpen={pickerIndex === i}
                onClosePicker={() => setPickerIndex(null)}
                onPickAchievement={(id) => {
                  addAchievement(i, id)
                  setPickerIndex(null)
                }}
                achievements={achievements}
                excludeIds={usedIds}
              />
            </div>
          )
        })}
      </div>

      {/* ============ AND — add another top-level requirement ============
          Dashed primary-blue pill (matches the "+ Pick achievement" CTA
          on the empty requirement card and the blue-framed wrapper
          cards), so the two tappable "add something" affordances feel
          like siblings in the same palette. */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={addRequirement}
          disabled={total >= maxTotal}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all",
            total >= maxTotal
              ? "cursor-not-allowed border-border text-muted-foreground/50"
              : "border-primary/60 bg-primary/10 text-primary hover:border-primary hover:bg-primary/20 hover:shadow-[0_0_14px_-4px_var(--accent-glow)]",
          )}
          aria-label="AND — add another requirement"
        >
          <PlusIcon /> Add another rule
        </button>
        {total >= maxTotal && (
          <span className="text-xs text-warning">Max reached</span>
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
  canRemove,
  onAddClick,
  onRemoveAchievement,
  onRemoveRequirement,
  atMaxTotal,
  pickerOpen,
  onClosePicker,
  onPickAchievement,
  achievements,
  excludeIds,
}: {
  index: number
  total: number
  requirement: Extract<RuleNode, { type: "group" }>
  byId: Map<string, AchievementOption>
  canRemove: boolean
  onAddClick: () => void
  onRemoveAchievement: (achIndex: number) => void
  onRemoveRequirement: () => void
  atMaxTotal: boolean
  pickerOpen: boolean
  onClosePicker: () => void
  onPickAchievement: (id: string) => void
  achievements: AchievementOption[]
  excludeIds: string[]
}) {
  const isEmpty = requirement.children.length === 0
  const multi = requirement.children.length > 1

  // Plural copy changes based on how many achievements are in the row —
  // empty / exactly one / multiple. Kept conversational.
  const requirementCopy = isEmpty
    ? "Pick what they need"
    : multi
      ? "They need any one of these"
      : "They need this"

  const headerLead =
    total === 1 ? "" : `Requirement ${index + 1} — `

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 p-3">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary">
            {index + 1}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {headerLead}
            <span className="text-foreground">{requirementCopy}</span>
          </span>
        </div>
        {canRemove && (
          <button
            onClick={onRemoveRequirement}
            className="p-1 text-muted-foreground transition-colors hover:text-destructive"
            aria-label={`Remove requirement ${index + 1}`}
          >
            <XIcon />
          </button>
        )}
      </div>

      {/* Achievement chips (or empty placeholder) — the empty state
          doubles as the primary CTA: clicking it opens the picker. Warm
          primary tint + glow so it reads as the inviting "tap here" spot
          rather than a greyed-out void. */}
      {isEmpty ? (
        <button
          type="button"
          onClick={onAddClick}
          disabled={atMaxTotal || pickerOpen}
          className={cn(
            "w-full rounded-lg border border-dashed px-3 py-4 text-center transition-all",
            atMaxTotal
              ? "cursor-not-allowed border-border bg-muted/20"
              : "border-primary/40 bg-primary/5 hover:border-primary/70 hover:bg-primary/10 hover:shadow-[0_0_18px_-8px_var(--accent-glow)]",
          )}
        >
          <p className="text-xs font-medium text-primary">
            + Pick achievement
          </p>
          <p className="mt-1 text-[10px] italic text-muted-foreground">
            e.g. Diamond PnL, Liquid Hands, Polymarket Trader
          </p>
        </button>
      ) : (
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
                    className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60"
                    aria-hidden
                  >
                    or
                  </span>
                )}
                <AchievementChip
                  achievement={ach}
                  onRemove={() => onRemoveAchievement(ai)}
                />
              </span>
            )
          })}
        </div>
      )}

      {/* "+ OR" — compact uppercase link to append an alternative
          achievement to this requirement. Only shown once the row has at
          least one chip, because an empty row already uses the big
          dashed CTA above as its primary pick-achievement affordance. */}
      {!isEmpty && (
        <div className="mt-3">
          <button
            onClick={onAddClick}
            disabled={atMaxTotal || pickerOpen}
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors",
              atMaxTotal
                ? "cursor-not-allowed text-muted-foreground/40"
                : "text-primary/80 hover:text-primary",
            )}
            aria-label="OR — add an alternative achievement"
          >
            <PlusIcon /> OR
          </button>
        </div>
      )}

      {/* Inline picker */}
      {pickerOpen && (
        <AchievementPicker
          achievements={achievements}
          excludeIds={excludeIds}
          onPick={onPickAchievement}
          onClose={onClosePicker}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// AndDivider — visual separator between requirement rows (top-level AND).
// ---------------------------------------------------------------------------

function AndDivider() {
  // Pill badge uses the mint/teal accent (matches the advanced-section
  // accent colour used on the summary card and section wrapper), so the
  // AND between requirements reads as part of the same visual family.
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="h-px flex-1 bg-border" />
      <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent shadow-[0_0_10px_-4px_var(--accent-glow)]">
        and also
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// AchievementChip — single achievement inside a requirement row.
// ---------------------------------------------------------------------------

function AchievementChip({
  achievement,
  onRemove,
}: {
  achievement?: AchievementOption
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

  // Category tint — a tiny coloured dot + subtle border/bg so users can
  // scan a long requirement row and *see* the mix of onchain (blue) vs
  // social (green) achievements without reading every label.
  const isOnchain = achievement.category === "onchain"
  const dotClass = isOnchain ? "bg-primary" : "bg-accent"
  const borderClass = isOnchain
    ? "border-primary/25"
    : "border-accent/30"

  return (
    <div
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1",
        borderClass,
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", dotClass)}
        aria-hidden
      />
      <EcosystemIcon
        ecosystem={achievement.ecosystem}
        className="h-3 w-3 flex-shrink-0 text-muted-foreground"
      />
      <span className="text-xs font-medium text-foreground">
        {achievement.name}
      </span>
      <span className="font-mono text-[10px] text-primary">
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
// AchievementPicker — inline searchable list that appears under the row
// when the user clicks "Pick achievement" / "Add alternative".
// ---------------------------------------------------------------------------

type PickerFilter = "all" | "onchain" | "social"

function AchievementPicker({
  achievements,
  excludeIds,
  onPick,
  onClose,
}: {
  achievements: AchievementOption[]
  excludeIds: string[]
  onPick: (id: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<PickerFilter>("all")

  const filtered = useMemo(() => {
    const excluded = new Set(excludeIds)
    return achievements
      .filter((a) => !excluded.has(a.id))
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
      .sort((a, b) => b.repValue - a.repValue)
  }, [achievements, excludeIds, filter, query])

  return (
    // Glass-morphism: translucent background + backdrop-blur so the
    // picker feels like it's floating above the requirement row rather
    // than being part of it. A thin accent border sells the "panel" look.
    <div
      className="mt-3 animate-in fade-in slide-in-from-top-1 rounded-xl border border-accent/20 p-3 duration-150 backdrop-blur-md shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]"
      style={{ backgroundColor: "rgba(10, 13, 17, 0.72)" }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Diamond Hands, DeFi OG, Early Adopter..."
          className="h-8 text-sm"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-8 px-2 text-muted-foreground"
        >
          Cancel
        </Button>
      </div>

      <div className="mb-2 flex items-center gap-1">
        {(["all", "onchain", "social"] as const).map((id) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              filter === id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70",
            )}
          >
            {id === "all" ? "All" : id === "onchain" ? "Onchain" : "Social"}
          </button>
        ))}
      </div>

      <div className="thin-scrollbar -mx-1 max-h-64 space-y-1 overflow-y-auto px-1">
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-xs italic text-muted-foreground">
            Nothing matches.
          </p>
        ) : (
          filtered.map((ach) => (
            <button
              key={ach.id}
              onClick={() => onPick(ach.id)}
              className="flex w-full items-start gap-2.5 rounded-lg border border-transparent p-2 text-left transition-colors hover:border-primary/30 hover:bg-primary/10"
            >
              <EcosystemIcon
                ecosystem={ach.ecosystem}
                className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-medium text-foreground">
                    {ach.name}
                  </p>
                  <span className="ml-auto font-mono text-[10px] text-primary">
                    {ach.repValue}
                  </span>
                </div>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {ach.description}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tiny inline icons (kept local to avoid pulling a bigger icon set).
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
      className="h-3.5 w-3.5"
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

// ---------------------------------------------------------------------------
// Re-exports for consumers that want the raw helpers (e.g. chat detail page
// rendering the full expression, or the catalog flattening to required ids).
// ---------------------------------------------------------------------------

export { countAchievements, collectAchievementIds }
