"use client"

import { useMemo, useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Network,
  Activity,
  Trophy,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getAvatarUrl } from "@/lib/avatars"
import { PageShell } from "@/components/ui/page-shell"

// ============================================================================
// LEADERBOARD — Total / Social Graph / Activity
// Tabs:
//   • "Total"        — Overall REP combining all scores (default)
//   • "Social Graph" — Ranked by social graph strength
//   • "Activity"     — Sub-pills: Onchain / Social
// Layout:
//   - Shows 20 top entries in one clean table
//   - If the signed-in user isn't in the top 20, an "…" divider + their
//     row (with true rank like #217) is rendered *inline* at the bottom
//     of the same table — no separate sticky card, no "View full
//     leaderboard" button
// ============================================================================

type MainTab = "total" | "social-graph" | "activity"
type ActivitySubTab = "onchain" | "social"

// Rank badge + ring images (users still want to see tier visually)
const rankBadges: Record<string, string> = {
  "ꙮ": "/images/ranks/crown.png",
  "yo": "/images/ranks/base.png",
  "ToT": "/images/ranks/star.jpg",
  "roko": "/images/ranks/star.jpg",
  "droog": "/images/ranks/star.jpg",
  "cicada": "/images/ranks/star.jpg",
  "pilgrim": "/images/ranks/star.jpg",
}

const rankRingColors: Record<string, string> = {
  "ꙮ": "ring-amber-400",
  "yo": "ring-primary",
  "ToT": "ring-emerald-400",
  "roko": "ring-purple-400",
  "droog": "ring-sky-400",
  "cicada": "ring-muted-foreground",
  "pilgrim": "ring-muted-foreground",
}

interface LeaderboardUser {
  handle: string
  displayName: string
  avatarUrl?: string
  rankTier: "ꙮ" | "yo" | "ToT" | "roko" | "droog" | "cicada" | "pilgrim"
  // Score by category
  totalRep: number
  socialGraphScore: number
  onchainScore: number
  socialScore: number
  // Trend per category
  trends: {
    total: { dir: "up" | "down" | "stable"; amount?: number }
    socialGraph: { dir: "up" | "down" | "stable"; amount?: number }
    onchain: { dir: "up" | "down" | "stable"; amount?: number }
    social: { dir: "up" | "down" | "stable"; amount?: number }
  }
  // Highlight stats per tab — the "why REP matters" context
  graphPnl: number       // Social Graph tab
  onchainPnl: number     // Activity Onchain tab
  smartFollowers: number // Activity Social tab
  /** Optional real rank override for users who sit far down the table but
   *  we still want to show near the top/bottom (e.g., the signed-in user). */
  fixedRank?: number
  /** If true, this row represents the current user and will be rendered
   *  inline after an ellipsis divider when they're not in the visible top. */
  isCurrentUser?: boolean
}

const getRankTier = (rank: number): LeaderboardUser["rankTier"] => {
  if (rank <= 3) return "ꙮ"
  if (rank <= 10) return "yo"
  if (rank <= 25) return "ToT"
  if (rank <= 75) return "roko"
  if (rank <= 150) return "droog"
  if (rank <= 300) return "cicada"
  return "pilgrim"
}

