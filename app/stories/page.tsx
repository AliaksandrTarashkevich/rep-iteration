"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Wallet,
  ChevronRight,
  Twitter,
  Sparkles,
  Briefcase,
  Layers,
  Users,
  Star,
  Crown,
  TrendingUp,
  Calendar,
  Zap,
  Network,
  Coins,
  Image as ImageIcon,
  Activity,
  ArrowUp,
  MessageCircle,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  StoryCardBackground,
  seedFromString,
} from "@/components/story-card-background"
import { StoryShareActions } from "@/components/story-share-actions"
import { RepCardStory } from "@/components/rep-card-story"
import { Num } from "@/components/ui/primitives"

// ============================================================================
// TYPES & MOCK DATA
// ============================================================================

type AuthSource = "x" | "wallet"

interface StorySlide {
  id: string
  type: "data" | "prompt" | "summary"
  label: string
  shareable: boolean
  requiresSource?: AuthSource
}

// X Path Stories (in order per spec)
const X_PATH_STORIES: StorySlide[] = [
  { id: "smart-followers", type: "data", label: "SMART FOLLOWERS", shareable: true, requiresSource: "x" },
  { id: "notable-followers", type: "data", label: "NOTABLE FOLLOWERS", shareable: true, requiresSource: "x" },
  { id: "inner-circle", type: "data", label: "INNER CIRCLE", shareable: true, requiresSource: "x" },
  { id: "community", type: "data", label: "YOUR COMMUNITY", shareable: true, requiresSource: "x" },
  { id: "rank", type: "data", label: "YOUR RANK", shareable: true, requiresSource: "x" },
  { id: "share-magnet", type: "data", label: "SHARE MAGNET", shareable: true, requiresSource: "x" },
  { id: "connect-wallet", type: "prompt", label: "CONNECT WALLET", shareable: false },
  { id: "subscribe-rep", type: "prompt", label: "STAY CONNECTED", shareable: false },
  { id: "summary", type: "summary", label: "YOUR REP CARD", shareable: true },
]

// Wallet Path Stories (in order per spec) - 4 wallet stories before connect X prompt
const WALLET_PATH_STORIES: StorySlide[] = [
  { id: "onchain-snapshot", type: "data", label: "ONCHAIN SNAPSHOT", shareable: true, requiresSource: "wallet" },
  { id: "ecosystem", type: "data", label: "YOUR ECOSYSTEM", shareable: true, requiresSource: "wallet" },
  { id: "wallet-age", type: "data", label: "WALLET AGE", shareable: true, requiresSource: "wallet" },
  { id: "defi-power", type: "data", label: "DEFI POWER", shareable: true, requiresSource: "wallet" },
  { id: "connect-x", type: "prompt", label: "CONNECT X", shareable: false },
  { id: "subscribe-rep", type: "prompt", label: "STAY CONNECTED", shareable: false },
  { id: "summary", type: "summary", label: "YOUR REP CARD", shareable: true },
]

// Additional stories unlocked when connecting the other source
// 4 wallet stories when X user connects wallet
const WALLET_BONUS_STORIES: StorySlide[] = [
  { id: "onchain-snapshot", type: "data", label: "ONCHAIN SNAPSHOT", shareable: true, requiresSource: "wallet" },
  { id: "ecosystem", type: "data", label: "YOUR ECOSYSTEM", shareable: true, requiresSource: "wallet" },
  { id: "wallet-age", type: "data", label: "WALLET AGE", shareable: true, requiresSource: "wallet" },
  { id: "defi-power", type: "data", label: "DEFI POWER", shareable: true, requiresSource: "wallet" },
]

const X_BONUS_STORIES: StorySlide[] = [
  { id: "smart-followers", type: "data", label: "SMART FOLLOWERS", shareable: true, requiresSource: "x" },
  { id: "notable-followers", type: "data", label: "NOTABLE FOLLOWERS", shareable: true, requiresSource: "x" },
  { id: "inner-circle", type: "data", label: "INNER CIRCLE", shareable: true, requiresSource: "x" },
  { id: "community", type: "data", label: "YOUR COMMUNITY", shareable: true, requiresSource: "x" },
  { id: "rank", type: "data", label: "YOUR RANK", shareable: true, requiresSource: "x" },
  { id: "share-magnet", type: "data", label: "SHARE MAGNET", shareable: true, requiresSource: "x" },
]

// Community colors for visual distinction
const COMMUNITY_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  "DeFi": { bg: "bg-emerald-500/20", text: "text-emerald-400", bar: "bg-emerald-500" },
  "NFT/Art": { bg: "bg-fuchsia-500/20", text: "text-fuchsia-400", bar: "bg-fuchsia-500" },
  "DAO": { bg: "bg-amber-500/20", text: "text-amber-400", bar: "bg-amber-500" },
  "MEV": { bg: "bg-red-500/20", text: "text-red-400", bar: "bg-red-500" },
  "Builders": { bg: "bg-sky-500/20", text: "text-sky-400", bar: "bg-sky-500" },
}

