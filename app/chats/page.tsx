"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getAvatarUrl, getPoolAvatarByIndex } from "@/lib/avatars"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  EcosystemIcon, 
  ZapBolt, 
  Sparkle,
  Check as CheckIcon,
  ChevronDown,
  ChevronUp,
  Trophy,
  CrownIcon,
  MedalIcon
} from "@/components/icons"
import {
  ChatRuleBuilder,
  createEmptyRule,
  countAchievements,
  collectAchievementIds,
  type RuleNode,
  type AchievementOption,
} from "@/components/chat-rule-builder"
import { AchievementCatalog } from "@/components/achievement-catalog"
import { PageShell } from "@/components/ui/page-shell"
import { Pill, Num, MonoCap } from "@/components/ui/primitives"

// Ecosystem types - includes BNB (6 ecosystems per spec)
type Ecosystem = "all" | "polymarket" | "hyperliquid" | "solana" | "ethereum" | "base" | "bnb"

// Chat status types
type ChatStatus = "available" | "almost" | "locked"

// Extended Chat interface for catalog
interface CatalogChat {
  id: string
  slug: string
  name: string
  description: string
  ecosystem: Exclude<Ecosystem, "all">
  status: ChatStatus
  members: number
  chatPower: number
  growth: number // percentage
  proofStack: {
    current: number
    required: number
  }
  requiredAchievements: {
    id: string
    name: string
    icon: string
    earned: boolean
  }[]
  missingAchievements?: string[] // For "almost" status
  creator: {
    handle: string
    followers: number
  }
  image?: string
  tier?: "og" | "general" | "behavior"
  /**
   * Full nested AND/OR expression produced by the rule builder.
   * `requiredAchievements` above is a flat projection of this tree for
   * surfaces that don't need to render the full logic (card pills, etc.).
   */
  rule?: RuleNode
}

// Ecosystem colors (for icons)
function getEcosystemColor(ecosystem: Exclude<Ecosystem, "all">) {
  switch (ecosystem) {
    case "polymarket":
      return "text-blue-400"
    case "hyperliquid":
      return "text-cyan-400"
    case "solana":
      return "text-purple-400"
    case "ethereum":
      return "text-indigo-400"
    case "base":
      return "text-blue-300"
    case "bnb":
      return "text-yellow-400"
    default:
      return "text-muted-foreground"
  }
}

// Status badge component - no more "locked" visual, just info about progress
function StatusBadge({ status, missing }: { status: ChatStatus; missing?: string[] }) {
  switch (status) {
    case "available":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-positive/15 text-positive border border-positive/20">
          <CheckIcon className="h-3 w-3" />
          Ready
        </span>
      )
    case "almost":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/15 text-warning border border-warning/20">
          <Sparkle className="h-3 w-3" />
          Almost
        </span>
      )
    case "locked":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
          {missing?.length || 0} to go
        </span>
      )
  }
}

// Available achievements used by the rule builder. `repValue` + `category`
// drive the picker's default sort and its Onchain/Social filter pills.
const availableAchievements: AchievementOption[] = [
  { id: "liquid-hands",   name: "Liquid Hands",       description: "Top 5% Hyperliquid traders by 90d volume",  icon: "chart",    ecosystem: "hyperliquid", category: "onchain", repValue: 350 },
  { id: "credit-native",  name: "Credit Native",      description: "Aave + Morpho power user over 180 days",    icon: "layers",   ecosystem: "ethereum",    category: "onchain", repValue: 280 },
  { id: "signal-relay",   name: "Signal Relay",       description: "Invited 5+ high-signal users who stayed",   icon: "share",    ecosystem: "base",        category: "social",  repValue: 200 },
  { id: "diamond-pnl",    name: "Diamond PnL",        description: "Profitable for 90+ consecutive days",       icon: "trending", ecosystem: "hyperliquid", category: "onchain", repValue: 400 },
  { id: "poly-oracle",    name: "Poly Oracle",        description: "Correctly predicted 10+ major outcomes",    icon: "target",   ecosystem: "polymarket",  category: "onchain", repValue: 500 },
  { id: "macro-sage",     name: "Macro Sage",         description: "Called 3+ macro events before mainstream",  icon: "eye",      ecosystem: "polymarket",  category: "social",  repValue: 300 },
  { id: "pm-trader",      name: "Polymarket Trader",  description: "Made at least 10 trades on Polymarket",     icon: "chart",    ecosystem: "polymarket",  category: "onchain", repValue: 150 },
  { id: "pm-volume",      name: "$10K+ Volume",       description: "Traded over $10,000 lifetime volume",       icon: "dollar",   ecosystem: "polymarket",  category: "onchain", repValue: 220 },
  { id: "hl-trader",      name: "HL Trader",          description: "Active trader on HyperLiquid",              icon: "zap",      ecosystem: "hyperliquid", category: "onchain", repValue: 180 },
  { id: "sol-holder",     name: "SOL Holder",         description: "Holds SOL in wallet",                        icon: "wallet",   ecosystem: "solana",      category: "onchain", repValue: 100 },
  { id: "base-deployer",  name: "Contract Deployer",  description: "Deployed a contract on Base",                icon: "code",     ecosystem: "base",        category: "onchain", repValue: 250 },
  { id: "eth-holder",     name: "ETH Holder",         description: "Holds ETH in wallet",                        icon: "wallet",   ecosystem: "ethereum",    category: "onchain", repValue: 80 },
  { id: "bnb-trader",     name: "BNB Chain Trader",   description: "Active trader on BNB Chain",                 icon: "zap",      ecosystem: "bnb",         category: "onchain", repValue: 160 },
  { id: "bnb-defi",       name: "BNB DeFi User",      description: "Used 3+ DeFi protocols on BNB Chain",        icon: "layers",   ecosystem: "bnb",         category: "onchain", repValue: 190 },
]