// Mock data — 20 top users plus the current user anchored at rank #217
const mockUsers: LeaderboardUser[] = [
  { handle: "vitalik", displayName: "Vitalik", avatarUrl: getAvatarUrl("vitalik"), rankTier: "ꙮ",
    totalRep: 15847, socialGraphScore: 14200, onchainScore: 12500, socialScore: 15500,
    graphPnl: 245000, onchainPnl: 892000, smartFollowers: 1847,
    trends: { total: { dir: "stable" }, socialGraph: { dir: "up", amount: 1 }, onchain: { dir: "stable" }, social: { dir: "stable" } } },
  { handle: "cobie", displayName: "Cobie", avatarUrl: getAvatarUrl("cobie"), rankTier: "ꙮ",
    totalRep: 14203, socialGraphScore: 13800, onchainScore: 8900, socialScore: 14800,
    graphPnl: 187000, onchainPnl: 534000, smartFollowers: 1623,
    trends: { total: { dir: "up", amount: 2 }, socialGraph: { dir: "up", amount: 3 }, onchain: { dir: "up", amount: 1 }, social: { dir: "up", amount: 5 } } },
  { handle: "punk6529", displayName: "punk6529", avatarUrl: getAvatarUrl("punk6529"), rankTier: "ꙮ",
    totalRep: 13876, socialGraphScore: 12900, onchainScore: 13200, socialScore: 13100,
    graphPnl: 156000, onchainPnl: 1240000, smartFollowers: 1489,
    trends: { total: { dir: "down", amount: 1 }, socialGraph: { dir: "down", amount: 2 }, onchain: { dir: "stable" }, social: { dir: "down", amount: 1 } } },
  { handle: "hsaka", displayName: "Hsaka", avatarUrl: getAvatarUrl("hsaka"), rankTier: "yo",
    totalRep: 12541, socialGraphScore: 10200, onchainScore: 11800, socialScore: 11700,
    graphPnl: 98000, onchainPnl: 467000, smartFollowers: 987,
    trends: { total: { dir: "up", amount: 5 }, socialGraph: { dir: "up", amount: 4 }, onchain: { dir: "up", amount: 6 }, social: { dir: "up", amount: 3 } } },
  { handle: "degenwhale", displayName: "Degen Whale", avatarUrl: getAvatarUrl("degenwhale"), rankTier: "yo",
    totalRep: 11247, socialGraphScore: 9400, onchainScore: 12100, socialScore: 8900,
    graphPnl: 67000, onchainPnl: 1890000, smartFollowers: 654,
    trends: { total: { dir: "up", amount: 3 }, socialGraph: { dir: "stable" }, onchain: { dir: "up", amount: 8 }, social: { dir: "down", amount: 1 } } },
  { handle: "cryptonative", displayName: "Crypto Native", avatarUrl: getAvatarUrl("cryptonative"), rankTier: "yo",
    totalRep: 10890, socialGraphScore: 11300, onchainScore: 7800, socialScore: 10400,
    graphPnl: 134000, onchainPnl: 234000, smartFollowers: 876,
    trends: { total: { dir: "stable" }, socialGraph: { dir: "up", amount: 2 }, onchain: { dir: "down", amount: 3 }, social: { dir: "stable" } } },
  { handle: "defichad", displayName: "DeFi Chad", avatarUrl: getAvatarUrl("defichad"), rankTier: "yo",
    totalRep: 9654, socialGraphScore: 7100, onchainScore: 11400, socialScore: 7900,
    graphPnl: 45000, onchainPnl: 678000, smartFollowers: 543,
    trends: { total: { dir: "down", amount: 2 }, socialGraph: { dir: "down", amount: 1 }, onchain: { dir: "up", amount: 4 }, social: { dir: "down", amount: 3 } } },
  { handle: "nftmaxi", displayName: "NFT Maxi", avatarUrl: getAvatarUrl("nftmaxi"), rankTier: "yo",
    totalRep: 8432, socialGraphScore: 8800, onchainScore: 6900, socialScore: 9800,
    graphPnl: 89000, onchainPnl: 123000, smartFollowers: 765,
    trends: { total: { dir: "up", amount: 8 }, socialGraph: { dir: "up", amount: 6 }, onchain: { dir: "up", amount: 2 }, social: { dir: "up", amount: 12 } } },
  { handle: "tradoor_pro", displayName: "Tradoor Pro", avatarUrl: getAvatarUrl("tradoor_pro"), rankTier: "yo",
    totalRep: 7891, socialGraphScore: 6500, onchainScore: 9200, socialScore: 6400,
    graphPnl: 34000, onchainPnl: 456000, smartFollowers: 432,
    trends: { total: { dir: "stable" }, socialGraph: { dir: "down", amount: 1 }, onchain: { dir: "up", amount: 3 }, social: { dir: "stable" } } },
  { handle: "airdrop_hunter", displayName: "Airdrop Hunter", avatarUrl: getAvatarUrl("airdrop_hunter"), rankTier: "yo",
    totalRep: 6543, socialGraphScore: 5400, onchainScore: 8100, socialScore: 5200,
    graphPnl: 23000, onchainPnl: 345000, smartFollowers: 321,
    trends: { total: { dir: "up", amount: 12 }, socialGraph: { dir: "up", amount: 5 }, onchain: { dir: "up", amount: 15 }, social: { dir: "up", amount: 4 } } },
  { handle: "0xsomething", displayName: "0xSomething", avatarUrl: getAvatarUrl("0xsomething"), rankTier: "ToT",
    totalRep: 5987, socialGraphScore: 6100, onchainScore: 5400, socialScore: 5900,
    graphPnl: 56000, onchainPnl: 189000, smartFollowers: 456,
    trends: { total: { dir: "down", amount: 3 }, socialGraph: { dir: "up", amount: 2 }, onchain: { dir: "down", amount: 4 }, social: { dir: "up", amount: 1 } } },
  { handle: "zora_fan", displayName: "Zora Fan", avatarUrl: getAvatarUrl("zora_fan"), rankTier: "ToT",
    totalRep: 5421, socialGraphScore: 5900, onchainScore: 4100, socialScore: 6200,
    graphPnl: 67000, onchainPnl: 78000, smartFollowers: 534,
    trends: { total: { dir: "up", amount: 9 }, socialGraph: { dir: "up", amount: 7 }, onchain: { dir: "up", amount: 1 }, social: { dir: "up", amount: 11 } } },
  { handle: "farcaster_og", displayName: "Farcaster OG", avatarUrl: getAvatarUrl("farcaster_og"), rankTier: "ToT",
    totalRep: 4987, socialGraphScore: 5300, onchainScore: 3200, socialScore: 5800,
    graphPnl: 45000, onchainPnl: 56000, smartFollowers: 489,
    trends: { total: { dir: "stable" }, socialGraph: { dir: "up", amount: 3 }, onchain: { dir: "stable" }, social: { dir: "up", amount: 2 } } },
  { handle: "sol_dev", displayName: "Sol Dev", avatarUrl: getAvatarUrl("sol_dev"), rankTier: "ToT",
    totalRep: 4532, socialGraphScore: 3900, onchainScore: 5200, socialScore: 3800,
    graphPnl: 23000, onchainPnl: 234000, smartFollowers: 287,
    trends: { total: { dir: "up", amount: 4 }, socialGraph: { dir: "stable" }, onchain: { dir: "up", amount: 7 }, social: { dir: "stable" } } },
  { handle: "nade", displayName: "nade", avatarUrl: getAvatarUrl("nade"), rankTier: "ToT",
    totalRep: 4198, socialGraphScore: 4500, onchainScore: 3400, socialScore: 4600,
    graphPnl: 34000, onchainPnl: 67000, smartFollowers: 367,
    trends: { total: { dir: "up", amount: 2 }, socialGraph: { dir: "up", amount: 1 }, onchain: { dir: "down", amount: 2 }, social: { dir: "up", amount: 3 } } },
  { handle: "base_builder", displayName: "Base Builder", avatarUrl: getAvatarUrl("base_builder"), rankTier: "ToT",
    totalRep: 3876, socialGraphScore: 3300, onchainScore: 4200, socialScore: 3100,
    graphPnl: 18000, onchainPnl: 145000, smartFollowers: 234,
    trends: { total: { dir: "up", amount: 18 }, socialGraph: { dir: "up", amount: 12 }, onchain: { dir: "up", amount: 22 }, social: { dir: "up", amount: 8 } } },
  { handle: "memecoin_king", displayName: "Memecoin King", avatarUrl: getAvatarUrl("memecoin_king"), rankTier: "ToT",
    totalRep: 3542, socialGraphScore: 2800, onchainScore: 4500, socialScore: 2900,
    graphPnl: 12000, onchainPnl: 289000, smartFollowers: 198,
    trends: { total: { dir: "down", amount: 5 }, socialGraph: { dir: "down", amount: 3 }, onchain: { dir: "up", amount: 2 }, social: { dir: "down", amount: 6 } } },
  { handle: "yield_farmer", displayName: "Yield Farmer", avatarUrl: getAvatarUrl("yield_farmer"), rankTier: "ToT",
    totalRep: 3287, socialGraphScore: 2600, onchainScore: 4100, socialScore: 2500,
    graphPnl: 9000, onchainPnl: 178000, smartFollowers: 167,
    trends: { total: { dir: "stable" }, socialGraph: { dir: "down", amount: 1 }, onchain: { dir: "up", amount: 4 }, social: { dir: "stable" } } },
  { handle: "eth_denver", displayName: "ETH Denver", avatarUrl: getAvatarUrl("eth_denver"), rankTier: "ToT",
    totalRep: 3024, socialGraphScore: 3200, onchainScore: 2400, socialScore: 3400,
    graphPnl: 15000, onchainPnl: 34000, smartFollowers: 256,
    trends: { total: { dir: "up", amount: 1 }, socialGraph: { dir: "up", amount: 4 }, onchain: { dir: "stable" }, social: { dir: "up", amount: 2 } } },
  { handle: "onchain_pepe", displayName: "Onchain Pepe", avatarUrl: getAvatarUrl("onchain_pepe"), rankTier: "ToT",
    totalRep: 2798, socialGraphScore: 2100, onchainScore: 3500, socialScore: 2200,
    graphPnl: 8000, onchainPnl: 123000, smartFollowers: 145,
    trends: { total: { dir: "up", amount: 6 }, socialGraph: { dir: "up", amount: 2 }, onchain: { dir: "up", amount: 9 }, social: { dir: "up", amount: 3 } } },

  // Current user — the user has a strong social graph (near the top of
  // that category) but is middling overall, so they rank #5 on the
  // Social Graph tab and way down at #217 on every other tab.
  { handle: "nord_monkey", displayName: "Nord Monkey", avatarUrl: getAvatarUrl("nord_monkey"), rankTier: "cicada",
    totalRep: 895, socialGraphScore: 10800, onchainScore: 1240, socialScore: 560,
    graphPnl: 12430, onchainPnl: 8217, smartFollowers: 342,
    trends: { total: { dir: "up", amount: 15 }, socialGraph: { dir: "up", amount: 8 }, onchain: { dir: "up", amount: 22 }, social: { dir: "up", amount: 6 } },
    fixedRank: 217, isCurrentUser: true },
]