// Mock user data with avatars
const MOCK_DATA = {
  user: {
    handle: "tradoor",
    avatarUrl: "/images/avatars/avatar-1.jpg",
    rankTier: "yo" as RankTier,
  },
  smartFollowers: {
    total: 448,
    vcs: 47,
    projects: 89,
    influencers: 312,
  },
  notableFollowers: [
    { handle: "@vitalik", score: 94.2, avatarUrl: "/images/avatars/avatar-2.jpg" },
    { handle: "@cobie", score: 87.5, avatarUrl: "/images/avatars/avatar-3.jpg" },
    { handle: "@punk6529", score: 82.1, avatarUrl: "/images/avatars/avatar-4.jpg" },
    { handle: "@tetranode", score: 78.9, avatarUrl: "/images/avatars/avatar-5.jpg" },
    { handle: "@DefiIgnas", score: 71.3, avatarUrl: "/images/avatars/avatar-6.jpg" },
  ],
  notableScore: 38.0,
  innerCircle: [
    { handle: "@hsaka", score: 98, avatarUrl: "/images/avatars/avatar-3.jpg" },
    { handle: "@loomdart", score: 94, avatarUrl: "/images/avatars/avatar-4.jpg" },
    { handle: "@blknoiz06", score: 91, avatarUrl: "/images/avatars/avatar-5.jpg" },
  ],
  communities: [
    { name: "DeFi", percentage: 34 },
    { name: "NFT/Art", percentage: 22 },
    { name: "DAO", percentage: 19 },
    { name: "MEV", percentage: 15 },
    { name: "Builders", percentage: 10 },
  ],
  rank: {
    percentile: "Top 3%",
    totalUsers: 128000,
    rep: 847,
    position: 3840,
  },
  shareMagnet: {
    percentile: "Top 0.4%",
    volume: 12.4,
    badges: ["DeFi Summer OG", "Gas Warrior", "Protocol Explorer"],
  },
  onchain: {
    totalValue: 45200,
    chains: 8,
    protocols: 23,
    nfts: 156,
    transactions: 4200,
    walletAge: "2021",
  },
  ecosystem: {
    topChains: [
      { name: "Ethereum", percentage: 45 },
      { name: "Base", percentage: 28 },
      { name: "Arbitrum", percentage: 15 },
      { name: "Optimism", percentage: 8 },
      { name: "Polygon", percentage: 4 },
    ],
    topProtocols: ["Uniswap", "Aave", "Compound"],
  },
  summary: {
    handle: "tradoor",
    avatarUrl: "/images/avatars/avatar-1.jpg",
    repScore: 847,
    signal: 448,
    communities: 5,
    cardType: "Social REP Card",
    aiOneLiner: "Chief Vampire Officer hacking neon coordination graphs.",
    achievements: ["DeFi OG", "Inner Circle", "Smart Signal"],
    rankTier: "yo" as RankTier,
  },
}

import { RANK_TIERS, type RankTier } from "@/lib/auth-context"

// Rank tier styling
const rankStyles: Record<RankTier, { color: string; glow: string }> = {
  "ꙮ": { color: "text-amber-400", glow: "shadow-[0_0_20px_rgba(251,191,36,0.4)]" },
  "yo": { color: "text-primary", glow: "shadow-[0_0_15px_var(--accent-glow)]" },
  "ToT": { color: "text-emerald-400", glow: "shadow-[0_0_15px_rgba(52,211,153,0.3)]" },
  "roko": { color: "text-purple-400", glow: "shadow-[0_0_12px_rgba(192,132,252,0.25)]" },
  "droog": { color: "text-sky-400", glow: "" },
  "cicada": { color: "text-muted-foreground", glow: "" },
  "pilgrim": { color: "text-muted-foreground", glow: "" },
}

// Rank ring colors
const rankRingColors: Record<RankTier, string> = {
  "ꙮ": "ring-amber-400",
  "yo": "ring-primary",
  "ToT": "ring-emerald-400",
  "roko": "ring-purple-400",
  "droog": "ring-sky-400",
  "cicada": "ring-muted-foreground",
  "pilgrim": "ring-muted-foreground",
}

// Rank badge images
const rankBadges: Record<RankTier, string> = {
  "ꙮ": "/images/ranks/crown.png",
  "yo": "/images/ranks/base.png",
  "ToT": "/images/ranks/star.jpg",
  "roko": "/images/ranks/star.jpg",
  "droog": "/images/ranks/star.jpg",
  "cicada": "/images/ranks/star.jpg",
  "pilgrim": "/images/ranks/star.jpg",
}

