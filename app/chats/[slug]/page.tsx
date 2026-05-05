"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRight, X, Sparkles, Lock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getAvatarUrl } from "@/lib/avatars"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  EcosystemIcon,
  UsersGroup,
  ZapBolt,
  AwardStar,
  Sparkle,
  Check as CheckIcon,
} from "@/components/icons"

// ============================================================================
// TYPES
// ============================================================================

type QualificationStatus = "qualified" | "almost" | "locked"

interface ChatMember {
  id: string
  handle: string
  displayName: string
  avatarUrl?: string
  rep: number
  // The single badge we surface under each member (their highest-value achievement)
  topAchievement: { name: string; icon: string }
}

interface RequiredAchievement {
  id: string
  name: string
  description: string
  /** What it takes to earn this (e.g. "$10k+ volume on Polymarket") */
  requirement: string
  icon: string
  earned: boolean
}

interface RelatedChat {
  id: string
  slug: string
  name: string
  members: number
  ecosystem: string
}

interface ChatDetail {
  id: string
  slug: string
  name: string
  description: string
  ecosystem: string
  telegramLink: string

  requiredAchievements: RequiredAchievement[]
  qualificationStatus: QualificationStatus

  members: number
  /** Median REP of participants — the single clean reputation stat. */
  medianRep: number
  /** Aggregate REP across all participants — optional, shown alongside median. */
  totalRep: number

  creator: {
    handle: string
    displayName: string
    avatarUrl?: string
    followers: number
  }