// ---- Score extractor per tab ---------------------------------------------
function scoreFor(user: LeaderboardUser, tab: MainTab, sub: ActivitySubTab): number {
  switch (tab) {
    case "total":        return user.totalRep
    case "social-graph": return user.socialGraphScore
    case "activity":     return sub === "onchain" ? user.onchainScore : user.socialScore
  }
}

function trendFor(
  user: LeaderboardUser,
  tab: MainTab,
  sub: ActivitySubTab
): { dir: "up" | "down" | "stable"; amount?: number } {
  switch (tab) {
    case "total":        return user.trends.total
    case "social-graph": return user.trends.socialGraph
    case "activity":     return sub === "onchain" ? user.trends.onchain : user.trends.social
  }
}

function scoreLabelFor(tab: MainTab, sub: ActivitySubTab): string {
  if (tab === "total")        return "REP"
  if (tab === "social-graph") return "GRAPH"
  return sub === "onchain" ? "ONCHAIN" : "SOCIAL"
}

// Helper to compute user's rank in a given category
function computeUserRanks(users: LeaderboardUser[]) {
  const me = users.find(u => u.isCurrentUser)
  if (!me) return { total: 999, socialGraph: 999, onchain: 999, social: 999 }
  
  const sortedTotal = [...users].sort((a, b) => b.totalRep - a.totalRep)
  const sortedGraph = [...users].sort((a, b) => b.socialGraphScore - a.socialGraphScore)
  const sortedOnchain = [...users].sort((a, b) => b.onchainScore - a.onchainScore)
  const sortedSocial = [...users].sort((a, b) => b.socialScore - a.socialScore)
  
  return {
    total: me.fixedRank ?? (sortedTotal.findIndex(u => u.handle === me.handle) + 1),
    socialGraph: sortedGraph.findIndex(u => u.handle === me.handle) + 1,
    onchain: me.fixedRank ? Math.round(me.fixedRank * 0.4) : (sortedOnchain.findIndex(u => u.handle === me.handle) + 1),
    social: me.fixedRank ? Math.round(me.fixedRank * 0.7) : (sortedSocial.findIndex(u => u.handle === me.handle) + 1),
  }
}