// ============================================================================
// SHARE METADATA — central source of truth for every card's
// "stat + tagline" shared between the inline share button and the
// top-right icon menu.
// ============================================================================

interface ShareMeta {
  stat: string
  tagline: string
}

const STORY_SHARE_META: Record<string, ShareMeta> = {
  "smart-followers": {
    stat: `${MOCK_DATA.smartFollowers.total} smart followers`,
    tagline: "You are followed by signal, not noise.",
  },
  "notable-followers": {
    stat: `Notable Score ${MOCK_DATA.notableScore}`,
    tagline: "The people who follow you define your signal.",
  },
  "inner-circle": {
    stat: `Inner circle of ${MOCK_DATA.innerCircle.length}`,
    tagline: "Trust is mutual. These people prove it.",
  },
  community: {
    stat: `${MOCK_DATA.communities[0].name} maxi (${MOCK_DATA.communities[0].percentage}%)`,
    tagline: "You are what your graph says you are.",
  },
  rank: {
    stat: `${MOCK_DATA.rank.percentile} on REP Network`,
    tagline: "Reputation isn't given. It's proven.",
  },
  "share-magnet": {
    stat: `${MOCK_DATA.shareMagnet.percentile} DeFi Power User`,
    tagline: "Badges earned, not bought.",
  },
  "onchain-snapshot": {
    stat: `Onchain since ${MOCK_DATA.onchain.walletAge}`,
    tagline: "Every tx leaves a trail. Mine tells a story.",
  },
  ecosystem: {
    stat: `${MOCK_DATA.ecosystem.topChains[0].name} maxi`,
    tagline: "Chains chosen, not assigned.",
  },
  "wallet-age": {
    stat: `${new Date().getFullYear() - parseInt(MOCK_DATA.onchain.walletAge)} years onchain`,
    tagline: "Onchain veterans are the backbone of web3.",
  },
  "defi-power": {
    stat: `${MOCK_DATA.onchain.protocols} protocols explored`,
    tagline: "True DeFi natives build, they don't speculate.",
  },
  summary: {
    stat: `REP Score ${MOCK_DATA.summary.repScore}`,
    tagline: MOCK_DATA.summary.aiOneLiner,
  },
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

function CountUp({ 
  end, 
  duration = 2000, 
  prefix = "", 
  suffix = "" 
}: { 
  end: number
  duration?: number
  prefix?: string
  suffix?: string 
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>
}

function AnimatedBar({ 
  percentage, 
  delay = 0 
}: { 
  percentage: number
  delay?: number 
}) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), delay)
    return () => clearTimeout(timer)
  }, [percentage, delay])

  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div 
        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

/**
 * Premium story card chrome:
 *  - silver/platinum 1px gradient border + soft outer glow
 *  - seeded mycelium background (unique per card)
 *  - optional avatar+handle header (data / summary)
 *  - "Verified by REP • rep.xyz" screenshot watermark
 */
function StoryCard({
  children,
  label,
  isSummary = false,
  variant = "data",
  seedKey,
  reactions,
}: {
  children: React.ReactNode
  label: string
  isSummary?: boolean
  variant?: "data" | "prompt"
  seedKey?: string
  reactions?: { upvotes?: number; comments?: number }
}) {
  const seed = seedFromString(seedKey ?? label)
  const showUserHeader = variant === "data" || isSummary
  const showFooter = variant === "data" || isSummary
  const user = MOCK_DATA.user

  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-[20px] border border-line bg-card-bg animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Subtle neural-mesh + grid pattern */}
      <StoryCardBackground seed={seed} opacity={isSummary ? 0.06 : 0.08} />

      <div className="relative z-[1] p-6">
        {showUserHeader && (
          <div className="mb-5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-line-strong">
                <Image
                  src={user.avatarUrl}
                  alt={user.handle}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[14px] font-medium text-ink">
                  @{user.handle}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                  <span>RANK 6</span>
                  <span>·</span>
                  <span>4h</span>
                </div>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1 rounded-full border border-accent/30 bg-accent-dim px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              <Check size={10} />
              VERIFIED
            </div>
          </div>
        )}

        {/* Slide kicker — mono-cap eyebrow above content */}
        <div className="kicker mb-5 !text-[12px] !tracking-[0.24em]">
          {label}
        </div>

        {children}

        {/* Reaction footer — M5 reference */}
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

/** Inline "Share to X / Save Image" action pair for the bottom of each
 * shareable card. Uses the central STORY_SHARE_META lookup so the stat +
 * tagline stay consistent between the inline row and the top-right icon. */
function ShareButton({ storyId }: { storyId: string }) {
  const meta = STORY_SHARE_META[storyId]
  if (!meta) return null
  return (
    <StoryShareActions
      storyId={storyId}
      stat={meta.stat}
      tagline={meta.tagline}
      handle={MOCK_DATA.user.handle}
    />
  )
}

