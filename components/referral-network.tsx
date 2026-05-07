"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

import { RANK_TIERS, type RankTier } from "@/lib/auth-context"
import { getAvatarUrl } from "@/lib/avatars"
import { SectionTitle } from "@/components/ui/primitives"

// Rank tier styling
const rankStyles: Record<RankTier, { color: string; glow: string }> = {
  "ꙮ": { color: "text-amber-400", glow: "shadow-[0_0_12px_rgba(251,191,36,0.3)]" },
  "yo": { color: "text-primary", glow: "shadow-[0_0_10px_var(--accent-glow)]" },
  "ToT": { color: "text-emerald-400", glow: "shadow-[0_0_10px_rgba(52,211,153,0.25)]" },
  "roko": { color: "text-purple-400", glow: "" },
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

// Referral data type
interface Referral {
  id: string
  handle: string
  rep: number
  generation: 1 | 2 | 3
  rank: RankTier
  avatar: string
  repEarned: number
  children?: Referral[]
}

// Mock referral data with new rank tiers
const mockReferrals: Referral[] = [
  {
    id: "1",
    handle: "adam.eth",
    rep: 2450,
    generation: 1,
    rank: "ꙮ",
    avatar: getAvatarUrl("adam.eth"),
    repEarned: 250,
    children: [
      {
        id: "1-1",
        handle: "seth.sol",
        rep: 1890,
        generation: 2,
        rank: "yo",
        avatar: getAvatarUrl("seth.sol"),
        repEarned: 50,
        children: [
          {
            id: "1-1-1",
            handle: "enos.base",
            rep: 1120,
            generation: 3,
            rank: "roko",
            avatar: getAvatarUrl("enos.base"),
            repEarned: 15,
          },
          {
            id: "1-1-2",
            handle: "kenan",
            rep: 890,
            generation: 3,
            rank: "droog",
            avatar: getAvatarUrl("kenan"),
            repEarned: 10,
          },
        ],
      },
      {
        id: "1-2",
        handle: "builder",
        rep: 670,
        generation: 2,
        rank: "ToT",
        avatar: getAvatarUrl("builder"),
        repEarned: 20,
      },
      {
        id: "1-3",
        handle: "newcomer",
        rep: 210,
        generation: 2,
        rank: "cicada",
        avatar: getAvatarUrl("newcomer"),
        repEarned: 10,
      },
    ],
  },
  {
    id: "2",
    handle: "alice.eth",
    rep: 1240,
    generation: 1,
    rank: "yo",
    avatar: getAvatarUrl("alice.eth"),
    repEarned: 120,
    children: [
      {
        id: "2-1",
        handle: "dev_queen",
        rep: 980,
        generation: 2,
        rank: "roko",
        avatar: getAvatarUrl("dev_queen"),
        repEarned: 45,
        children: [
          {
            id: "2-1-1",
            handle: "proto_kid",
            rep: 190,
            generation: 3,
            rank: "pilgrim",
            avatar: getAvatarUrl("proto_kid"),
            repEarned: 5,
          },
        ],
      },
      {
        id: "2-2",
        handle: "curious_cat",
        rep: 150,
        generation: 2,
        rank: "pilgrim",
        avatar: getAvatarUrl("curious_cat"),
        repEarned: 10,
      },
    ],
  },
  {
    id: "3",
    handle: "maya.sol",
    rep: 890,
    generation: 1,
    rank: "droog",
    avatar: getAvatarUrl("maya.sol"),
    repEarned: 85,
  },
  {
    id: "4",
    handle: "trader_x",
    rep: 430,
    generation: 1,
    rank: "cicada",
    avatar: getAvatarUrl("trader_x"),
    repEarned: 45,
  },
  {
    id: "5",
    handle: "newbie_1",
    rep: 120,
    generation: 1,
    rank: "pilgrim",
    avatar: getAvatarUrl("newbie_1"),
    repEarned: 25,
  },
]

// Stats
const totalConnections = 634
const totalRep = 895

interface ReferralNodeProps {
  referral: Referral
  isLast?: boolean
}

function ReferralNode({ referral, isLast = false }: ReferralNodeProps) {
  const [isExpanded, setIsExpanded] = useState(referral.generation === 1)
  const hasChildren = referral.children && referral.children.length > 0

  return (
    <div className="relative">
      {/* Vertical line from parent */}
      {referral.generation > 1 && (
        <div 
          className="absolute left-0 top-0 w-px bg-border"
          style={{ 
            height: isLast ? "24px" : "100%",
            marginLeft: `${(referral.generation - 2) * 32}px`
          }}
        />
      )}
      
      {/* Horizontal line to node */}
      {referral.generation > 1 && (
        <div 
          className="absolute top-6 h-px bg-border"
          style={{ 
            left: `${(referral.generation - 2) * 32}px`,
            width: "24px"
          }}
        />
      )}

      <div 
        className={cn(
          "flex items-center justify-between py-3 group",
          referral.generation > 1 && "ml-8"
        )}
        style={{ marginLeft: `${(referral.generation - 1) * 32}px` }}
      >
        <div className="flex items-center gap-3">
{/* Avatar with rank tier */}
          <div className="relative flex-shrink-0">
            <div className={`h-10 w-10 rounded-full overflow-hidden ring-2 ring-offset-1 ring-offset-background ${rankRingColors[referral.rank]}`}>
              <img
                src={referral.avatar}
                alt={referral.handle}
                className="h-full w-full object-cover"
              />
            </div>
            {/* Rank tier badge - image */}
            <img
              src={rankBadges[referral.rank]}
              alt={referral.rank}
              className="absolute -bottom-1 -right-1 h-5 w-5 object-contain z-10 drop-shadow-md"
            />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">@{referral.handle}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">{referral.rep.toLocaleString()} REP</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded border",
                referral.generation === 1 && "border-primary/50 text-primary",
                referral.generation === 2 && "border-purple-500/50 text-purple-400",
                referral.generation === 3 && "border-muted-foreground/50 text-muted-foreground"
              )}>
                Gen {referral.generation}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">+{referral.repEarned} REP</span>
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Vertical connecting line */}
          <div 
            className="absolute w-px bg-border"
            style={{ 
              left: `${(referral.generation) * 32 - 8}px`,
              top: 0,
              bottom: 0
            }}
          />
          {referral.children!.map((child, index) => (
            <ReferralNode 
              key={child.id} 
              referral={child} 
              isLast={index === referral.children!.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function ReferralNetwork() {
  const [showAll, setShowAll] = useState(false)
  const displayedReferrals = showAll ? mockReferrals : mockReferrals.slice(0, 3)
  
  return (
    <div className="rep-surface-glass-blur rep-glass-stroke-bright p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionTitle className="text-xl">REFERRAL NETWORK</SectionTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Your network (3 generations deep)
          </p>
        </div>
        
        {/* Rank legend - show top 4 tiers */}
        <div className="flex items-center gap-2">
          {RANK_TIERS.slice(0, 4).map(tier => (
            <div key={tier.name} className="flex items-center gap-1">
              <span className={`text-xs font-bold ${rankStyles[tier.name].color}`}>{tier.name}</span>
              <span className="text-[10px] text-muted-foreground">{tier.percentile}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
        <div>
          <p className="text-xs text-muted-foreground">Total connections</p>
          <p className="text-4xl font-bold text-foreground">{totalConnections}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total REP:</p>
          <p className="text-4xl font-bold text-primary glow">{totalRep}</p>
        </div>
      </div>

      {/* Referral tree */}
      <div className="space-y-1">
        {displayedReferrals.map((referral) => (
          <ReferralNode key={referral.id} referral={referral} />
        ))}
      </div>

      {/* Show all button */}
      {mockReferrals.length > 3 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-primary hover:underline hover:cursor-pointer flex items-center gap-1 mx-auto"
          >
            {showAll ? "Show less" : `Show all (${mockReferrals.length})`}
            <ChevronRight className={cn("h-4 w-4 transition-transform", showAll && "rotate-90")} />
          </button>
        </div>
      )}
    </div>
  )
}
