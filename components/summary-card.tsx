"use client"

import { useState, useEffect, useRef } from "react"
import { Share2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// ============================================================================
// TYPES
// ============================================================================

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

export interface SummaryCardData {
  // Fixed elements
  handle: string
  avatarUrl?: string
  repScore: number
  overallRank: number
  totalUsers: number
  
  // AI-generated one-liner (from Grok)
  aiOneLiner: string
  
  // Card type
  hasX: boolean
  hasWallet: boolean
  
  // Rank tier
  rankTier?: RankTier
  
  // Dynamic slot 1 - Avatar highlight (priority-based)
  notableFollowers?: { handle: string; avatarUrl?: string }[]  // If 3+ notable
  innerCircle?: { handle: string; avatarUrl?: string }[]       // If X but < 3 notable
  topProtocols?: string[]                                       // If wallet only
  topAchievements?: string[]                                    // Fallback
  
  // Dynamic slots 2-4 - Text highlights (best metrics)
  highlights: Highlight[]
  
  // Fun negative achievements
  funNegative?: FunNegative
  
  // Season info
  season: number
}

interface Highlight {
  type: "twitter_percentile" | "pnl" | "chains" | "wallet_age" | "community" | "transactions" | "assets" | "early_adopter"
  label: string
  value: string
  percentile?: number // Don't show if < 50th percentile
}

interface FunNegative {
  type: "battle_tested" | "battle_scarred" | "survived_trenches" | "gas_station" | "chain_hopper"
  label: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCardType(hasX: boolean, hasWallet: boolean): string {
  if (hasX && hasWallet) return "Full REP Card"
  if (hasX) return "Social REP Card"
  return "Onchain REP Card"
}

function getAvatarHighlightLabel(data: SummaryCardData): string {
  if (data.notableFollowers && data.notableFollowers.length >= 3) {
    return "followed by"
  }
  if (data.innerCircle && data.innerCircle.length > 0) {
    return "your inner circle"
  }
  if (data.topProtocols && data.topProtocols.length > 0) {
    return "power user"
  }
  return "top achievements"
}

function getAvatarHighlightItems(data: SummaryCardData): string[] {
  if (data.notableFollowers && data.notableFollowers.length >= 3) {
    return data.notableFollowers.slice(0, 3).map(f => f.handle)
  }
  if (data.innerCircle && data.innerCircle.length > 0) {
    return data.innerCircle.slice(0, 3).map(f => f.handle)
  }
  if (data.topProtocols && data.topProtocols.length > 0) {
    return data.topProtocols.slice(0, 3)
  }
  return data.topAchievements?.slice(0, 3) || []
}

// ============================================================================
// ANIMATED COUNT COMPONENT
// ============================================================================

function AnimatedCount({ 
  end, 
  duration = 1500,
  prefix = "",
  suffix = ""
}: { 
  end: number
  duration?: number
  prefix?: string
  suffix?: string
}) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

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
  }, [end, duration, isVisible])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

// ============================================================================
// SUMMARY CARD COMPONENT
// ============================================================================