/** Hero stat — minimal cyan-accented mono number. */
function BigStat({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center py-1">
      <div className="num text-7xl font-medium leading-none tracking-[-0.02em] text-ink">
        {children}
      </div>
    </div>
  )
}

/** Sub-stat cell with a tiny leading icon. */
function SubStat({
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

/** Italic Fraunces pull quote — the viral hook of every card. */
function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 border-l-2 border-accent/60 pl-3 font-serif text-sm italic leading-[1.45] text-ink-mute">
      {children}
    </p>
  )
}

// ============================================================================
// STORY SLIDE COMPONENTS
// ============================================================================

function SmartFollowersStory() {
  const data = MOCK_DATA.smartFollowers
  return (
    <StoryCard label="SMART FOLLOWERS" seedKey="smart-followers">
      <div className="mb-5 text-center">
        <BigStat>
          <CountUp end={data.total} />
        </BigStat>
        <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Smart Followers
        </div>
      </div>
      <div className="mb-5 grid grid-cols-3 gap-3 rounded-xl border border-border/40 bg-background/20 p-3">
        <SubStat icon={Briefcase} value={data.vcs} label="VCs" />
        <SubStat icon={Layers} value={data.projects} label="Projects" />
        <SubStat icon={Users} value={data.influencers} label="Influencers" />
      </div>
      <PullQuote>You are followed by signal, not noise.</PullQuote>
      <ShareButton storyId="smart-followers" />
    </StoryCard>
  )
}

function NotableFollowersStory() {
  return (
    <StoryCard label="NOTABLE FOLLOWERS" seedKey="notable-followers">
      <div className="mb-5 text-center">
        <BigStat>{MOCK_DATA.notableScore.toFixed(1)}</BigStat>
        <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Notable Score
        </div>
      </div>
      <div className="mb-5 space-y-2">
        {MOCK_DATA.notableFollowers.slice(0, 5).map((f, i) => (
          <div
            key={f.handle}
            className="flex animate-in fade-in slide-in-from-left-4 items-center gap-3 rounded-lg border border-border/40 bg-background/20 p-2"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}
          >
            <div className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-border/60">
              <Image
                src={f.avatarUrl}
                alt={f.handle}
                fill
                sizes="36px"
                className="object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-border/60 bg-background text-[9px] font-bold text-foreground/70">
                {i + 1}
              </div>
            </div>
            <div className="flex-1 text-sm font-medium text-foreground">
              {f.handle}
            </div>
            <div className="font-mono text-sm font-semibold text-foreground">
              {f.score}
            </div>
          </div>
        ))}
      </div>
      <PullQuote>The people who follow you define your signal.</PullQuote>
      <ShareButton storyId="notable-followers" />
    </StoryCard>
  )
}

function InnerCircleStory() {
  const avgTrust = Math.round(
    MOCK_DATA.innerCircle.reduce((acc, c) => acc + c.score, 0) /
      MOCK_DATA.innerCircle.length,
  )
  return (
    <StoryCard label="INNER CIRCLE" seedKey="inner-circle">
      <div className="mb-5 text-center">
        <BigStat>{avgTrust}</BigStat>
        <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Avg Trust Score
        </div>
      </div>
      <div className="mb-5 space-y-2">
        {MOCK_DATA.innerCircle.map((c, i) => (
          <div
            key={c.handle}
            className="flex animate-in fade-in zoom-in-95 items-center gap-3 rounded-xl border border-border/40 bg-background/20 p-3"
            style={{ animationDelay: `${i * 150}ms`, animationFillMode: "backwards" }}
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-border/60">
              <Image
                src={c.avatarUrl}
                alt={c.handle}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                {c.handle}
              </div>
              <div className="text-xs text-muted-foreground">Trust Score</div>
            </div>
            <div className="font-mono text-xl font-bold text-positive">
              {c.score}
            </div>
          </div>
        ))}
      </div>
      <PullQuote>Trust is mutual. These people prove it.</PullQuote>
      <ShareButton storyId="inner-circle" />
    </StoryCard>
  )
}