// Hard cap enforced by product: a rule can reference at most 10 achievement
// leaves across the whole tree (keeps rules readable + matchable fast).
const MAX_SELECTABLE_ACHIEVEMENTS = 10

// ============================================================================
// CREATE CHAT MODAL
// Two-pane layout on Step 1 (gates):
//   - Left pane: rank tier selector + ChatRuleBuilder (the rule tree).
//   - Right pane: AchievementCatalog (persistent, always visible).
// Mobile: stacked vertically (50/50). Desktop: side-by-side.
// Step 2 (details): single-pane name + description.
// Step 3 (success): centered confirmation.
//
// "Active requirement" pattern: the next achievement picked from the catalog
// lands in the currently-active requirement row. Tap a non-active row to
// activate it. This replaces the old inline picker per V's 04/23 feedback
// ("движение, это жизнь" — make the connection rule↔achievement spatial).
// ============================================================================

function CreateChatModal({
  onClose,
  onChatCreated,
}: {
  onClose: () => void
  onChatCreated: (chat: CatalogChat) => void
}) {
  const [rule, setRule] = useState<RuleNode>(() => createEmptyRule("or"))
  const [roomName, setRoomName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  type WizardStep = "gates" | "details" | "success"
  const [step, setStep] = useState<WizardStep>("gates")
  const [createdChat, setCreatedChat] = useState<CatalogChat | null>(null)

  // Rank-tier gate was removed per 04/27 retrospective ("убрать сложную
  // ranks-логику") — chats are now gated purely by achievements.

  // Active-requirement pattern: catalog picks land in this row. Defaults to
  // the first (and only) row at modal open. Bumps to last when a new
  // requirement is added; clamped if a requirement is removed.
  const [activeRequirementIndex, setActiveRequirementIndex] = useState(0)

  // Set briefly when an achievement is added — drives the chip's arrival
  // animation in ChatRuleBuilder. Cleared after a frame budget.
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null)

  // Ref to the left-pane scrolling container — when a chip is added we
  // scroll the active requirement into view so the user can see the
  // arrival animation, even on cramped mobile heights.
  const builderPaneRef = useRef<HTMLDivElement | null>(null)

  const totalSelected = countAchievements(rule)
  const usedIds = useMemo(() => collectAchievementIds(rule), [rule])

  // Keep activeRequirementIndex in range when the rule shape changes.
  useEffect(() => {
    if (rule.type !== "group") return
    if (activeRequirementIndex >= rule.children.length) {
      setActiveRequirementIndex(Math.max(0, rule.children.length - 1))
    }
  }, [rule, activeRequirementIndex])

  // Adding an achievement from the catalog. We append it to the active
  // requirement's OR-group. No-op if at cap or already in this row.
  const handlePickAchievement = (achievementId: string) => {
    if (totalSelected >= MAX_SELECTABLE_ACHIEVEMENTS) return
    if (rule.type !== "group") return
    if (usedIds.includes(achievementId)) return // global de-dup

    const nextChildren = rule.children.map((child, i) => {
      if (i !== activeRequirementIndex) return child
      if (child.type !== "group") return child
      return {
        ...child,
        children: [
          ...child.children,
          { type: "achievement" as const, achievementId },
        ],
      }
    })
    setRule({ ...rule, children: nextChildren })

    // Trigger arrival animation on the new chip.
    setRecentlyAddedId(achievementId)
    window.setTimeout(() => setRecentlyAddedId(null), 350)

    // On cramped layouts (mobile, or many requirements), the active row
    // can be scrolled out of view — scroll it back in so the user sees
    // the chip arrive.
    requestAnimationFrame(() => {
      const pane = builderPaneRef.current
      if (!pane) return
      const activeCard = pane.querySelector<HTMLElement>('[aria-current="true"]')
      if (activeCard) {
        activeCard.scrollIntoView({ block: "nearest", behavior: "smooth" })
      }
    })
  }

  const handleCreate = async () => {
    if (totalSelected < 1) return
    setIsCreating(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const selectedIds = collectAchievementIds(rule)
    const firstAch = availableAchievements.find((a) =>
      selectedIds.includes(a.id),
    )
    const finalName =
      roomName.trim() || (firstAch ? `${firstAch.name} Room` : "New Room")

    const newChat: CatalogChat = {
      id: `new-${Date.now()}`,
      slug: finalName.toLowerCase().replace(/\s+/g, "-"),
      name: finalName,
      description: description.trim() || "A community of verified members",
      ecosystem: firstAch?.ecosystem || "ethereum",
      status: "available",
      members: 1,
      chatPower: 100,
      growth: 0,
      proofStack: {
        current: selectedIds.length,
        required: selectedIds.length,
      },
      requiredAchievements: selectedIds.map((id) => {
        const ach = availableAchievements.find((a) => a.id === id)
        return { id, name: ach?.name || "", icon: ach?.icon || "", earned: true }
      }),
      creator: { handle: "you", followers: 0 },
      rule,
    }

    onChatCreated(newChat)
    setCreatedChat(newChat)
    setIsCreating(false)
    setStep("success")
  }

  const canAdvanceFromGates = totalSelected >= 1
  const canSubmit = totalSelected >= 1 && !isCreating

  const STEPS: { id: WizardStep; label: string }[] = [
    { id: "gates",   label: "Who can join" },
    { id: "details", label: "Name & details" },
  ]
  const activeStepIndex = step === "details" ? 1 : 0

  // Width animates with step — wide on gates (room for catalog), narrow
  // on details + success (no catalog). Uses transition-[max-width].
  const wrapperMaxWidth =
    step === "gates" ? "max-w-4xl" : "max-w-lg"

  // Portal to body so the modal escapes app-shell's `<main z-10>` stacking
  // context — otherwise the sidebar (z-40, outside main) ends up on top.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isCreating) onClose()
      }}
    >
      <div
        className={cn(
          "w-full animate-in fade-in zoom-in-95 duration-300 transition-[max-width] ease-out",
          wrapperMaxWidth,
        )}
      >
        <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden h-[90vh] max-h-[90vh]">
          {step === "success" && createdChat ? (
            // ==================== SUCCESS STEP ====================
            <div className="flex flex-col items-center justify-center text-center p-8 flex-1">
              <div className="flex justify-center mb-5">
                <div className="p-4 rounded-full bg-positive/20 border-2 border-positive/40 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <CheckIcon className="h-10 w-10 text-positive" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">Chat created</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {createdChat.name} is live.
              </p>
              <div className="rounded-xl border border-border bg-muted/20 px-3 py-2 mb-5 inline-flex items-center gap-2 max-w-full">
                <span className="text-xs text-muted-foreground flex-shrink-0">Link</span>
                <span className="text-xs font-mono text-primary truncate">
                  /chats/{createdChat.slug}
                </span>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <Link href={`/chats/${createdChat.slug}`} className="block">
                  <Button className="w-full">View chat</Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={onClose}>
                  Back to catalog
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Header (fixed) */}
              <div className="flex items-center justify-between px-6 pt-6 pb-3">
                <h2 className="text-xl font-bold text-foreground">
                  {step === "gates" ? "Create chat" : "Name your chat"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Step indicator (fixed) */}
              <div className="px-6 pb-4 flex items-center gap-2">
                {STEPS.map((s, i) => {
                  const isActive = i === activeStepIndex
                  const isComplete = i < activeStepIndex
                  return (
                    <div key={s.id} className="flex-1 flex flex-col gap-1.5">
                      <div
                        className={cn(
                          "h-1 rounded-full transition-colors",
                          isActive
                            ? "bg-primary"
                            : isComplete
                              ? "bg-accent"
                              : "bg-muted",
                        )}
                      />
                      <span
                        className={cn(
                          "font-mono text-[10px] uppercase tracking-[0.18em] font-semibold",
                          isActive
                            ? "text-primary"
                            : isComplete
                              ? "text-accent"
                              : "text-muted-foreground",
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* ============ Step 1: gates — two-pane body ============ */}
              {step === "gates" && (
                <div
                  className={cn(
                    "min-h-0 flex-1 overflow-hidden",
                    "grid grid-cols-1 grid-rows-[1.4fr_1fr]",
                    "md:grid-cols-[1.05fr_0.95fr] md:grid-rows-1",
                  )}
                >
                  {/* LEFT pane — rule builder, scrolls inside */}
                  <div
                    ref={builderPaneRef}
                    className="thin-scrollbar overflow-y-auto px-6 pb-4 pt-1 min-h-0"
                  >
                    <ChatRuleBuilder
                      rule={rule}
                      onChange={setRule}
                      achievements={availableAchievements}
                      maxTotal={MAX_SELECTABLE_ACHIEVEMENTS}
                      activeIndex={activeRequirementIndex}
                      onActivate={setActiveRequirementIndex}
                      recentlyAddedAchievementId={recentlyAddedId}
                    />
                  </div>

                  {/* RIGHT pane — achievement catalog, scrolls inside */}
                  <div className="border-t border-border md:border-t-0 md:border-l bg-muted/[0.02] flex flex-col min-h-0">
                    <AchievementCatalog
                      achievements={availableAchievements}
                      usedIds={usedIds}
                      onPick={handlePickAchievement}
                      totalSelected={totalSelected}
                      maxTotal={MAX_SELECTABLE_ACHIEVEMENTS}
                    />
                  </div>
                </div>
              )}

              {/* ============ Step 2: details ============ */}
              {step === "details" && (
                <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4">
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        Chat name
                        <span className="ml-1.5 font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </label>
                      <Input
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="e.g. Polymarket Whales"
                        maxLength={50}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">
                        Description
                        <span className="ml-1.5 font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What is this room about?"
                        maxLength={200}
                        rows={3}
                        className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ============ Footer (fixed) ============ */}
              <div className="border-t border-border px-6 py-4">
                {step === "gates" && (
                  <Button
                    className="w-full"
                    onClick={() => setStep("details")}
                    disabled={!canAdvanceFromGates}
                  >
                    {canAdvanceFromGates ? "Next" : "Pick at least one achievement"}
                  </Button>
                )}
                {step === "details" && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep("gates")}
                      disabled={isCreating}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-[2]"
                      onClick={handleCreate}
                      disabled={!canSubmit}
                    >
                      {isCreating ? "Creating..." : "Create chat"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ============================================================================
// Chat Card — member-focused redesign (no locked state)
// Shows who is in the chat and how reputable they are, instead of activity.
//   - Chat name (prominent) + "Made by @creator" with real avatar
//   - Row of top 4-5 member avatars (overlapping)
//   - Two clean stats: "Avg REP" + "Total REP"
//   - Achievement requirement pills at the bottom — all cards are clickable,
//     regardless of whether the user has earned the listed proofs.
// ============================================================================

// Deterministic mock avatars seeded from the chat id so the same chat always
// shows the same top-member row (keeps the UI stable between renders).
const TOP_MEMBER_COUNT = 5
function getTopMemberAvatars(chatId: string): string[] {
  let seed = 0
  for (let i = 0; i < chatId.length; i++) seed = (seed + chatId.charCodeAt(i)) % 97
  return Array.from(
    { length: TOP_MEMBER_COUNT },
    (_, i) => getPoolAvatarByIndex(seed + i)
  )
}

// Deterministic avatar for a creator handle — real X avatar when known,
// otherwise hashes into the pool (handled inside getAvatarUrl).
function getCreatorAvatar(handle: string): string {
  return getAvatarUrl(handle)
}

// Simple avg/total REP derived from the chat's size + power, kept stable
// per chat via id-seeded math. Real data would come from the server.
function getChatRepStats(chat: CatalogChat): { avg: number; total: number } {
  // Seed from id so numbers are deterministic
  let seed = 0
  for (let i = 0; i < chat.id.length; i++) seed = (seed + chat.id.charCodeAt(i) * 31) % 1000
  const avg = 500 + (seed % 1800) + (chat.tier === "og" ? 600 : 0)
  const total = avg * chat.members
  return { avg, total }
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

function ChatCard({
  chat,
  isAuthenticated,
}: {
  chat: CatalogChat
  isAuthenticated: boolean
}) {
  const memberAvatars = getTopMemberAvatars(chat.id)
  const { avg, total } = getChatRepStats(chat)

  // Up to 2 requirement pills so the bottom stays compact; the rest collapses
  // into a "+N" chip.
  const visibleReqs = chat.requiredAchievements.slice(0, 2)
  const extraReqs = chat.requiredAchievements.length - visibleReqs.length

  return (
    <Link href={`/chats/${chat.slug}`} className="block group">
      <div className="bg-card border border-border rounded-2xl p-4 hover:border-primary/40 transition-all cursor-pointer h-full flex flex-col">
        {/* Top row: Chat name + creator */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-tight min-w-0">
            {chat.name}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
            <span className="text-[10px] text-muted-foreground">Made by</span>
            <div className="flex items-center gap-1.5">
              <img
                src={getCreatorAvatar(chat.creator.handle) || "/placeholder.svg"}
                alt={`@${chat.creator.handle}`}
                className="h-5 w-5 rounded-full object-cover ring-1 ring-border"
              />
              <span className="text-[11px] font-medium text-foreground">
                @{chat.creator.handle}
              </span>
            </div>
          </div>
        </div>

        {/* Top member avatars row */}
        <div className="flex items-center mb-4">
          <div className="flex -space-x-2">
            {memberAvatars.map((url, i) => (
              <img
                key={i}
                src={url || "/placeholder.svg"}
                alt=""
                className="h-8 w-8 rounded-full object-cover ring-2 ring-card"
                style={{ zIndex: memberAvatars.length - i }}
              />
            ))}
          </div>
          <span className="ml-3 text-xs text-muted-foreground">
            +{formatCompact(Math.max(0, chat.members - TOP_MEMBER_COUNT))} more
          </span>
        </div>

        {/* Two key stats: Avg REP · Total REP */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-xl bg-muted/30 border border-border px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Avg REP
            </p>
            <p className="text-sm font-semibold text-foreground font-mono mt-0.5">
              {avg.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-primary/5 border border-primary/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-primary/80">
              Total REP
            </p>
            <p className="text-sm font-semibold text-primary font-mono mt-0.5">
              {formatCompact(total)}
            </p>
          </div>
        </div>

        {/* Achievement requirement badges */}
        <div className="mt-auto pt-3 border-t border-border flex items-center gap-1.5 flex-wrap">
          {visibleReqs.map((req) => (
            <span
              key={req.id}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                isAuthenticated
                  ? req.earned
                    ? // Earned — green positive
                      "bg-positive/10 border-positive/25 text-positive"
                    : // Missing — yellow warning (same treatment as the
                      // entry-requirements list on the chat detail page)
                      "bg-warning/10 border-warning/25 text-warning"
                  : // Visitor — neutral primary tint
                    "bg-primary/10 border-primary/25 text-primary"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-2.5 w-2.5 flex-shrink-0"
                fill="currentColor"
              >
                <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.1L12 14.8 7.1 17l.9-5.1L4 8l5.6-1.2L12 2z" />
              </svg>
              <span className="truncate max-w-[100px]">{req.name}</span>
            </span>
          ))}
          {extraReqs > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/40 border border-border text-muted-foreground">
              +{extraReqs}
            </span>
          )}
        </div>

      </div>
    </Link>
  )
}

// Mock data for chats catalog (includes BNB)
const mockCatalogChats: CatalogChat[] = [
  {
    id: "1",
    slug: "top-polymarket-traders",
    name: "Top Polymarket Traders 1%",
    description: "Elite prediction market traders with proven track records",
    ecosystem: "polymarket",
    status: "available",
    members: 847,
    chatPower: 24500,
    growth: 12,
    proofStack: { current: 3, required: 3 },
    requiredAchievements: [
      { id: "pm-trader", name: "Polymarket Trader", icon: "chart", earned: true },
      { id: "pm-volume", name: "$10K+ Volume", icon: "dollar", earned: true },
      { id: "pm-accuracy", name: "70%+ Accuracy", icon: "target", earned: true },
    ],
    creator: { handle: "pmwhale", followers: 12400 },
    tier: "og",
  },
  {
    id: "2",
    slug: "hyperliquid-degens",
    name: "HyperLiquid Degens",
    description: "High leverage perp traders on HyperLiquid",
    ecosystem: "hyperliquid",
    status: "available",
    members: 1247,
    chatPower: 31200,
    growth: 28,
    proofStack: { current: 2, required: 2 },
    requiredAchievements: [
      { id: "hl-trader", name: "HL Trader", icon: "zap", earned: true },
      { id: "hl-pnl", name: "Profitable Trader", icon: "trending", earned: true },
    ],
    creator: { handle: "hlking", followers: 8900 },
    tier: "og",
  },
  {
    id: "3",
    slug: "solana-alpha",
    name: "Solana Alpha Hunters",
    description: "Early memecoin and NFT alpha on Solana",
    ecosystem: "solana",
    status: "almost",
    members: 2341,
    chatPower: 18700,
    growth: 45,
    proofStack: { current: 2, required: 3 },
    requiredAchievements: [
      { id: "sol-holder", name: "SOL Holder", icon: "wallet", earned: true },
      { id: "sol-nft", name: "Solana NFT Holder", icon: "image", earned: true },
      { id: "sol-active", name: "30d Active Trader", icon: "activity", earned: false },
    ],
    missingAchievements: ["30d Active Trader"],
    creator: { handle: "solalpha", followers: 23100 },
    tier: "general",
  },
  {
    id: "4",
    slug: "base-builders",
    name: "Base Builders",
    description: "Developers and builders on Base network",
    ecosystem: "base",
    status: "available",
    members: 892,
    chatPower: 15600,
    growth: 18,
    proofStack: { current: 2, required: 2 },
    requiredAchievements: [
      { id: "base-deployer", name: "Contract Deployer", icon: "code", earned: true },
      { id: "base-user", name: "Base User", icon: "user", earned: true },
    ],
    creator: { handle: "basedev", followers: 5600 },
    tier: "og",
  },
  {
    id: "5",
    slug: "eth-whales",
    name: "ETH Whale Watchers",
    description: "Track and discuss large ETH movements",
    ecosystem: "ethereum",
    status: "locked",
    members: 456,
    chatPower: 42100,
    growth: 8,
    proofStack: { current: 1, required: 4 },
    requiredAchievements: [
      { id: "eth-holder", name: "ETH Holder", icon: "wallet", earned: true },
      { id: "eth-whale", name: "10+ ETH", icon: "whale", earned: false },
      { id: "eth-defi", name: "DeFi Power User", icon: "layers", earned: false },
      { id: "eth-og", name: "Pre-2021 User", icon: "clock", earned: false },
    ],
    missingAchievements: ["10+ ETH", "DeFi Power User", "Pre-2021 User"],
    creator: { handle: "ethwhale", followers: 45200 },
    tier: "og",
  },
  {
    id: "6",
    slug: "pm-election-traders",
    name: "Election Traders",
    description: "Political prediction market specialists",
    ecosystem: "polymarket",
    status: "almost",
    members: 1893,
    chatPower: 28900,
    growth: 67,
    proofStack: { current: 2, required: 3 },
    requiredAchievements: [
      { id: "pm-user", name: "Polymarket User", icon: "chart", earned: true },
      { id: "pm-political", name: "Political Bettor", icon: "flag", earned: true },
      { id: "pm-stake", name: "$5K+ Staked", icon: "dollar", earned: false },
    ],
    missingAchievements: ["$5K+ Staked"],
    creator: { handle: "electiontrader", followers: 31400 },
    tier: "behavior",
  },
  {
    id: "7",
    slug: "sol-meme-hunters",
    name: "Solana Meme Hunters",
    description: "Early meme coin alpha and calls",
    ecosystem: "solana",
    status: "locked",
    members: 3421,
    chatPower: 21300,
    growth: 89,
    proofStack: { current: 0, required: 3 },
    requiredAchievements: [
      { id: "sol-tx", name: "100+ Transactions", icon: "activity", earned: false },
      { id: "sol-meme", name: "Meme Coin Trader", icon: "smile", earned: false },
      { id: "sol-profit", name: "10x Winner", icon: "rocket", earned: false },
    ],
    missingAchievements: ["100+ Transactions", "Meme Coin Trader", "10x Winner"],
    creator: { handle: "memehunter", followers: 67800 },
    tier: "behavior",
  },
  {
    id: "8",
    slug: "hl-market-makers",
    name: "HL Market Makers",
    description: "Professional market makers on HyperLiquid",
    ecosystem: "hyperliquid",
    status: "locked",
    members: 127,
    chatPower: 58900,
    growth: 5,
    proofStack: { current: 0, required: 4 },
    requiredAchievements: [
      { id: "hl-mm", name: "Market Maker", icon: "bar-chart", earned: false },
      { id: "hl-vol", name: "$1M+ Volume", icon: "dollar", earned: false },
      { id: "hl-lp", name: "LP Provider", icon: "droplet", earned: false },
      { id: "hl-pro", name: "Pro Account", icon: "badge", earned: false },
    ],
    missingAchievements: ["Market Maker", "$1M+ Volume", "LP Provider", "Pro Account"],
    creator: { handle: "hlmm", followers: 4200 },
    tier: "og",
  },
  {
    id: "9",
    slug: "bnb-chain-elite",
    name: "BNB Chain Elite",
    description: "Top traders and builders on BNB Chain ecosystem",
    ecosystem: "bnb",
    status: "available",
    members: 1567,
    chatPower: 19800,
    growth: 34,
    proofStack: { current: 2, required: 2 },
    requiredAchievements: [
      { id: "bnb-trader", name: "BNB Chain Trader", icon: "zap", earned: true },
      { id: "bnb-defi", name: "BNB DeFi User", icon: "layers", earned: true },
    ],
    creator: { handle: "bnbwhale", followers: 18900 },
    tier: "og",
  },
  {
    id: "10",
    slug: "bnb-defi-masters",
    name: "BNB DeFi Masters",
    description: "Advanced DeFi strategies on BNB Chain",
    ecosystem: "bnb",
    status: "almost",
    members: 892,
    chatPower: 14200,
    growth: 22,
    proofStack: { current: 1, required: 2 },
    requiredAchievements: [
      { id: "bnb-defi", name: "BNB DeFi User", icon: "layers", earned: true },
      { id: "bnb-lp", name: "BNB LP Provider", icon: "droplet", earned: false },
    ],
    missingAchievements: ["BNB LP Provider"],
    creator: { handle: "bnbdefi", followers: 7600 },
    tier: "general",
  },
]

// Visitor Hero Section Component
function VisitorHeroSection({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-card p-8 md:p-12">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative max-w-2xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
          REAL RECOGNIZE REAL
        </h1>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          Find rooms built from receipts. Same wavelength, less randomness. 
          Access isn&apos;t claimed. It&apos;s shown.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="w-full sm:w-auto" onClick={onConnect}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="18" cy="12" r="2" fill="currentColor"/>
            </svg>
            Connect wallet
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Explore rooms
          </Button>
        </div>
      </div>
    </div>
  )
}

// Accordion Section Component
function AccordionSection({ 
  title, 
  subtitle,
  icon,
  iconBg,
  defaultOpen = false,
  children 
}: { 
  title: string
  subtitle: string
  icon: React.ReactNode
  iconBg: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
      >
        <div className={`p-2 rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-border">
          {children}
        </div>
      )}
    </div>
  )
}

// Chat Power Leaderboard
function ChatPowerLeaderboard({ chats }: { chats: CatalogChat[] }) {
  const topChats = useMemo(() => {
    return [...chats]
      .sort((a, b) => b.chatPower - a.chatPower)
      .slice(0, 5)
  }, [chats])

  return (
    <AccordionSection
      title="Chat Power Leaderboard"
      subtitle="Top 5 rooms by aggregate strength"
      icon={<ZapBolt className="h-5 w-5 text-primary" />}
      iconBg="bg-primary/10"
      defaultOpen={false}
    >
      <div className="p-4 space-y-1">
        {topChats.map((chat, index) => (
          <Link key={chat.id} href={`/chats/${chat.slug}`} className="block">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
              <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}</span>
              {index === 0 ? (
                <div className="p-1.5 rounded-lg bg-primary/20">
                  <CrownIcon className="h-4 w-4 text-primary" />
                </div>
              ) : (
                <div className={`p-1.5 rounded-lg bg-muted ${getEcosystemColor(chat.ecosystem)}`}>
                  <EcosystemIcon ecosystem={chat.ecosystem} className="h-4 w-4" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{chat.name}</p>
                <p className="text-xs text-muted-foreground">{chat.ecosystem} | {chat.members} members</p>
              </div>
              <span className="flex items-center gap-1 text-sm font-mono text-primary">
                <ZapBolt className="h-3.5 w-3.5" />
                {chat.chatPower.toLocaleString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
      {/* Chat Power Formula */}
      <div className="mx-4 mb-4 p-3 rounded-xl bg-muted/30 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <Sparkle className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-foreground">Chat Power Formula</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Member REP</span><span className="text-foreground">40%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Signal</span><span className="text-foreground">25%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Activity</span><span className="text-foreground">20%</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Cross-Rep</span><span className="text-foreground">15%</span></div>
        </div>
      </div>
    </AccordionSection>
  )
}

// Top Creators Leaderboard
function TopCreatorsLeaderboard({ chats }: { chats: CatalogChat[] }) {
  // Group by creator and count rooms
  const topCreators = useMemo(() => {
    const creatorMap = new Map<string, { handle: string; rooms: number; power: number }>()
    chats.forEach(chat => {
      const existing = creatorMap.get(chat.creator.handle)
      if (existing) {
        existing.rooms += 1
        existing.power += chat.chatPower
      } else {
        creatorMap.set(chat.creator.handle, {
          handle: chat.creator.handle,
          rooms: 1,
          power: chat.chatPower
        })
      }
    })
    return Array.from(creatorMap.values())
      .sort((a, b) => b.power - a.power)
      .slice(0, 4)
  }, [chats])

  return (
    <AccordionSection
      title="Top Creators"
      subtitle="Builders with cross-ecosystem influence"
      icon={<Trophy className="h-5 w-5 text-cyan-400" />}
      iconBg="bg-cyan-400/10"
      defaultOpen={false}
    >
      <div className="p-4 space-y-1">
        {topCreators.map((creator, index) => (
          <div key={creator.handle} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
            <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}</span>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground uppercase">
              {creator.handle[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">@{creator.handle}</p>
              <p className="text-xs text-muted-foreground">{creator.rooms} room{creator.rooms > 1 ? "s" : ""}</p>
            </div>
            <span className="flex items-center gap-1 text-sm font-mono text-primary">
              <Sparkle className="h-3.5 w-3.5" />
              {creator.power.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </AccordionSection>
  )
}

// Top Achievements Leaderboard
function TopAchievementsLeaderboard() {
  const topAchievements = [
    { name: "Poly Oracle", description: "Correctly predicted 10+ major outcomes", tier: "diamond", xp: 400 },
    { name: "Diamond PnL", description: "Profitable for 90+ consecutive days", tier: "diamond", xp: 350 },
    { name: "Liquid Hands", description: "Top 5% Hyperliquid traders by 90d volume", tier: "gold", xp: 180 },
    { name: "Macro Sage", description: "Called 3+ macro events before mainstream", tier: "gold", xp: 220 },
  ]

  const getTierStyle = (tier: string) => {
    switch (tier) {
      case "diamond": return "bg-cyan-400/20 text-cyan-400 border-cyan-400/30"
      case "gold": return "bg-amber-400/20 text-amber-400 border-amber-400/30"
      case "silver": return "bg-slate-400/20 text-slate-400 border-slate-400/30"
      default: return "bg-orange-400/20 text-orange-400 border-orange-400/30"
    }
  }

  return (
    <AccordionSection
      title="Top Achievements"
      subtitle="Most valued credentials across rooms"
      icon={<MedalIcon className="h-5 w-5 text-amber-400" />}
      iconBg="bg-amber-400/10"
      defaultOpen={false}
    >
      <div className="p-4 space-y-1">
        {topAchievements.map((ach, index) => (
          <div key={ach.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="p-2 rounded-xl bg-muted">
              <MedalIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{ach.name}</p>
              <p className="text-xs text-muted-foreground truncate">{ach.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getTierStyle(ach.tier)}`}>
                {ach.tier}
              </span>
              <span className="text-xs text-muted-foreground">+{ach.xp}</span>
            </div>
          </div>
        ))}
      </div>
    </AccordionSection>
  )
}

// Sidebar with all accordion sections
function ChatsSidebar({ chats }: { chats: CatalogChat[] }) {
  return (
    <div className="space-y-4">
      <ChatPowerLeaderboard chats={chats} />
      <TopCreatorsLeaderboard chats={chats} />
      <TopAchievementsLeaderboard />
    </div>
  )
}

// Main Chats Catalog Page
export default function ChatsPage() {
  const { isAuthenticated, user, login } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeEcosystem, setActiveEcosystem] = useState<Ecosystem>("all")
  const [activeTab, setActiveTab] = useState<"available" | "almost" | "all">("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userCreatedChats, setUserCreatedChats] = useState<CatalogChat[]>([])

  const handleChatCreated = (newChat: CatalogChat) => {
    setUserCreatedChats(prev => [newChat, ...prev])
  }

  // Filter chats
  const filteredChats = useMemo(() => {
    let result = [...mockCatalogChats, ...userCreatedChats]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        chat => 
          chat.name.toLowerCase().includes(query) ||
          chat.description.toLowerCase().includes(query) ||
          chat.creator.handle.toLowerCase().includes(query)
      )
    }

    if (activeEcosystem !== "all") {
      result = result.filter(chat => chat.ecosystem === activeEcosystem)
    }

    if (isAuthenticated && activeTab !== "all") {
      result = result.filter(chat => chat.status === activeTab)
    }

    return result
  }, [searchQuery, activeEcosystem, activeTab, isAuthenticated, userCreatedChats])

  const availableChats = filteredChats.filter(c => c.status === "available")
  const almostUnlockedChats = filteredChats.filter(c => c.status === "almost")
  const lockedChats = filteredChats.filter(c => c.status === "locked")

  // Trending chats
  const trendingChats = useMemo(() => {
    return [...mockCatalogChats]
      .sort((a, b) => (b.chatPower * (1 + b.growth/100)) - (a.chatPower * (1 + a.growth/100)))
      .slice(0, 3)
  }, [])

  const totalChats = mockCatalogChats.length
  const accessibleChats = mockCatalogChats.filter(c => c.status === "available").length

  const ecosystems: { id: Ecosystem; label: string }[] = [
    { id: "all", label: "All" },
    { id: "polymarket", label: "Polymarket" },
    { id: "hyperliquid", label: "HyperLiquid" },
    { id: "ethereum", label: "Ethereum" },
    { id: "base", label: "Base" },
    { id: "solana", label: "Solana" },
    { id: "bnb", label: "BNB" },
  ]

  return (
    <PageShell
      kicker="Verified community"
      title={
        <>
          Where REP becomes <em>access</em>.
        </>
      }
      subtitle={
        <>
          REP-gated rooms — cohorts by real-life status, not vibes.{" "}
          <Num>{accessibleChats}</Num> of <Num>{totalChats}</Num> open to you.
        </>
      }
      action={
        isAuthenticated && user ? (
          <Pill variant="accent" onClick={() => setShowCreateModal(true)}>
            Create chat
          </Pill>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {/* Visitor hero only when guest */}
        {!isAuthenticated && <VisitorHeroSection onConnect={login} />}

      {/* Search with Cmd+K hint */}
      <div className="relative">
        <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
        </svg>
        <Input
          type="text"
          placeholder="Search 'top 1%'..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Cmd</kbd>
          <span>K</span>
        </div>
      </div>

      {/* Ecosystem Filter with icons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {ecosystems.map((eco) => (
          <button
            key={eco.id}
            onClick={() => setActiveEcosystem(eco.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              activeEcosystem === eco.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {eco.id !== "all" && <EcosystemIcon ecosystem={eco.id} className="h-3.5 w-3.5" />}
            {eco.label}
          </button>
        ))}
      </div>

      {/* Tabs for authenticated users */}
      {isAuthenticated && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="all">
              All ({filteredChats.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Available ({availableChats.length})
            </TabsTrigger>
            <TabsTrigger value="almost">
              Almost ({almostUnlockedChats.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Category Sections for visitors */}
      {!isAuthenticated && activeEcosystem === "all" && (
        <>
          {/* Trending by signal */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-bold text-foreground">Trending by signal</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Rooms ranked by quality density and conversation energy
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingChats.map((chat) => (
                <ChatCard key={chat.id} chat={chat} isAuthenticated={isAuthenticated} />
              ))}
            </div>
          </section>

          {/* Global Prestige */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-bold text-foreground">Global Prestige</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Top 1% operators across ecosystems
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockCatalogChats
                .filter(c => c.tier === "og")
                .slice(0, 3)
                .map((chat) => (
                  <ChatCard key={chat.id} chat={chat} isAuthenticated={isAuthenticated} />
                ))}
            </div>
          </section>

          {/* Polymarket Elite */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <EcosystemIcon ecosystem="polymarket" className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-bold text-foreground">Polymarket Elite</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Top prediction market traders
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockCatalogChats
                .filter(c => c.ecosystem === "polymarket")
                .slice(0, 2)
                .map((chat) => (
                  <ChatCard key={chat.id} chat={chat} isAuthenticated={isAuthenticated} />
                ))}
            </div>
          </section>
        </>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Chat Grid - full width */}
        <div>
          {filteredChats.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <svg viewBox="0 0 24 24" className="h-12 w-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
              </svg>
              <p className="text-foreground font-medium">No rooms found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : isAuthenticated && activeTab === "all" ? (
            <div className="space-y-8">
              {availableChats.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckIcon className="h-5 w-5 text-positive" />
                    <h2 className="text-lg font-semibold text-foreground">Available to you</h2>
                    <span className="text-sm text-muted-foreground">({availableChats.length})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableChats.map((chat) => (
                      <ChatCard key={chat.id} chat={chat} isAuthenticated={isAuthenticated} />
                    ))}
                  </div>
                </section>
              )}

              {almostUnlockedChats.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkle className="h-5 w-5 text-warning" />
                    <h2 className="text-lg font-semibold text-foreground">Almost unlocked</h2>
                    <span className="text-sm text-muted-foreground">({almostUnlockedChats.length})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {almostUnlockedChats.map((chat) => (
                      <ChatCard key={chat.id} chat={chat} isAuthenticated={isAuthenticated} />
                    ))}
                  </div>
                </section>
              )}

              {lockedChats.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" fillOpacity="0.1"/>
                      <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round"/>
                    </svg>
                    <h2 className="text-lg font-semibold text-foreground">Explore more</h2>
                    <span className="text-sm text-muted-foreground">({lockedChats.length})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lockedChats.map((chat) => (
                      <ChatCard key={chat.id} chat={chat} isAuthenticated={isAuthenticated} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredChats.map((chat) => (
                <ChatCard key={chat.id} chat={chat} isAuthenticated={isAuthenticated} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboards Section - Moved to bottom */}
      <div className="mt-8 pt-8 border-t border-border/50">
        <ChatsSidebar chats={mockCatalogChats} />
      </div>

      {/* Create Chat Modal */}
      {showCreateModal && (
        <CreateChatModal 
          onClose={() => setShowCreateModal(false)} 
          onChatCreated={handleChatCreated}
        />
      )}
      </div>
    </PageShell>
  )
}