export function SummaryCard({ 
  data, 
  showActions = true,
  onShare,
  onDownload
}: { 
  data: SummaryCardData
  showActions?: boolean
  onShare?: () => void
  onDownload?: () => void
}) {
  const cardType = getCardType(data.hasX, data.hasWallet)
  const avatarLabel = getAvatarHighlightLabel(data)
  const avatarItems = getAvatarHighlightItems(data)
  
  // Filter highlights to only show if above 50th percentile (or always show certain types)
  const visibleHighlights = data.highlights
    .filter(h => !h.percentile || h.percentile >= 50)
    .slice(0, 3)

  const handleShare = () => {
    if (onShare) {
      onShare()
    } else {
      const text = encodeURIComponent(
        `${data.repScore} REP. #${data.overallRank} of ${data.totalUsers.toLocaleString()}. "${data.aiOneLiner}" @R3P #REPNetwork`
      )
      window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank")
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Card Container — minimal Tile aesthetic */}
      <div className="relative rounded-[20px] overflow-hidden border border-line bg-card-bg p-6">

          {/* REP Branding */}
          <div className="absolute top-4 right-4">
            <span className="text-xs font-mono text-muted-foreground tracking-widest">REP</span>
          </div>
          
          {/* Avatar with Rank Badge */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-offset-2 ring-offset-card ${data.rankTier ? rankRingColors[data.rankTier] : "ring-primary"}`}>
                {data.avatarUrl ? (
                  <Image 
                    src={data.avatarUrl} 
                    alt={data.handle}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {data.handle.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {/* Rank tier badge - image */}
              {data.rankTier && (
                <img
                  src={rankBadges[data.rankTier]}
                  alt={data.rankTier}
                  className="absolute -bottom-1 -right-1 h-7 w-7 object-contain z-10 drop-shadow-md"
                />
              )}
            </div>
          </div>
          
          {/* Handle */}
          <p className="text-center text-foreground/80 mb-2">@{data.handle}</p>
          
          {/* AI One-liner */}
          <p className="text-center text-sm text-accent italic mb-4 px-2">
            &quot;{data.aiOneLiner}&quot;
          </p>
          
          {/* REP Score - Main Visual Anchor */}
          <div className="text-center mb-2">
            <span className="text-6xl font-bold text-foreground glow">
              <AnimatedCount end={data.repScore} />
            </span>
            <span className="text-xl text-foreground/60 ml-2">REP</span>
          </div>
          
          {/* Overall Rank */}
          <p className="text-center text-sm text-muted-foreground mb-6">
            #{data.overallRank.toLocaleString()} of {data.totalUsers.toLocaleString()}
          </p>
          
          {/* Avatar Highlight Slot (Slot 1) - Show actual avatars */}
          {data.notableFollowers && data.notableFollowers.length > 0 && (
            <div className="mb-6">
              <p className="text-center text-xs text-muted-foreground uppercase tracking-wider mb-3">
                followed by
              </p>
              <div className="flex justify-center -space-x-2">
                {data.notableFollowers.slice(0, 4).map((follower, i) => (
                  <div 
                    key={i}
                    className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-card"
                    style={{ zIndex: 4 - i }}
                  >
                    {follower.avatarUrl ? (
                      <Image src={follower.avatarUrl} alt={follower.handle} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-medium">
                        {follower.handle.charAt(1).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                {data.notableFollowers.length > 4 && (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground ring-2 ring-card">
                    +{data.notableFollowers.length - 4}
                  </div>
                )}
              </div>
              <div className="flex justify-center flex-wrap gap-1 mt-2">
                {data.notableFollowers.slice(0, 3).map((follower, i) => (
                  <span key={i} className="text-xs text-muted-foreground">{follower.handle}</span>
                ))}
              </div>
            </div>
          )}
          
          {/* Fallback to text-based highlights if no notable followers */}
          {!data.notableFollowers?.length && avatarItems.length > 0 && (
            <div className="mb-6">
              <p className="text-center text-xs text-muted-foreground uppercase tracking-wider mb-3">
                {avatarLabel}
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {avatarItems.map((item, i) => (
                  <div 
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-secondary border border-border text-sm text-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Text Highlights (Slots 2-4) */}
          {visibleHighlights.length > 0 && (
            <div className="space-y-2 mb-6">
              {visibleHighlights.map((highlight, i) => (
                <div 
                  key={i}
                  className="flex justify-between items-center px-3 py-2 rounded-lg bg-muted/50"
                >
                  <span className="text-sm text-foreground/70">{highlight.label}</span>
                  <span className="text-sm font-semibold text-foreground">{highlight.value}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Fun Negative Achievement */}
          {data.funNegative && (
            <div className="flex justify-center mb-6">
              <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-medium border border-warning/30">
                {data.funNegative.label}
              </span>
            </div>
          )}
          
          {/* Card Type & Season */}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{cardType}</span>
            <span>Season {data.season}</span>
          </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-3 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 border-border"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          {onDownload && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 border-border"
              onClick={onDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Save
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MOCK DATA FOR TESTING
// ============================================================================

export const MOCK_SUMMARY_DATA: SummaryCardData = {
  handle: "tradoor",
  avatarUrl: "/images/avatars/avatar-1.jpg",
  repScore: 847,
  overallRank: 3840,
  totalUsers: 128000,
  aiOneLiner: "Chief Vampire Officer hacking neon coordination graphs.",
  hasX: true,
  hasWallet: false,
  rankTier: "yo",
  notableFollowers: [
    { handle: "@vitalik", avatarUrl: "/images/avatars/avatar-2.jpg" },
    { handle: "@cobie", avatarUrl: "/images/avatars/avatar-3.jpg" },
    { handle: "@punk6529", avatarUrl: "/images/avatars/avatar-4.jpg" },
  ],
  highlights: [
    { type: "twitter_percentile", label: "Crypto Twitter", value: "Top 3%", percentile: 97 },
    { type: "community", label: "Primary Community", value: "DeFi Maxi (72%)", percentile: 72 },
    { type: "early_adopter", label: "REP Status", value: "Early Adopter", percentile: 100 },
  ],
  season: 1,
}

export const MOCK_FULL_CARD_DATA: SummaryCardData = {
  handle: "degenwhale",
  avatarUrl: "/images/avatars/avatar-5.jpg",
  repScore: 1247,
  overallRank: 847,
  totalUsers: 128000,
  aiOneLiner: "Multichain degen surfing liquidity waves since genesis.",
  hasX: true,
  hasWallet: true,
  rankTier: "ꙮ",
  notableFollowers: [
    { handle: "@vitalik", avatarUrl: "/images/avatars/avatar-2.jpg" },
    { handle: "@cobie", avatarUrl: "/images/avatars/avatar-3.jpg" },
    { handle: "@tetranode", avatarUrl: "/images/avatars/avatar-4.jpg" },
  ],
  highlights: [
    { type: "twitter_percentile", label: "Crypto Twitter", value: "Top 1%", percentile: 99 },
    { type: "pnl", label: "Total PnL", value: "+$42.8k", percentile: 85 },
    { type: "chains", label: "Active Chains", value: "15 blockchains", percentile: 90 },
    { type: "wallet_age", label: "Onchain Since", value: "2019", percentile: 95 },
  ],
  funNegative: {
    type: "gas_station",
    label: "Gas Station Regular",
  },
  season: 1,
}

export const MOCK_ONCHAIN_CARD_DATA: SummaryCardData = {
  handle: "0x1a2b...3c4d",
  avatarUrl: "/images/avatars/avatar-6.jpg",
  repScore: 623,
  overallRank: 12400,
  totalUsers: 128000,
  aiOneLiner: "Silent protocol explorer mapping the DeFi frontier.",
  hasX: false,
  hasWallet: true,
  rankTier: "cicada",
  topProtocols: ["Uniswap", "Aave", "Compound"],
  highlights: [
    { type: "pnl", label: "Total PnL", value: "-$8.2k", percentile: 30 },
    { type: "chains", label: "Active Chains", value: "8 blockchains", percentile: 75 },
    { type: "transactions", label: "Transactions", value: "4,200 txs", percentile: 80 },
  ],
  funNegative: {
    type: "battle_scarred",
    label: "Battle-scarred Degen",
  },
  season: 1,
}