function CommunityStory() {
  const top = MOCK_DATA.communities[0]
  return (
    <StoryCard label="YOUR COMMUNITY" seedKey="community">
      <div className="mb-5 text-center">
        <BigStat>{top.percentage}%</BigStat>
        <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          {top.name} Maxi
        </div>
      </div>
      <div className="mb-5 space-y-3">
        {MOCK_DATA.communities.map((c, i) => {
          const colors =
            COMMUNITY_COLORS[c.name] || {
              bg: "bg-primary/20",
              text: "text-primary",
              bar: "bg-primary",
            }
          return (
            <div
              key={c.name}
              className="animate-in fade-in slide-in-from-right-4 space-y-1.5"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}
            >
              <div className="flex items-center justify-between text-sm">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                >
                  {c.name}
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  {c.percentage}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`}
                  style={{
                    width: `${c.percentage * 2.5}%`,
                    transitionDelay: `${i * 150}ms`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <PullQuote>You are what your graph says you are.</PullQuote>
      <ShareButton storyId="community" />
    </StoryCard>
  )
}

function RankStory() {
  const data = MOCK_DATA.rank
  const rankTier = MOCK_DATA.summary.rankTier
  const tierInfo = RANK_TIERS.find(t => t.name === rankTier)

  return (
    <StoryCard label="YOUR RANK" seedKey="rank">
      <div className="mb-4 flex justify-center">
        <div className="relative">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/50 bg-gradient-to-br from-primary/30 via-primary/20 to-accent/20 ${rankStyles[rankTier].glow}`}
          >
            <span className={`text-3xl font-bold ${rankStyles[rankTier].color}`}>
              {rankTier}
            </span>
          </div>
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/30 bg-background px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Top {tierInfo?.percentile}%
          </div>
        </div>
      </div>

      <div className="mb-5 text-center">
        <BigStat>{data.percentile}</BigStat>
        <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          among {data.totalUsers.toLocaleString()} identities
        </div>
      </div>
      <div className="mb-5">
        <div className="relative h-2.5 overflow-hidden rounded-full bg-muted/60">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-positive transition-all duration-1000"
            style={{ width: "97%" }}
          />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-primary bg-foreground shadow-[0_0_10px_var(--accent-glow)] transition-all duration-1000"
            style={{ left: "calc(97% - 8px)" }}
          />
        </div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-border/40 bg-background/20 p-3">
        <SubStat icon={Star} value={<CountUp end={data.rep} />} label="REP" />
        <SubStat
          icon={Crown}
          value={`#${data.position.toLocaleString()}`}
          label="Position"
        />
      </div>
      <PullQuote>{"Reputation isn't given. It's proven."}</PullQuote>
      <ShareButton storyId="rank" />
    </StoryCard>
  )
}

function ShareMagnetStory() {
  const data = MOCK_DATA.shareMagnet
  return (
    <StoryCard label="SHARE MAGNET" seedKey="share-magnet">
      <div className="mb-5 text-center">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-positive/15 px-3 py-1 text-xs font-medium text-positive">
          <Zap className="h-3 w-3" />
          {data.percentile} DeFi Power User
        </div>
        <BigStat>
          $<CountUp end={data.volume} />M
        </BigStat>
        <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Total Volume
        </div>
      </div>
      <div className="mb-5 flex flex-wrap justify-center gap-2">
        {data.badges.map((badge, i) => (
          <span
            key={badge}
            className="animate-in fade-in zoom-in-95 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-xs font-medium text-foreground"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}
          >
            {badge}
          </span>
        ))}
      </div>
      <PullQuote>Badges earned, not bought.</PullQuote>
      <ShareButton storyId="share-magnet" />
    </StoryCard>
  )
}

function OnchainSnapshotStory() {
  const data = MOCK_DATA.onchain
  return (
    <StoryCard label="ONCHAIN SNAPSHOT" seedKey="onchain-snapshot">
      <div className="mb-5 text-center">
        <BigStat>
          $<CountUp end={data.totalValue} />
        </BigStat>
        <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Portfolio Value
        </div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-border/40 bg-background/20 p-3">
        <SubStat icon={Network} value={data.chains} label="Chains" />
        <SubStat icon={Coins} value={data.protocols} label="Protocols" />
        <SubStat icon={ImageIcon} value={data.nfts} label="NFTs" />
        <SubStat
          icon={Activity}
          value={data.transactions.toLocaleString()}
          label="Txns"
        />
      </div>
      <div className="mb-5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
          <Calendar className="h-3 w-3" />
          Onchain since {data.walletAge}
        </span>
      </div>
      <PullQuote>{"Every tx leaves a trail. Mine tells a story."}</PullQuote>
      <ShareButton storyId="onchain-snapshot" />
    </StoryCard>
  )
}

function EcosystemStory() {
  const data = MOCK_DATA.ecosystem
  const topChain = data.topChains[0]
  return (
    <StoryCard label="YOUR ECOSYSTEM" seedKey="ecosystem">
      <div className="mb-5 text-center">
        <BigStat>{topChain.percentage}%</BigStat>
        <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          {topChain.name} Activity
        </div>
      </div>
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <Network className="h-3 w-3" /> Chain Activity
        </div>
        <div className="space-y-2">
          {data.topChains.map((chain, i) => (
            <div key={chain.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">{chain.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {chain.percentage}%
                </span>
              </div>
              <AnimatedBar percentage={chain.percentage * 2} delay={i * 100} />
            </div>
          ))}
        </div>
      </div>
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <Coins className="h-3 w-3" /> Top Protocols
        </div>
        <div className="flex flex-wrap gap-2">
          {data.topProtocols.map(protocol => (
            <span
              key={protocol}
              className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {protocol}
            </span>
          ))}
        </div>
      </div>
      <PullQuote>Chains chosen, not assigned.</PullQuote>
      <ShareButton storyId="ecosystem" />
    </StoryCard>
  )
}

function WalletAgeStory() {
  const data = MOCK_DATA.onchain
  const yearsOnchain = new Date().getFullYear() - parseInt(data.walletAge)

  return (
    <StoryCard label="WALLET AGE" seedKey="wallet-age">
      <div className="mb-5 text-center">
        <BigStat>
          <CountUp end={yearsOnchain} />
        </BigStat>
        <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Years Onchain
        </div>
      </div>
      <div className="mb-5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-positive/15 px-3 py-1 text-xs font-medium text-positive">
          <Calendar className="h-3 w-3" />
          Active since {data.walletAge}
        </span>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-border/40 bg-background/20 p-3">
        <SubStat
          icon={Activity}
          value={data.transactions.toLocaleString()}
          label="Total Txns"
        />
        <SubStat icon={Network} value={data.chains} label="Chains Used" />
      </div>
      <PullQuote>Onchain veterans are the backbone of web3.</PullQuote>
      <ShareButton storyId="wallet-age" />
    </StoryCard>
  )
}

function DefiPowerStory() {
  const data = MOCK_DATA.onchain
  const protocols = MOCK_DATA.ecosystem.topProtocols

  return (
    <StoryCard label="DEFI POWER" seedKey="defi-power">
      <div className="mb-5 text-center">
        <BigStat>
          <CountUp end={data.protocols} />
        </BigStat>
        <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Protocols Used
        </div>
      </div>
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <TrendingUp className="h-3 w-3" /> Top Protocols
        </div>
        <div className="space-y-2">
          {protocols.map((protocol, i) => (
            <div
              key={protocol}
              className="flex animate-in fade-in slide-in-from-left-4 items-center gap-3 rounded-lg border border-border/40 bg-background/20 p-2.5"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15">
                <span className="font-mono text-xs font-bold text-primary">
                  {i + 1}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {protocol}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
          <Zap className="h-3 w-3" />
          DeFi Native
        </span>
      </div>
      <PullQuote>True DeFi natives build, they don&apos;t speculate.</PullQuote>
      <ShareButton storyId="defi-power" />
    </StoryCard>
  )
}

function ConnectWalletPrompt({ onConnect, onSkip }: { onConnect: () => void; onSkip: () => void }) {
  return (
      <StoryCard label="CONNECT WALLET" variant="prompt" seedKey="connect-wallet">
        <div className="text-center">
          <div className="mx-auto mb-5 flex items-center justify-center gap-3">
            <span className="text-5xl font-bold tracking-tight glow text-primary flex items-center leading-none">
              <span className="text-primary">+</span>
              <span className="italic">REP</span>
            </span>
            <span className="h-12 w-px bg-border/60" aria-hidden="true" />
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
              <Wallet className="h-6 w-6 text-primary" />
            </span>
          </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {"There's more to your story."}
        </h3>
        <p className="text-foreground/70 text-sm mb-2">
          Connect your wallet to reveal onchain reputation.
        </p>
        <p className="text-positive text-sm font-medium mb-6">
          +35 REP bonus for full verification
        </p>
        <Button 
          className="w-full bg-foreground text-background hover:bg-foreground/90 mb-3"
          onClick={onConnect}
        >
          Connect Wallet
        </Button>
        <button 
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 mx-auto"
        >
          Skip for now <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </StoryCard>
  )
}

function ConnectXPrompt({ onConnect, onSkip }: { onConnect: () => void; onSkip: () => void }) {
  return (
      <StoryCard label="CONNECT X" variant="prompt" seedKey="connect-x">
        <div className="text-center">
          <div className="mx-auto mb-5 flex items-center justify-center gap-3">
            <span className="text-5xl font-bold tracking-tight glow text-primary flex items-center leading-none">
              <span className="text-primary">+</span>
              <span className="italic">REP</span>
            </span>
            <span className="h-12 w-px bg-border/60" aria-hidden="true" />
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
              <Twitter className="h-6 w-6 text-primary" />
            </span>
          </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Unlock your social graph.
        </h3>
        <p className="text-foreground/70 text-sm mb-2">
          Connect X to see who follows you and why it matters.
        </p>
        <p className="text-positive text-sm font-medium mb-6">
          +50 REP bonus for full verification
        </p>
        <Button 
          className="w-full bg-foreground text-background hover:bg-foreground/90 mb-3"
          onClick={onConnect}
        >
          Connect X
        </Button>
        <button 
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 mx-auto"
        >
          Skip for now <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </StoryCard>
  )
}

function SubscribePrompt({ onContinue }: { onContinue: () => void }) {
  return (
    <StoryCard label="STAY CONNECTED" variant="prompt" seedKey="subscribe-rep">
      <div className="text-center">
        <div className="mx-auto mb-5 flex items-center justify-center">
          <span className="text-5xl font-bold tracking-tight glow text-primary flex items-center leading-none">
            <span className="text-primary">+</span>
            <span className="italic">REP</span>
          </span>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Follow @R3P
        </h3>
        <p className="text-foreground/70 text-sm mb-6">
          Get updates on new features, leaderboard drops, and reputation insights.
        </p>
        <Button 
          className="w-full bg-foreground text-background hover:bg-foreground/90 mb-3"
          onClick={() => {
            window.open("https://x.com/rep_hq", "_blank")
            onContinue()
          }}
        >
          Follow @R3P
        </Button>
        <button 
          onClick={onContinue}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 mx-auto"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </StoryCard>
  )
}

function SummaryStory({
  onClaim,
  hasWallet,
  hasX,
  skippedX,
  onConnectX,
}: {
  onClaim: () => void
  hasWallet: boolean
  hasX: boolean
  skippedX?: boolean
  onConnectX?: () => void
}) {
  const data = MOCK_DATA.summary
  const cardType =
    hasWallet && hasX
      ? "Full REP Card"
      : hasX
        ? "Social REP Card"
        : "Onchain REP Card"
  const isIncomplete = !hasX || !hasWallet

  // Sub-stats that make sense for every path. Rank percentile uses the
  // same number the "YOUR RANK" slide just showed, so the final card
  // reads as a recap of what the user already walked through.
  const stats = [
    { label: "Signal", value: data.signal },
    { label: "Communities", value: data.communities },
    { label: "Rank", value: MOCK_DATA.rank.percentile },
  ]

  return (
    <RepCardStory
      handle={data.handle}
      avatarUrl={data.avatarUrl}
      repScore={data.repScore}
      overallRank={MOCK_DATA.rank.position}
      totalUsers={MOCK_DATA.rank.totalUsers}
      aiOneLiner={data.aiOneLiner}
      cardType={cardType}
      rankTier={data.rankTier}
      stats={stats}
      notableFollowers={MOCK_DATA.notableFollowers}
      achievements={data.achievements}
      isIncomplete={isIncomplete}
      footer={
        <div className="space-y-3">
          {skippedX && onConnectX && (
            <button
              onClick={onConnectX}
              className="w-full rounded-lg border border-dashed border-amber-500/50 bg-amber-500/10 p-3 transition-colors hover:bg-amber-500/20"
            >
              <div className="flex items-center justify-center gap-2 text-amber-400">
                <Twitter className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Connect X for full stories
                </span>
              </div>
              <p className="mt-1 text-xs text-amber-400/70">+50 REP bonus</p>
            </button>
          )}
          <Button
            onClick={onClaim}
            className="h-12 w-full bg-primary text-base font-semibold text-background hover:bg-primary/90"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Seal Your Reputation
          </Button>
        </div>
      }
    />
  )
}

// ============================================================================
// MAIN STORIES PAGE COMPONENT
// ============================================================================

function StoriesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSource = (searchParams.get("source") || "x") as AuthSource

  const [primarySource] = useState<AuthSource>(initialSource)
  const [hasConnectedSecondary, setHasConnectedSecondary] = useState(false)
  const [skippedSecondary, setSkippedSecondary] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  // Build the story sequence based on the primary source and whether secondary is connected
  const buildStorySequence = useCallback(() => {
    if (primarySource === "x") {
      // X Path: X stories → connect wallet prompt → (wallet stories if connected) → subscribe → summary
      const baseStories = X_PATH_STORIES.slice(0, 6) // Smart, Notable, Inner, Community, Rank, ShareMagnet
      const connectPrompt = X_PATH_STORIES.find(s => s.id === "connect-wallet")!
      const subscribePrompt = X_PATH_STORIES.find(s => s.id === "subscribe-rep")!
      const summary = X_PATH_STORIES.find(s => s.id === "summary")!

      if (hasConnectedSecondary) {
        return [...baseStories, ...WALLET_BONUS_STORIES, subscribePrompt, summary]
      } else if (skippedSecondary) {
        return [...baseStories, subscribePrompt, summary]
      } else {
        return [...baseStories, connectPrompt, subscribePrompt, summary]
      }
    } else {
      // Wallet Path: Wallet stories → connect X prompt → (X stories if connected) → subscribe → summary
      const baseStories = WALLET_PATH_STORIES.slice(0, 4) // Onchain, Ecosystem, WalletAge, DefiPower
      const connectPrompt = WALLET_PATH_STORIES.find(s => s.id === "connect-x")!
      const subscribePrompt = WALLET_PATH_STORIES.find(s => s.id === "subscribe-rep")!
      const summary = WALLET_PATH_STORIES.find(s => s.id === "summary")!

      if (hasConnectedSecondary) {
        return [...baseStories, ...X_BONUS_STORIES, subscribePrompt, summary]
      } else if (skippedSecondary) {
        return [...baseStories, subscribePrompt, summary]
      } else {
        return [...baseStories, connectPrompt, subscribePrompt, summary]
      }
    }
  }, [primarySource, hasConnectedSecondary, skippedSecondary])

  const stories = buildStorySequence()
  const totalStories = stories.length

  const goNext = useCallback(() => {
    if (currentIndex < totalStories - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, totalStories])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex])

  const handleClaim = () => {
    // The chat-unlock celebration now lives on the profile page (shown once
    // after the user lands there post-claim), so stories → claim directly.
    router.push("/claim")
  }

  const handleConnectSecondary = () => {
    // In real app, this would trigger OAuth/wallet connection
    // For now, simulate successful connection
    setHasConnectedSecondary(true)
    // Move to first of the bonus stories
    setCurrentIndex(currentIndex + 1)
  }

  const handleSkipSecondary = () => {
    setSkippedSecondary(true)
    goNext()
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "Escape") router.push("/")
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goNext, goPrev, router])

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
    setTouchStart(null)
  }

  // Click navigation (right 70% = next, left 30% = prev)
  const handleAreaClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // Don't navigate if clicking on buttons
    if (target.closest("button")) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width

    if (percentage > 0.7) goNext()
    else if (percentage < 0.3) goPrev()
  }

  // Track if X was skipped (for wallet-first users)
  const skippedX = primarySource === "wallet" && skippedSecondary && !hasConnectedSecondary

  const renderStory = () => {
    const story = stories[currentIndex]
    if (!story) return null

    switch (story.id) {
      case "smart-followers": return <SmartFollowersStory />
      case "notable-followers": return <NotableFollowersStory />
      case "inner-circle": return <InnerCircleStory />
      case "community": return <CommunityStory />
      case "rank": return <RankStory />
      case "share-magnet": return <ShareMagnetStory />
      case "onchain-snapshot": return <OnchainSnapshotStory />
      case "ecosystem": return <EcosystemStory />
      case "wallet-age": return <WalletAgeStory />
      case "defi-power": return <DefiPowerStory />
      case "connect-wallet": return <ConnectWalletPrompt onConnect={handleConnectSecondary} onSkip={handleSkipSecondary} />
      case "connect-x": return <ConnectXPrompt onConnect={handleConnectSecondary} onSkip={handleSkipSecondary} />
      case "subscribe-rep": return <SubscribePrompt onContinue={goNext} />
      case "summary": return (
        <SummaryStory 
          onClaim={handleClaim} 
          hasWallet={primarySource === "wallet" || hasConnectedSecondary}
          hasX={primarySource === "x" || hasConnectedSecondary}
          skippedX={skippedX}
          onConnectX={skippedX ? handleConnectSecondary : undefined}
        />
      )
      default: return null
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col story-grid-bg"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bars — slim, M5 reference */}
      <div className="flex gap-1 p-4">
        {stories.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`flex-1 h-[2px] rounded-full transition-colors ${
              i === currentIndex
                ? "bg-accent shadow-[0_0_6px_rgba(140,213,254,0.5)]"
                : i < currentIndex
                  ? "bg-accent/50"
                  : "bg-line-strong"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Top-right share icon — available on every shareable slide. Opens
          a small "Share to X / Save Image" menu sourced from the same
          central STORY_SHARE_META as the inline row at the card footer. */}
      {stories[currentIndex]?.shareable &&
        STORY_SHARE_META[stories[currentIndex].id] && (
          <div className="absolute right-4 top-4 z-10">
            <StoryShareActions
              variant="icon"
              storyId={stories[currentIndex].id}
              stat={STORY_SHARE_META[stories[currentIndex].id].stat}
              tagline={STORY_SHARE_META[stories[currentIndex].id].tagline}
              handle={MOCK_DATA.user.handle}
            />
          </div>
        )}

      {/* Story content area */}
      <div 
        className="flex-1 flex items-center justify-center px-4 cursor-pointer"
        onClick={handleAreaClick}
      >
        <div key={`${currentIndex}-${stories[currentIndex]?.id}`}>
          {renderStory()}
        </div>
      </div>

      {/* Counter */}
      <div className="pb-6 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
        <Num>{currentIndex + 1}</Num> / <Num>{totalStories}</Num>
      </div>
    </div>
  )
}

function StoriesFallback() {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
    </div>
  )
}

export default function StoriesPage() {
  return (
    <Suspense fallback={<StoriesFallback />}>
      <StoriesContent />
    </Suspense>
  )
}