const userRanks = computeUserRanks(mockUsers)
const totalUsers = 1256 // mock total

// ---- Mock "your stats" for the hero banner (now computed from actual data) --
const myStats = {
  total:       { rank: userRanks.total, totalUsers, trend: "up" as const, repScore: 895, repMax: 1200, nextTier: "Top 200" },
  socialGraph: { rank: userRanks.socialGraph, totalUsers, trend: "up" as const, repScore: 895, repMax: 1200, nextTier: "Top 3" },
  onchain:     { rank: userRanks.onchain, totalUsers, trend: "down" as const, repScore: 895, repMax: 1200, nextTier: "Top 50" },
  social:      { rank: userRanks.social, totalUsers, trend: "down" as const, repScore: 895, repMax: 1200, nextTier: "Top 100" },
}

// ---- Small trend arrow for the hero banner ---------------------------------
function HeroTrendArrow({ dir }: { dir: "up" | "down" | "stable" }) {
  if (dir === "up") {
    return (
      <svg width="20" height="14" viewBox="0 0 20 14" fill="none" className="inline-block ml-1.5">
        <path d="M2 12L7 7L10 9L18 2" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 2H18V7" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (dir === "down") {
    return (
      <svg width="20" height="14" viewBox="0 0 20 14" fill="none" className="inline-block ml-1.5">
        <path d="M2 2L7 7L10 5L18 12" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 12H18V7" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return <Minus className="h-3.5 w-3.5 text-muted-foreground inline-block ml-1.5" />
}

function getMyStatsKey(tab: MainTab, sub: ActivitySubTab): keyof typeof myStats {
  if (tab === "total") return "total"
  if (tab === "social-graph") return "socialGraph"
  return sub === "onchain" ? "onchain" : "social"
}

// ---- Hero banner component -------------------------------------------------
function LeaderboardHeroBanner({
  tab,
  activitySub,
}: {
  tab: MainTab
  activitySub: ActivitySubTab
}) {
  const statsKey = getMyStatsKey(tab, activitySub)
  const stats = myStats[statsKey]
  const progress = stats.repScore / stats.repMax

  // 4-column rank overview: Total, Social Graph, Activity Onchain, Activity Social
  const rankColumns = [
    { id: "total",       label: "Total",       ...myStats.total },
    { id: "socialGraph", label: "Social Graph", ...myStats.socialGraph },
    { id: "onchain",     label: "Onchain",     ...myStats.onchain },
    { id: "social",      label: "Social",      ...myStats.social },
  ]

  // Determine current tier name
  const currentRank = stats.rank
  const currentTier =
    currentRank <= 3 ? "Top 3" :
    currentRank <= 10 ? "Top 10" :
    currentRank <= 25 ? "Top 25" :
    currentRank <= 75 ? "Top 75" :
    currentRank <= 150 ? "Top 150" :
    currentRank <= 300 ? "Top 300" :
    `Top ${Math.ceil(currentRank / 100) * 100}`

  // Which column is currently active?
  const activeId = statsKey

  return (
    <div className="solid-card overflow-hidden">
      {/* Title */}
      <div className="pt-5 pb-3 text-center">
        <h2 className="section-title text-lg tracking-[0.15em]">LEADERBOARDS</h2>
      </div>

      {/* 4-column rank overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 px-4 pb-4">
        {rankColumns.map((col) => {
          const isActive = col.id === activeId
          return (
            <div key={col.id} className={`text-center transition-opacity ${isActive ? "" : "opacity-60"}`}>
              <p className={`text-[10px] uppercase tracking-wider mb-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {col.label}
              </p>
              <div className="flex items-baseline justify-center flex-wrap">
                <span className={`text-2xl md:text-3xl font-bold tracking-tight ${isActive ? "text-primary" : "metallic-text-silver"}`}>
                  #{col.rank}
                </span>
                <span className="text-muted-foreground text-xs font-mono ml-0.5">
                  /{col.totalUsers}
                </span>
                <HeroTrendArrow dir={col.trend} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress bar + tier labels */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-muted-foreground font-medium">{currentTier}</span>
          <span className="text-[11px] text-foreground font-medium font-mono">
            +REP {stats.repScore}/{stats.repMax}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">{stats.nextTier}</span>
        </div>
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(progress * 100, 100)}%`,
              background: "linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 70%, var(--positive)))",
              boxShadow: "0 0 12px color-mix(in srgb, var(--primary) 50%, transparent)",
            }}
          />
        </div>
      </div>
    </div>
  )
}

function TrendIndicator({
  trend,
}: {
  trend: { dir: "up" | "down" | "stable"; amount?: number }
}) {
  if (trend.dir === "up") {
    return (
      <div className="flex items-center gap-1 text-positive text-xs">
        <TrendingUp className="h-3.5 w-3.5" />
        {trend.amount !== undefined && <span>+{trend.amount}</span>}
      </div>
    )
  }
  if (trend.dir === "down") {
    return (
      <div className="flex items-center gap-1 text-warning text-xs">
        <TrendingDown className="h-3.5 w-3.5" />
        {trend.amount !== undefined && <span>-{trend.amount}</span>}
      </div>
    )
  }
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
}

// Helper to format currency with K/M suffix
function formatPnl(value: number): string {
  if (value >= 1000000) return `+$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `+$${(value / 1000).toFixed(0)}K`
  return `+$${value.toLocaleString()}`
}

// Get highlight stats for a user based on current tab
// Returns array for Total tab (all 3 metrics), single item for other tabs
function getHighlightValues(user: LeaderboardUser, tab: MainTab, sub: ActivitySubTab): { label: string; value: string }[] {
  if (tab === "total") {
    // On Total, show all three metrics
    return [
      { label: "Graph PNL", value: formatPnl(user.graphPnl) },
      { label: "Onchain PNL", value: formatPnl(user.onchainPnl) },
      { label: "Followers", value: user.smartFollowers.toLocaleString() },
    ]
  }
  if (tab === "social-graph") {
    return [{ label: "Graph PNL", value: formatPnl(user.graphPnl) }]
  }
  if (tab === "activity" && sub === "onchain") {
    return [{ label: "Onchain PNL", value: formatPnl(user.onchainPnl) }]
  }
  if (tab === "activity" && sub === "social") {
    return [{ label: "Followers", value: user.smartFollowers.toLocaleString() }]
  }
  return []
}

function LeaderboardRow({
  user,
  rank,
  score,
  trend,
  isCurrentUser,
  tab,
  activitySub,
}: {
  user: LeaderboardUser
  rank: number
  score: number
  trend: { dir: "up" | "down" | "stable"; amount?: number }
  isCurrentUser: boolean
  tab: MainTab
  activitySub: ActivitySubTab
}) {
  const tier = getRankTier(rank)
  const highlights = getHighlightValues(user, tab, activitySub)
  const isTotal = tab === "total"
  
  return (
    <div
      className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 transition-colors ${
        isCurrentUser
          ? "bg-primary/10 border-l-2 border-primary"
          : "hover:bg-muted/30"
      }`}
    >
      <div className="w-10 md:w-14 flex-shrink-0">
        <span
          className={`font-mono text-xs md:text-sm ${
            isCurrentUser ? "text-primary font-bold" : "text-muted-foreground"
          }`}
        >
          #{rank.toLocaleString()}
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <div
            className={`h-8 w-8 md:h-9 md:w-9 rounded-full overflow-hidden ring-2 ring-offset-1 ring-offset-background flex items-center justify-center ${
              rankRingColors[tier] || "ring-primary"
            }`}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl || "/placeholder.svg"}
                alt={user.handle}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-primary" />
            )}
          </div>
          <img
            src={rankBadges[tier] || rankBadges["pilgrim"]}
            alt={tier}
            className="absolute -bottom-1 -right-1 h-4 w-4 md:h-5 md:w-5 object-contain z-10 drop-shadow-md"
          />
        </div>
        <div className="min-w-0">
          <p
            className={`text-xs md:text-sm font-medium truncate ${
              isCurrentUser ? "text-primary" : "text-foreground"
            }`}
          >
            {user.displayName}
            {isCurrentUser && (
              <span className="ml-1 md:ml-2 text-[9px] md:text-[10px] text-muted-foreground font-normal">
                (You)
              </span>
            )}
          </p>
          <p className="text-[10px] md:text-xs text-muted-foreground truncate">@{user.handle}</p>
        </div>
      </div>

      {/* Highlight stat columns — 3 columns on Total, 1 on other tabs */}
      {isTotal ? (
        <>
          {highlights.map((hl) => (
            <div key={hl.label} className="hidden sm:block text-right flex-shrink-0 w-16 md:w-20">
              <p className="font-mono text-[11px] md:text-xs font-medium text-positive">
                {hl.value}
              </p>
              <p className="text-[8px] md:text-[9px] uppercase tracking-wider text-muted-foreground">
                {hl.label}
              </p>
            </div>
          ))}
        </>
      ) : (
        highlights.length > 0 && (
          <div className="hidden sm:block text-right flex-shrink-0 w-20 md:w-24">
            <p className="font-mono text-xs md:text-sm font-medium text-positive">
              {highlights[0].value}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              {highlights[0].label}
            </p>
          </div>
        )
      )}

      <div className="text-right flex-shrink-0 w-14 md:w-16">
        <p
          className={`font-mono text-xs md:text-sm font-semibold ${
            isCurrentUser ? "text-primary glow" : "text-foreground"
          }`}
        >
          {score.toLocaleString()}
        </p>
      </div>

      <div className="w-10 md:w-12 flex justify-end flex-shrink-0">
        <TrendIndicator trend={trend} />
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [mainTab, setMainTab] = useState<MainTab>("total")
  const [activitySub, setActivitySub] = useState<ActivitySubTab>("onchain")

  // On Social Graph we let the current user compete directly with the
  // rest of the board — their boosted socialGraphScore lands them at #5.
  // On every other tab they stay pinned at fixedRank (#217) via the
  // inline ellipsis + sticky card pattern below.
  const currentUserCompetesInTop = mainTab === "social-graph"

  const topRanked = useMemo(() => {
    return [...mockUsers]
      .filter((u) =>
        currentUserCompetesInTop ? true : u.fixedRank === undefined,
      )
      .sort((a, b) => scoreFor(b, mainTab, activitySub) - scoreFor(a, mainTab, activitySub))
      .map((u, i) => ({ user: u, rank: i + 1 }))
      .slice(0, 20)
  }, [mainTab, activitySub, currentUserCompetesInTop])

  const currentUserEntry = useMemo(() => {
    const me = mockUsers.find((u) => u.isCurrentUser)
    if (!me) return null
    // When the current user is already in the top table (social-graph), we
    // skip the "…" divider + pinned row so they aren't shown twice.
    if (currentUserCompetesInTop) return null
    return { user: me, rank: me.fixedRank ?? 0 }
  }, [currentUserCompetesInTop])

  if (!user) return null

  const mainTabs: { id: MainTab; label: string; icon: typeof Trophy }[] = [
    { id: "total",        label: "Total",        icon: Trophy },
    { id: "social-graph", label: "Social Graph", icon: Network },
    { id: "activity",     label: "Activity",     icon: Activity },
  ]

  const scoreLabel = scoreLabelFor(mainTab, activitySub)

  return (
    <PageShell
      kicker="The graph speaks"
      title={
        <>
          Top <em>verified</em> humans.
        </>
      }
      subtitle="Ranked by REP — cross-platform, cross-domain, cross-life. The same score that earns chats, matches, and trust."
    >
      <div className="space-y-6 pb-24 md:pb-8">
      {/* Hero banner — your rank overview across all categories */}
      <LeaderboardHeroBanner tab={mainTab} activitySub={activitySub} />

      {/* Main tabs: Total | Social Graph | Activity */}
      <div className="grid grid-cols-3 rounded-full p-1 bg-muted/50 border border-border">
        {mainTabs.map((t) => {
          const Icon = t.icon
          const active = mainTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setMainTab(t.id)}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_var(--accent-glow)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={active}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Activity sub-pills: Onchain | Social */}
      {mainTab === "activity" && (
        <div className="flex items-center justify-center gap-2 -mt-2 animate-in fade-in duration-200">
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/30 border border-border">
            {(
              [
                { id: "onchain", label: "Onchain" },
                { id: "social",  label: "Social" },
              ] as const
            ).map((s) => {
              const active = activitySub === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setActivitySub(s.id)}
                  className={`px-4 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    active
                      ? "bg-background text-foreground border border-primary/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-pressed={active}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Leaderboard table (top 20 + inline "you" row after an ellipsis) */}
      <div className="solid-card overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 border-b border-border bg-muted/30 text-[9px] md:text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          <div className="w-10 md:w-14">Rank</div>
          <div className="flex-1">User</div>
          {/* 3 columns on Total, 1 on other tabs */}
          {mainTab === "total" ? (
            <>
              <div className="hidden sm:block w-16 md:w-20 text-right">Graph PNL</div>
              <div className="hidden sm:block w-16 md:w-20 text-right">Onchain PNL</div>
              <div className="hidden sm:block w-16 md:w-20 text-right">Followers</div>
            </>
          ) : (
            <div className="hidden sm:block w-20 md:w-24 text-right">
              {mainTab === "social-graph" ? "Graph PNL" : activitySub === "onchain" ? "Onchain PNL" : "Followers"}
            </div>
          )}
          <div className="w-14 md:w-16 text-right">{scoreLabel}</div>
          <div className="w-10 md:w-12 text-right">7d</div>
        </div>

        <div className="divide-y divide-border">
          {topRanked.map((r) => (
            <LeaderboardRow
              key={r.user.handle}
              user={r.user}
              rank={r.rank}
              score={scoreFor(r.user, mainTab, activitySub)}
              trend={trendFor(r.user, mainTab, activitySub)}
              isCurrentUser={r.user.handle === user.handle}
              tab={mainTab}
              activitySub={activitySub}
            />
          ))}

          {/* Dotted gap + current user row (rank 200+) — kept inline so the
              user's true position is visible when they scroll all the way
              down, giving context relative to the top-20. */}
          {currentUserEntry && (
            <>
              <div
                className="py-2.5 text-center bg-muted/20 text-xs text-muted-foreground tracking-[0.4em] select-none"
                aria-hidden="true"
              >
                . . .
              </div>
              <LeaderboardRow
                user={currentUserEntry.user}
                rank={currentUserEntry.rank}
                score={scoreFor(currentUserEntry.user, mainTab, activitySub)}
                trend={trendFor(currentUserEntry.user, mainTab, activitySub)}
                isCurrentUser
                tab={mainTab}
                activitySub={activitySub}
              />
            </>
          )}
        </div>
      </div>

      {/* Sticky "Your position" card — pinned to the bottom of the viewport
          so the user always sees where they stand while scrolling the top
          of the board. Bottom offset leaves room for the mobile nav bar.
          On desktop we offset left by the sidebar width (md:ml-56) so the
          pinned card sits centered over the main content column rather
          than the whole viewport. */}
      {currentUserEntry && (() => {
        const stickyHighlights = getHighlightValues(currentUserEntry.user, mainTab, activitySub)
        const isTotal = mainTab === "total"
        return (
          <div
            className="fixed left-0 right-0 md:left-56 bottom-16 md:bottom-4 z-30 pointer-events-none px-4"
            aria-label="Your current leaderboard position"
          >
            <div className="max-w-3xl mx-auto pointer-events-auto">
              <div className="solid-card border-primary/40 shadow-[0_8px_32px_rgba(0,0,0,0.45)] ring-1 ring-primary/30 backdrop-blur">
                <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3">
                  <div className="w-10 md:w-14 flex-shrink-0">
                    <span className="font-mono text-xs md:text-sm text-primary font-bold">
                      #{currentUserEntry.rank.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div
                        className={`h-8 w-8 md:h-9 md:w-9 rounded-full overflow-hidden ring-2 ring-offset-1 ring-offset-background flex items-center justify-center ${
                          rankRingColors[currentUserEntry.user.rankTier] || "ring-primary"
                        }`}
                      >
                        {currentUserEntry.user.avatarUrl ? (
                          <img
                            src={currentUserEntry.user.avatarUrl || "/placeholder.svg"}
                            alt={currentUserEntry.user.handle}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <img
                        src={rankBadges[currentUserEntry.user.rankTier] || rankBadges["pilgrim"]}
                        alt={currentUserEntry.user.rankTier}
                        className="absolute -bottom-1 -right-1 h-4 w-4 md:h-5 md:w-5 object-contain z-10 drop-shadow-md"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-medium text-primary truncate">
                        {currentUserEntry.user.displayName}
                        <span className="ml-1 md:ml-2 text-[9px] md:text-[10px] text-muted-foreground font-normal">
                          (You)
                        </span>
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                        @{currentUserEntry.user.handle}
                      </p>
                    </div>
                  </div>

                  {/* Highlight stats — 3 on Total, 1 on other tabs */}
                  {isTotal ? (
                    <>
                      {stickyHighlights.map((hl) => (
                        <div key={hl.label} className="hidden sm:block text-right flex-shrink-0">
                          <p className="font-mono text-[11px] md:text-xs font-medium text-positive">
                            {hl.value}
                          </p>
                          <p className="text-[8px] md:text-[9px] uppercase tracking-wider text-muted-foreground">
                            {hl.label}
                          </p>
                        </div>
                      ))}
                    </>
                  ) : (
                    stickyHighlights.length > 0 && (
                      <div className="hidden sm:block text-right flex-shrink-0">
                        <p className="font-mono text-xs md:text-sm font-medium text-positive">
                          {stickyHighlights[0].value}
                        </p>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                          {stickyHighlights[0].label}
                        </p>
                      </div>
                    )
                  )}

                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-xs md:text-sm font-semibold text-primary glow">
                      {scoreFor(currentUserEntry.user, mainTab, activitySub).toLocaleString()}
                    </p>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      {scoreLabel}
                    </p>
                  </div>

                  <div className="w-10 md:w-12 flex flex-col items-end flex-shrink-0">
                    <TrendIndicator
                      trend={trendFor(currentUserEntry.user, mainTab, activitySub)}
                    />
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                      7d
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
      </div>
    </PageShell>
  )
}
