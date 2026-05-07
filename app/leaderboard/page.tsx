"use client"

import { useMemo, useState } from "react"
import {
  User,
  Network,
  Activity,
  Trophy,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getAvatarUrl } from "@/lib/avatars"
import { PageShell } from "@/components/ui/page-shell"
import { SectionTitle } from "@/components/ui/primitives"

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

// Avatar ring color per rank tier — uses --color-rep-avatar-ring-* tokens
// from @dancingteeth/rep-design (Figma source-of-truth palette).
const rankRingColors: Record<string, string> = {
  "ꙮ": "ring-[var(--color-rep-avatar-ring-gold)]",
  "yo": "ring-[var(--color-rep-avatar-ring-blue)]",
  "ToT": "ring-[var(--color-rep-avatar-ring-pale)]",
  "roko": "ring-[var(--color-rep-avatar-ring-purple)]",
  "droog": "ring-[var(--color-rep-avatar-ring-orange)]",
  "cicada": "ring-[var(--color-rep-avatar-ring-green)]",
  "pilgrim": "ring-[var(--color-rep-avatar-ring-lime)]",
}

// REP-style number format — Figma uses space-separated thousands ("1 847", "30 217")
const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/ /g, " ")

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
    graphPnl: 245000, onchainPnl: 892000, smartFollowers: 1847 },
  { handle: "cobie", displayName: "Cobie", avatarUrl: getAvatarUrl("cobie"), rankTier: "ꙮ",
    totalRep: 14203, socialGraphScore: 13800, onchainScore: 8900, socialScore: 14800,
    graphPnl: 187000, onchainPnl: 534000, smartFollowers: 1623 },
  { handle: "punk6529", displayName: "punk6529", avatarUrl: getAvatarUrl("punk6529"), rankTier: "ꙮ",
    totalRep: 13876, socialGraphScore: 12900, onchainScore: 13200, socialScore: 13100,
    graphPnl: 156000, onchainPnl: 1240000, smartFollowers: 1489 },
  { handle: "hsaka", displayName: "Hsaka", avatarUrl: getAvatarUrl("hsaka"), rankTier: "yo",
    totalRep: 12541, socialGraphScore: 10200, onchainScore: 11800, socialScore: 11700,
    graphPnl: 98000, onchainPnl: 467000, smartFollowers: 987 },
  { handle: "degenwhale", displayName: "Degen Whale", avatarUrl: getAvatarUrl("degenwhale"), rankTier: "yo",
    totalRep: 11247, socialGraphScore: 9400, onchainScore: 12100, socialScore: 8900,
    graphPnl: 67000, onchainPnl: 1890000, smartFollowers: 654 },
  { handle: "cryptonative", displayName: "Crypto Native", avatarUrl: getAvatarUrl("cryptonative"), rankTier: "yo",
    totalRep: 10890, socialGraphScore: 11300, onchainScore: 7800, socialScore: 10400,
    graphPnl: 134000, onchainPnl: 234000, smartFollowers: 876 },
  { handle: "defichad", displayName: "DeFi Chad", avatarUrl: getAvatarUrl("defichad"), rankTier: "yo",
    totalRep: 9654, socialGraphScore: 7100, onchainScore: 11400, socialScore: 7900,
    graphPnl: 45000, onchainPnl: 678000, smartFollowers: 543 },
  { handle: "nftmaxi", displayName: "NFT Maxi", avatarUrl: getAvatarUrl("nftmaxi"), rankTier: "yo",
    totalRep: 8432, socialGraphScore: 8800, onchainScore: 6900, socialScore: 9800,
    graphPnl: 89000, onchainPnl: 123000, smartFollowers: 765 },
  { handle: "tradoor_pro", displayName: "Tradoor Pro", avatarUrl: getAvatarUrl("tradoor_pro"), rankTier: "yo",
    totalRep: 7891, socialGraphScore: 6500, onchainScore: 9200, socialScore: 6400,
    graphPnl: 34000, onchainPnl: 456000, smartFollowers: 432 },
  { handle: "airdrop_hunter", displayName: "Airdrop Hunter", avatarUrl: getAvatarUrl("airdrop_hunter"), rankTier: "yo",
    totalRep: 6543, socialGraphScore: 5400, onchainScore: 8100, socialScore: 5200,
    graphPnl: 23000, onchainPnl: 345000, smartFollowers: 321 },
  { handle: "0xsomething", displayName: "0xSomething", avatarUrl: getAvatarUrl("0xsomething"), rankTier: "ToT",
    totalRep: 5987, socialGraphScore: 6100, onchainScore: 5400, socialScore: 5900,
    graphPnl: 56000, onchainPnl: 189000, smartFollowers: 456 },
  { handle: "zora_fan", displayName: "Zora Fan", avatarUrl: getAvatarUrl("zora_fan"), rankTier: "ToT",
    totalRep: 5421, socialGraphScore: 5900, onchainScore: 4100, socialScore: 6200,
    graphPnl: 67000, onchainPnl: 78000, smartFollowers: 534 },
  { handle: "farcaster_og", displayName: "Farcaster OG", avatarUrl: getAvatarUrl("farcaster_og"), rankTier: "ToT",
    totalRep: 4987, socialGraphScore: 5300, onchainScore: 3200, socialScore: 5800,
    graphPnl: 45000, onchainPnl: 56000, smartFollowers: 489 },
  { handle: "sol_dev", displayName: "Sol Dev", avatarUrl: getAvatarUrl("sol_dev"), rankTier: "ToT",
    totalRep: 4532, socialGraphScore: 3900, onchainScore: 5200, socialScore: 3800,
    graphPnl: 23000, onchainPnl: 234000, smartFollowers: 287 },
  { handle: "nade", displayName: "nade", avatarUrl: getAvatarUrl("nade"), rankTier: "ToT",
    totalRep: 4198, socialGraphScore: 4500, onchainScore: 3400, socialScore: 4600,
    graphPnl: 34000, onchainPnl: 67000, smartFollowers: 367 },
  { handle: "base_builder", displayName: "Base Builder", avatarUrl: getAvatarUrl("base_builder"), rankTier: "ToT",
    totalRep: 3876, socialGraphScore: 3300, onchainScore: 4200, socialScore: 3100,
    graphPnl: 18000, onchainPnl: 145000, smartFollowers: 234 },
  { handle: "memecoin_king", displayName: "Memecoin King", avatarUrl: getAvatarUrl("memecoin_king"), rankTier: "ToT",
    totalRep: 3542, socialGraphScore: 2800, onchainScore: 4500, socialScore: 2900,
    graphPnl: 12000, onchainPnl: 289000, smartFollowers: 198 },
  { handle: "yield_farmer", displayName: "Yield Farmer", avatarUrl: getAvatarUrl("yield_farmer"), rankTier: "ToT",
    totalRep: 3287, socialGraphScore: 2600, onchainScore: 4100, socialScore: 2500,
    graphPnl: 9000, onchainPnl: 178000, smartFollowers: 167 },
  { handle: "eth_denver", displayName: "ETH Denver", avatarUrl: getAvatarUrl("eth_denver"), rankTier: "ToT",
    totalRep: 3024, socialGraphScore: 3200, onchainScore: 2400, socialScore: 3400,
    graphPnl: 15000, onchainPnl: 34000, smartFollowers: 256 },
  { handle: "onchain_pepe", displayName: "Onchain Pepe", avatarUrl: getAvatarUrl("onchain_pepe"), rankTier: "ToT",
    totalRep: 2798, socialGraphScore: 2100, onchainScore: 3500, socialScore: 2200,
    graphPnl: 8000, onchainPnl: 123000, smartFollowers: 145 },

  // Current user — the user has a strong social graph (near the top of
  // that category) but is middling overall, so they rank #5 on the
  // Social Graph tab and way down at #217 on every other tab.
  { handle: "nord_monkey", displayName: "Nord Monkey", avatarUrl: getAvatarUrl("nord_monkey"), rankTier: "cicada",
    totalRep: 895, socialGraphScore: 10800, onchainScore: 1240, socialScore: 560,
    graphPnl: 12430, onchainPnl: 8217, smartFollowers: 342,
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
  total:       { rank: userRanks.total, totalUsers, repScore: 895, repMax: 1200, nextTier: "Top 200" },
  socialGraph: { rank: userRanks.socialGraph, totalUsers, repScore: 895, repMax: 1200, nextTier: "Top 3" },
  onchain:     { rank: userRanks.onchain, totalUsers, repScore: 895, repMax: 1200, nextTier: "Top 50" },
  social:      { rank: userRanks.social, totalUsers, repScore: 895, repMax: 1200, nextTier: "Top 100" },
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
    <div className="rep-cmp-leaderboard-summary-card">
      {/* Title — Figma 21631:2288, Graphik semibold 24 uppercase, gradient text.
          Uses shared <SectionTitle> primitive (rep-section-title-gradient =
          103.55deg cyan→white, letter-spacing 0, line-height 100%). */}
      <div className="text-center">
        <SectionTitle>LEADERBOARDS</SectionTitle>
      </div>

      {/* 4-column rank overview — Figma 21631-2233 spec:
          Label is "Total:" sentence-case + colon (NOT uppercase),
          big Graphik value, small "/total", green trend arrow next to denominator. */}
      <div className="rep-cmp-leaderboard-status-grid mt-[var(--spacing-rep-summary-status-top)]">
        {rankColumns.map((col) => {
          const isActive = col.id === activeId
          return (
            <div
              key={col.id}
              className={`rep-cmp-leaderboard-status-item transition-opacity ${isActive ? "" : "opacity-55"}`}
            >
              <p className={`font-display text-[14px] leading-tight ${isActive ? "text-ink" : "text-muted-foreground"}`}>
                {col.label}:
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className={`font-display font-semibold leading-none tracking-tight tabular-nums rep-text-shadow-glow ${
                    isActive ? "rep-text-gradient-leaderboard-metric" : "text-ink"
                  }`}
                  style={{ fontSize: "var(--size-rep-metric-value, 40px)" }}
                >
                  {col.rank}
                </span>
                <span
                  className="text-muted-foreground font-display tabular-nums"
                  style={{ fontSize: "var(--size-rep-metric-total, 12px)" }}
                >
                  /{fmt(col.totalUsers)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress bar + tier labels */}
      <div className="mt-[var(--spacing-rep-summary-progress-top)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground font-medium">{currentTier}</span>
          <span className="text-[11px] text-foreground font-medium font-display tabular-nums">
            +REP {stats.repScore}/{stats.repMax}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">{stats.nextTier}</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
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

// Helper to format currency with K/M suffix (space-separated thousands)
function formatPnl(value: number): string {
  if (value >= 1000000) return `+$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `+$${(value / 1000).toFixed(0)}K`
  return `+$${fmt(value)}`
}

// Get highlight stats for a user based on current tab
// Returns array for Total tab (all 3 metrics), single item for other tabs
function getHighlightValues(user: LeaderboardUser, tab: MainTab, sub: ActivitySubTab): { label: string; value: string }[] {
  if (tab === "total") {
    // On Total, show all three metrics
    return [
      { label: "Graph PNL", value: formatPnl(user.graphPnl) },
      { label: "Onchain PNL", value: formatPnl(user.onchainPnl) },
      { label: "Followers", value: fmt(user.smartFollowers) },
    ]
  }
  if (tab === "social-graph") {
    return [{ label: "Graph PNL", value: formatPnl(user.graphPnl) }]
  }
  if (tab === "activity" && sub === "onchain") {
    return [{ label: "Onchain PNL", value: formatPnl(user.onchainPnl) }]
  }
  if (tab === "activity" && sub === "social") {
    return [{ label: "Followers", value: fmt(user.smartFollowers) }]
  }
  return []
}

function LeaderboardRow({
  user,
  rank,
  score,
  isCurrentUser,
  tab,
  activitySub,
}: {
  user: LeaderboardUser
  rank: number
  score: number
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
          ? "rep-cmp-leaderboard-row-highlight relative z-[2]"
          : "hover:bg-muted/30"
      }`}
      style={
        isCurrentUser
          ? {
              // Override package highlight (rgba(25,38,49,0.8)) with a more
              // transparent fill + backdrop blur so the page glow shows through
              // but the row beneath isn't readable through the pinned card.
              backgroundColor: "rgba(15, 24, 32, 0.55)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }
          : undefined
      }
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

      {/* Highlight stat columns — Figma: muted-gray PNL/Followers via
          rep-text-table-muted (#7e7e7e). NOT green/positive. */}
      {isTotal ? (
        <>
          {highlights.map((hl) => (
            <div key={hl.label} className="hidden sm:block text-right flex-shrink-0 w-16 md:w-20">
              <p className="rep-text-table-muted font-display tabular-nums text-[11px] md:text-xs font-medium">
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
            <p className="rep-text-table-muted font-display tabular-nums text-xs md:text-sm font-medium">
              {highlights[0].value}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              {highlights[0].label}
            </p>
          </div>
        )
      )}

      {/* REP score — Figma: rep-text-leaderboard-score-accent (#8ce0ff cyan).
          Space-separated thousands ("30 217"). */}
      <div className="text-right flex-shrink-0 w-14 md:w-16">
        <p className="rep-text-leaderboard-score-accent font-display tabular-nums text-xs md:text-sm font-semibold">
          {fmt(score)}
        </p>
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
    <PageShell>
      {/* HorizonGlow now lives globally in AppShell — applies to all
          authenticated pages. Leaderboard panel's backdrop-blur(8px)
          will still refract the arc into the wavy silhouette. */}
      <div className="relative z-[1] space-y-6 pb-24 md:pb-8">
      {/* Hero banner — your rank overview across all categories */}
      <div className="flex justify-center">
        <LeaderboardHeroBanner tab={mainTab} activitySub={activitySub} />
      </div>

      {/* Main tabs — Figma segment slider (362×33, cyan halo, glass blur).
          Active pill positions are tuned to the 3 stops via
          rep-cmp-segment-slider-active-bg-{total|social|onchain}. */}
      <div className="flex justify-center">
        <div className="rep-cmp-segment-slider">
          <div
            className={`rep-cmp-segment-slider-active-bg ${
              mainTab === "total"
                ? "rep-cmp-segment-slider-active-bg-total"
                : mainTab === "social-graph"
                  ? "rep-cmp-segment-slider-active-bg-social"
                  : "rep-cmp-segment-slider-active-bg-onchain"
            }`}
          />
          {mainTabs.map((t) => {
            const Icon = t.icon
            const active = mainTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setMainTab(t.id)}
                className={`rep-cmp-segment-slider-tab gap-1.5 ${active ? "rep-cmp-segment-slider-tab-active" : ""}`}
                aria-pressed={active}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>
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

      {/* Leaderboard table — Figma rep-cmp-leaderboard-panel + header strip.
          Panel: muted ring + backdrop blur. Header: muted gradient ring on top corners. */}
      <div className="rep-cmp-leaderboard-panel mx-auto" style={{ maxWidth: "var(--width-rep-leaderboard-content, 726px)" }}>
        {/* Table header */}
        <div className="rep-cmp-leaderboard-header-strip flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 text-[9px] md:text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          <div className="w-10 md:w-14 relative z-[1]">Rank</div>
          <div className="flex-1 relative z-[1]">User</div>
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
        </div>

        <div className="divide-y divide-border">
          {topRanked.map((r) => (
            <LeaderboardRow
              key={r.user.handle}
              user={r.user}
              rank={r.rank}
              score={scoreFor(r.user, mainTab, activitySub)}
              isCurrentUser={r.user.handle === user.handle}
              tab={mainTab}
              activitySub={activitySub}
            />
          ))}

          {/* Dotted gap + current user row (rank 200+).
              The pinned row uses position:sticky so it stays visible at
              the bottom of the viewport while scrolling the table; once
              the user scrolls past its natural position, it un-sticks
              and sits inline with the dotted divider. Single source of
              truth — the previous duplicate fixed GlassTile is gone. */}
          {currentUserEntry && (
            <>
              <div
                className="py-2.5 text-center bg-muted/20 text-xs text-muted-foreground tracking-[0.4em] select-none"
                aria-hidden="true"
              >
                . . .
              </div>
              <div className="sticky bottom-4 md:bottom-6 z-[5]">
                <LeaderboardRow
                  user={currentUserEntry.user}
                  rank={currentUserEntry.rank}
                  score={scoreFor(currentUserEntry.user, mainTab, activitySub)}
                  isCurrentUser
                  tab={mainTab}
                  activitySub={activitySub}
                />
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </PageShell>
  )
}