  topMembers: ChatMember[]
  relatedChats: RelatedChat[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockChatDetail: ChatDetail = {
  id: "1",
  slug: "top-polymarket-traders",
  name: "Top Polymarket Traders 1%",
  description:
    "The most elite prediction market traders with proven track records. Access exclusive alpha, market analysis, and real-time trading signals.",
  ecosystem: "polymarket",
  telegramLink: "https://t.me/+abc123",

  requiredAchievements: [
    {
      id: "pm-trader",
      name: "Polymarket Trader",
      description: "Made at least 10 trades on Polymarket",
      requirement: "Made 10+ trades on Polymarket",
      icon: "chart",
      earned: true,
    },
    {
      id: "pm-volume",
      name: "$10K+ Volume",
      description: "Traded over $10,000 lifetime volume",
      requirement: "Top Trader on Polymarket — need $10k+ volume",
      icon: "dollar",
      earned: true,
    },
    {
      id: "pm-accuracy",
      name: "70%+ Accuracy",
      description: "Win rate of 70% or higher",
      requirement: "Win rate of 70%+ on settled markets",
      icon: "target",
      earned: true,
    },
  ],
  qualificationStatus: "qualified",

  members: 847,
  medianRep: 1420,
  totalRep: 1_204_740,

  creator: {
    handle: "pmwhale",
    displayName: "PM Whale",
    avatarUrl: getAvatarUrl("pmwhale"),
    followers: 12400,
  },

  topMembers: [
    {
      id: "1",
      handle: "traderpro",
      displayName: "TraderPro",
      avatarUrl: getAvatarUrl("traderpro"),
      rep: 4500,
      topAchievement: { name: "Top Trader", icon: "trending" },
    },
    {
      id: "2",
      handle: "alphamaster",
      displayName: "Alpha Master",
      avatarUrl: getAvatarUrl("alphamaster"),
      rep: 3800,
      topAchievement: { name: "Alpha Caller", icon: "star" },
    },
    {
      id: "3",
      handle: "predictionking",
      displayName: "Prediction King",
      avatarUrl: getAvatarUrl("predictionking"),
      rep: 3200,
      topAchievement: { name: "Oracle", icon: "compass" },
    },
    {
      id: "4",
      handle: "marketmaven",
      displayName: "Market Maven",
      avatarUrl: getAvatarUrl("marketmaven"),
      rep: 2900,
      topAchievement: { name: "Macro Sage", icon: "layers" },
    },
    {
      id: "5",
      handle: "oddshunter",
      displayName: "Odds Hunter",
      avatarUrl: getAvatarUrl("oddshunter"),
      rep: 2700,
      topAchievement: { name: "Sharp", icon: "target" },
    },
  ],

  relatedChats: [
    { id: "2", slug: "pm-election-traders", name: "Election Traders", members: 1893, ecosystem: "polymarket" },
    { id: "3", slug: "crypto-predictions", name: "Crypto Predictions", members: 2341, ecosystem: "polymarket" },
    { id: "4", slug: "sports-bettors", name: "Sports Bettors Elite", members: 567, ecosystem: "polymarket" },
  ],
}

// ============================================================================
// HELPERS
// ============================================================================

function getEcosystemColor(ecosystem: string) {
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

// ============================================================================
// LOCKED STATE OVERLAY
// Shown on top of the chat detail body when the user doesn't qualify.
// Lists the missing achievements with what each requires (no direct link).
// ============================================================================

function LockedOverlay({
  requiredAchievements,
}: {
  requiredAchievements: RequiredAchievement[]
}) {
  const missing = requiredAchievements.filter((a) => !a.earned)
  const earned = requiredAchievements.filter((a) => a.earned)
  const total = requiredAchievements.length

  return (
    <div className="relative rounded-2xl border-2 border-primary/40 bg-card p-6 md:p-8 shadow-[0_0_40px_var(--accent-glow)]">
      <div className="flex items-start gap-4 mb-5">
        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            You need these achievements to join:
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Earn the missing proofs to unlock this room.
          </p>
        </div>
      </div>

      {/* Progress indicator — "You have X of Y required achievements" */}
      <div className="mb-5 p-3 rounded-xl bg-muted/30 border border-border">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            You have <span className="font-semibold text-foreground">{earned.length} of {total}</span> required achievements
          </span>
          <span className="font-mono text-xs text-primary">
            {Math.round((earned.length / total) * 100)}%
          </span>
        </div>
        <Progress value={(earned.length / total) * 100} className="h-1.5" />
      </div>

      {/* Missing achievements list with what each requires */}
      <div className="space-y-2.5">
        {missing.map((ach) => (
          <div
            key={ach.id}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/40 border border-border"
          >
            <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-warning/15 border border-warning/30 flex items-center justify-center">
              <AwardStar className="h-4 w-4 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{ach.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ach.requirement}
              </p>
            </div>
          </div>
        ))}

        {/* Already-earned ones get a quiet checked row for reassurance */}
        {earned.map((ach) => (
          <div
            key={ach.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-positive/5 border border-positive/20 opacity-80"
          >
            <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-positive/15 border border-positive/30 flex items-center justify-center">
              <CheckIcon className="h-4 w-4 text-positive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{ach.name}</p>
              <p className="text-xs text-muted-foreground">Earned</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// CHAT DETAIL PAGE
// ============================================================================

export default function ChatDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { isAuthenticated, login, chatTutorialDismissed, dismissChatTutorial } = useAuth()
  const searchParams = useSearchParams()
  const cameFromOnboarding = searchParams.get("welcome") === "1"

  // Show the "back to profile" tutorial banner when the user just arrived from
  // the chats-unlocked celebration on the profile page, and hasn't dismissed
  // the tutorial globally yet.
  const [showTutorialBanner, setShowTutorialBanner] = useState(false)
  useEffect(() => {
    if (cameFromOnboarding && !chatTutorialDismissed) {
      setShowTutorialBanner(true)
    }
  }, [cameFromOnboarding, chatTutorialDismissed])

  const handleDismissTutorial = () => {
    setShowTutorialBanner(false)
    dismissChatTutorial()
  }

  const chat = mockChatDetail
  const ecosystemColor = getEcosystemColor(chat.ecosystem)
  const isVisitor = !isAuthenticated

  // For demo purposes, allow toggling locked state via URL (?locked=1)
  const forceLocked = searchParams.get("locked") === "1"
  const isLocked = forceLocked || chat.qualificationStatus === "locked"

  const handleShare = () => {
    const url = `https://rep.xyz/chats/${chat.slug}`
    const text = encodeURIComponent(
      `Check out "${chat.name}" on @R3P — ${chat.members} members, median REP ${chat.medianRep.toLocaleString()}.\n\n${url}`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank")
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Onboarding tutorial banner — shown once after joining a chat from
          the "chats unlocked" celebration. */}
      {showTutorialBanner && (
        <div
          role="status"
          className="relative rounded-2xl border border-primary/40 bg-primary/10 p-4 md:p-5 shadow-[0_0_24px_var(--accent-glow)] animate-in fade-in slide-in-from-top-2 duration-500"
        >
          <button
            onClick={handleDismissTutorial}
            className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3 pr-8">
            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Welcome to your first chat
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                You&apos;re in. Head back to your profile to finish setup and unlock more rooms.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Link href="/profile">
                  <Button size="sm" className="gap-1.5">
                    Back to profile
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismissTutorial}
                  className="text-muted-foreground"
                >
                  Stay here
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back to discovery */}
      <Link
        href="/chats"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to discovery
      </Link>

      {/* =================================================================
          HEADER — mirrors the external chat card's structure so the
          summary info reads the same way from discovery → detail:
            • ecosystem + tier badges
            • title with inline "Made by @creator" (avatar + handle)
            • description
            • Members / Avg REP / Total REP trio
            • CTA row
          ================================================================= */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted border border-border ${ecosystemColor}`}
          >
            <EcosystemIcon ecosystem={chat.ecosystem} className="h-4 w-4" />
            <span className="capitalize">{chat.ecosystem}</span>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Top 1%
          </Badge>
        </div>

        {/* Title + "Made by @creator" inline — same pattern as the card.
            Wraps under the title on small screens so long titles stay
            readable. */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance min-w-0">
            {chat.name}
          </h1>
          <div className="flex items-center gap-2 flex-shrink-0 pt-1">
            <span className="text-xs text-muted-foreground">Made by</span>
            <Avatar className="h-6 w-6 ring-1 ring-border">
              {chat.creator.avatarUrl && (
                <AvatarImage src={chat.creator.avatarUrl} alt={chat.creator.handle} />
              )}
              <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-semibold">
                {chat.creator.handle.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">
              @{chat.creator.handle}
            </span>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed mb-6">{chat.description}</p>

        {/* Members + Avg REP + Total REP — same trio as the card, so the
            summary numbers stay consistent between views. */}
        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <UsersGroup className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-sm font-semibold text-foreground">
                {chat.members.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ZapBolt className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Avg REP</p>
              <p className="text-sm font-semibold text-primary">
                {chat.medianRep.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkle className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total REP</p>
              <p className="text-sm font-semibold text-foreground">
                {chat.totalRep.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* CTA row */}
        <div className="flex flex-wrap items-center gap-3">
          {isVisitor ? (
            <Button onClick={login} className="flex-1 sm:flex-initial">
              Connect to verify
            </Button>
          ) : isLocked ? (
            <Button variant="outline" className="flex-1 sm:flex-initial" disabled>
              <Lock className="h-4 w-4 mr-2" />
              Earn achievements to join
            </Button>
          ) : (
            <Button asChild className="flex-1 sm:flex-initial">
              <a href={chat.telegramLink} target="_blank" rel="noopener noreferrer">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Join on Telegram
              </a>
            </Button>
          )}
          <Button variant="outline" onClick={handleShare}>
            Share room
          </Button>
        </div>
      </div>

      {/* =================================================================
          LOCKED STATE — replaces body content when user doesn't qualify.
          (The creator block that used to live here has been folded into
          the page header to match the "Made by" layout of the chat card.)
          ================================================================= */}
      {isLocked ? (
        <LockedOverlay requiredAchievements={chat.requiredAchievements} />
      ) : (
        <>
          {/* ====== Who's here — top 5 members with handle + top achievement ====== */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <UsersGroup className="h-5 w-5 text-primary" />
              Who&apos;s here
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {chat.topMembers.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors"
                >
                  <Avatar className="h-12 w-12 mb-2 ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
                    {member.avatarUrl && (
                      <AvatarImage src={member.avatarUrl} alt={member.handle} />
                    )}
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {member.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium text-foreground truncate w-full">
                    @{member.handle}
                  </p>
                  <p className="text-xs text-primary font-mono mt-0.5">
                    {member.rep.toLocaleString()} REP
                  </p>
                  {/* Top achievement badge */}
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary">
                    <AwardStar className="h-2.5 w-2.5" />
                    <span className="truncate max-w-[100px]">{member.topAchievement.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ====== Chat achievement requirements — what's needed to join ====== */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <AwardStar className="h-5 w-5 text-primary" />
              Entry requirements
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              All of the following (AND logic):
            </p>
            <div className="space-y-2.5">
              {chat.requiredAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                    ach.earned
                      ? "bg-positive/5 border-positive/20"
                      : "bg-warning/5 border-warning/20"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${
                      ach.earned
                        ? "bg-positive/15 border border-positive/30 text-positive"
                        : "bg-warning/15 border border-warning/30 text-warning"
                    }`}
                  >
                    {ach.earned ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <AwardStar className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{ach.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ach.requirement}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* =================================================================
          RELATED ROOMS — simple, names and member counts
          ================================================================= */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Related rooms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {chat.relatedChats.map((related) => (
            <Link key={related.id} href={`/chats/${related.slug}`} className="group">
              <div className="p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors h-full">
                <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {related.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {related.members.toLocaleString()} members
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
