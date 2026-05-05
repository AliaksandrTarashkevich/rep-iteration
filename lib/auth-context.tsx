"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react"
import { getAvatarUrl } from "@/lib/avatars"

// LocalStorage keys for persisting lightweight onboarding/session state.
// NOTE: This is a mock auth layer — in production these would live server-side.
const LS_AUTH_KEY = "rep:auth"
const LS_CHATS_UNLOCKED_SEEN = "rep:chats_unlocked_seen"
const LS_CHAT_TUTORIAL_DISMISSED = "rep:chat_tutorial_dismissed"
// Set of achievement ids the user has already seen on the /achievements page.
// Used to distinguish the "red dot" (unseen) from the "blue dot" (seen but
// not yet minted) notification in the nav.
const LS_SEEN_ACHIEVEMENTS = "rep:seen_achievements"

// Toggle this to switch between authenticated and guest states
// Set to false for landing page first experience (guests)
const MOCK_AUTH = false

export interface Connection {
  platform: "twitter" | "wallet" | "discord" | "telegram" | "farcaster" | "solana" | "evm" | "google"
  handle?: string
  address?: string
  connected: boolean
  comingSoon?: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  imageUrl?: string // Achievement badge image
  category: "og" | "community" | "normie"
  rarity: "common" | "rare" | "epic" | "legendary"
  repReward: number
  status: "minted" | "available" | "locked"
  requirements?: string
  progress?: number
  maxProgress?: number
  isNew?: boolean // For celebration overlay
  network?: "base" | "ethereum" | "bnb" | "polygon" | "arbitrum" | "solana" | "polymarket" // Chain/network filter
}

export interface UserMetrics {
  smartFollowers: number
  communities: number
  transactions: number
  pnl: string
  protocols: number
}

export interface Chat {
  id: string
  slug: string
  name: string
  description: string
  members: number
  requirement: string
  isAccessible: boolean
  avgRep: number
  unread: number
}

// Rank tier system with percentiles
// ꙮ = Top 0.5% - Top-tier moderated, strategic
// yo = Top 2% - Inner circle, priority
// ToT = Top 5% - Rising stars, networking
// roko = Top 15% - Contributors
// droog = Top 35% - Path-to-rank guidance
// cicada = Top 65% - Clear upgrade path
// pilgrim = Top 100% - Onboarding
export type RankTier = "ꙮ" | "yo" | "ToT" | "roko" | "droog" | "cicada" | "pilgrim"

export const RANK_TIERS: { name: RankTier; percentile: number; description: string }[] = [
  { name: "ꙮ", percentile: 0.5, description: "Top-tier moderated, strategic" },
  { name: "yo", percentile: 2, description: "Inner circle, priority" },
  { name: "ToT", percentile: 5, description: "Rising stars, networking" },
  { name: "roko", percentile: 15, description: "Contributors" },
  { name: "droog", percentile: 35, description: "Path-to-rank guidance" },
  { name: "cicada", percentile: 65, description: "Clear upgrade path" },
  { name: "pilgrim", percentile: 100, description: "Onboarding" },
]

export function getRankFromPercentile(percentile: number): RankTier {
  if (percentile <= 0.5) return "ꙮ"
  if (percentile <= 2) return "yo"
  if (percentile <= 5) return "ToT"
  if (percentile <= 15) return "roko"
  if (percentile <= 35) return "droog"
  if (percentile <= 65) return "cicada"
  return "pilgrim"
}

export interface User {
  handle: string
  displayName: string
  avatarUrl: string | null
  walletAddress: string
  totalRep: number
  rank: number
  totalUsers: number
  percentile: number
  level: number
  xp: number
  xpToNextLevel: number
  aiOneLiner: string
  metrics: UserMetrics
  email?: string
  rankTier: RankTier
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  connections: Connection[]
  achievements: Achievement[]
  chats: Chat[]
  hasTwitter: boolean
  hasWallet: boolean
  hasEmail: boolean
  /**
   * Count of available achievements the user has NOT yet seen on the
   * achievements page. Surfaced as a red dot in the nav — "you have new
   * stuff to look at".
   */
  unseenAchievementsCount: number
  /**
   * Count of available achievements the user HAS seen but has not minted
   * yet. Surfaced as a blue dot once the red "unseen" count drops to zero —
   * "you've seen them, now go claim them".
   */
  mintableAchievementsCount: number
  /** True once the user has seen the "chats unlocked" celebration popup. */
  hasSeenChatsUnlocked: boolean
  /** True once the user has dismissed the in-chat tutorial banner. */
  chatTutorialDismissed: boolean
  login: (options?: { walletAddress?: string }) => void
  logout: () => void
  setEmail: (email: string) => void
  markChatsUnlockedSeen: () => void
  dismissChatTutorial: () => void
  /**
   * Marks every currently-available achievement as "seen", flipping the
   * nav badge from red (unseen) to blue (seen-and-mintable). Called when
   * the user opens the /achievements page.
   */
  markAchievementsSeen: () => void
}

const mockUser: User = {
  handle: "nord_monkey",
  displayName: "Nord Monkey",
  avatarUrl: getAvatarUrl("nord_monkey"),
  walletAddress: "0x1a2b...9f0e",
  totalRep: 895,
  rank: 238,
  totalUsers: 1256,
  percentile: 97,
  level: 4,
  xp: 2450,
  xpToNextLevel: 3000,
  aiOneLiner: "Chief Vampire Officer hacking neon coordination graphs.",
  metrics: {
    smartFollowers: 448,
    communities: 5,
    transactions: 14847,
    pnl: "+$2.1M",
    protocols: 187,
  },
  rankTier: "yo", // Top 2% - Inner circle
}

const mockConnections: Connection[] = [
  { platform: "twitter", handle: "@tradoor", connected: true },
  { platform: "wallet", address: "0x1a2b...9f0e", connected: true },
  { platform: "evm", connected: false, comingSoon: true },
  { platform: "solana", connected: false, comingSoon: true },
  { platform: "farcaster", connected: false, comingSoon: true },
  { platform: "telegram", connected: false, comingSoon: true },
  { platform: "google", connected: false, comingSoon: true },
]

const mockAchievements: Achievement[] = [
  {
    id: "early-adopter",
    name: "Early Adopter",
    description: "Joined during invite-only phase",
    icon: "star",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-early-adopter-epic-RB51E7WbBkcb0wPGggjeZCUqX2QYKx.jpg",
    category: "og",
    rarity: "epic",
    repReward: 200,
    status: "minted",
    network: "base",
  },
  {
    id: "dual-identity",
    name: "Dual Identity",
    description: "Connected X + wallet",
    icon: "link",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8-rep-evangelist-epic-LmlDvJDc1iblWmJ3zEu261r1OIZFUU.jpg",
    category: "community",
    rarity: "rare",
    repReward: 150,
    status: "minted",
  },
  {
    id: "high-signal-voice",
    name: "High Signal Voice",
    description: "Top 5% TwitterScore",
    icon: "megaphone",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-high-signal-voice-epic-Kyp6Dy8ev1P0v0zKzfgscLkSa1bMiN.jpg",
    category: "community",
    rarity: "epic",
    repReward: 200,
    status: "available",
    isNew: true,
  },
  {
    id: "community-builder",
    name: "Community Builder",
    description: "High follower/following ratio",
    icon: "users",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-community-builder-rare-eUfNZDHlMqs7ft10MKIocMSl8IQBaN.jpg",
    category: "community",
    rarity: "rare",
    repReward: 150,
    status: "available",
  },
  {
    id: "onchain-explorer",
    name: "Onchain Explorer",
    description: "100+ transactions on Base",
    icon: "compass",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-onchain-explorer-common-0YodFZfOT5i0bciA53X4Yak7Qtvx0v.jpg",
    category: "normie",
    rarity: "common",
    repReward: 100,
    status: "minted",
    network: "base",
  },
  {
    id: "defi-native",
    name: "DeFi Native",
    description: "Interacted with 5+ DeFi protocols",
    icon: "layers",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-onchain-explorer-common-0YodFZfOT5i0bciA53X4Yak7Qtvx0v.jpg",
    category: "normie",
    rarity: "rare",
    repReward: 150,
    status: "locked",
    requirements: "Interact with 5+ DeFi protocols",
    progress: 3,
    maxProgress: 5,
    network: "ethereum",
  },
  {
    id: "rep-evangelist",
    name: "REP Evangelist",
    description: "Invited 5+ friends",
    icon: "share",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8-rep-evangelist-epic-LmlDvJDc1iblWmJ3zEu261r1OIZFUU.jpg",
    category: "community",
    rarity: "epic",
    repReward: 200,
    status: "locked",
    requirements: "Invite 5+ friends to REP Network",
    progress: 2,
    maxProgress: 5,
  },
  {
    id: "follow-dreb",
    name: "Follow Dreb",
    description: "Followed @Dreb on Twitter",
    icon: "heart",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%20558-RvOtlTpRldlSJXxSVrwBc0Vi9JpW7U.png",
    category: "normie",
    rarity: "common",
    repReward: 50,
    status: "available",
  },
  {
    id: "definitive",
    name: "Definitive",
    description: "Completed all profile verifications",
    icon: "award",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%202131330464-DYle5kJfpqRBEBqNB8wt7eD3ShU1ZX.png",
    category: "og",
    rarity: "legendary",
    repReward: 500,
    status: "locked",
    requirements: "Complete all profile verifications",
    progress: 2,
    maxProgress: 5,
  },
  // Network-specific achievements
  {
    id: "bnb-explorer",
    name: "BNB Explorer",
    description: "50+ transactions on BNB Chain",
    icon: "compass",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-onchain-explorer-common-0YodFZfOT5i0bciA53X4Yak7Qtvx0v.jpg",
    category: "normie",
    rarity: "common",
    repReward: 75,
    status: "available",
    network: "bnb",
  },
  {
    id: "bnb-whale",
    name: "BNB Whale",
    description: "Holds 10+ BNB",
    icon: "layers",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-community-builder-rare-eUfNZDHlMqs7ft10MKIocMSl8IQBaN.jpg",
    category: "normie",
    rarity: "rare",
    repReward: 150,
    status: "locked",
    requirements: "Hold 10+ BNB in your wallet",
    progress: 3,
    maxProgress: 10,
    network: "bnb",
  },
  {
    id: "polymarket-oracle",
    name: "Polymarket Oracle",
    description: "Correctly predicted 10+ markets",
    icon: "star",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-early-adopter-epic-RB51E7WbBkcb0wPGggjeZCUqX2QYKx.jpg",
    category: "og",
    rarity: "epic",
    repReward: 200,
    status: "available",
    network: "polymarket",
    isNew: true,
  },
  {
    id: "polymarket-trader",
    name: "Polymarket Trader",
    description: "Traded on 5+ prediction markets",
    icon: "layers",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-high-signal-voice-epic-Kyp6Dy8ev1P0v0zKzfgscLkSa1bMiN.jpg",
    category: "normie",
    rarity: "rare",
    repReward: 125,
    status: "minted",
    network: "polymarket",
  },
  {
    id: "polygon-native",
    name: "Polygon Native",
    description: "Active on Polygon for 6+ months",
    icon: "compass",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-community-builder-rare-eUfNZDHlMqs7ft10MKIocMSl8IQBaN.jpg",
    category: "normie",
    rarity: "rare",
    repReward: 125,
    status: "locked",
    requirements: "Be active on Polygon for 6+ months",
    progress: 4,
    maxProgress: 6,
    network: "polygon",
  },
  {
    id: "arbitrum-degen",
    name: "Arbitrum Degen",
    description: "Used 10+ dApps on Arbitrum",
    icon: "layers",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8-rep-evangelist-epic-LmlDvJDc1iblWmJ3zEu261r1OIZFUU.jpg",
    category: "normie",
    rarity: "epic",
    repReward: 175,
    status: "available",
    network: "arbitrum",
  },
]

const mockChats: Chat[] = [
  {
    id: "1",
    slug: "defi-degens",
    name: "DeFi Degens",
    description: "Top DeFi traders and builders",
    members: 1247,
    requirement: "500+ REP",
    isAccessible: true,
    avgRep: 1420,
    unread: 12,
  },
  {
    id: "2",
    slug: "base-builders",
    name: "Base Builders",
    description: "Builders on Base network",
    members: 892,
    requirement: "Base NFT holder",
    isAccessible: true,
    avgRep: 980,
    unread: 3,
  },
  {
    id: "3",
    slug: "top-polymarket-traders",
    name: "Polymarket 1%",
    description: "Elite prediction market traders",
    members: 847,
    requirement: "PM Trader + $10K volume",
    isAccessible: true,
    avgRep: 1680,
    unread: 27,
  },
  {
    id: "4",
    slug: "whale-watchers",
    name: "Whale Watchers",
    description: "Exclusive high-value traders",
    members: 234,
    requirement: "2000+ REP",
    isAccessible: false,
    avgRep: 2400,
    unread: 0,
  },
]

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(MOCK_AUTH)
  const [user, setUser] = useState<User | null>(MOCK_AUTH ? mockUser : null)
  const [connections, setConnections] = useState<Connection[]>(
    MOCK_AUTH ? mockConnections : []
  )
  const [achievements, setAchievements] = useState<Achievement[]>(
    MOCK_AUTH ? mockAchievements : []
  )
  const [chats, setChats] = useState<Chat[]>(MOCK_AUTH ? mockChats : [])
  const [hasSeenChatsUnlocked, setHasSeenChatsUnlocked] = useState(false)
  const [chatTutorialDismissed, setChatTutorialDismissed] = useState(false)
  // Set of achievement ids the user has already viewed on /achievements.
  // Backed by localStorage so the red/blue nav dot state survives reloads.
  const [seenAchievementIds, setSeenAchievementIds] = useState<Set<string>>(
    () => new Set()
  )

  // Restore persisted auth + onboarding flags on mount (client-only).
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      if (window.localStorage.getItem(LS_AUTH_KEY) === "true") {
        setIsAuthenticated(true)
        setUser(mockUser)
        setConnections(mockConnections)
        setAchievements(mockAchievements)
        setChats(mockChats)
      }
      if (window.localStorage.getItem(LS_CHATS_UNLOCKED_SEEN) === "true") {
        setHasSeenChatsUnlocked(true)
      }
      if (window.localStorage.getItem(LS_CHAT_TUTORIAL_DISMISSED) === "true") {
        setChatTutorialDismissed(true)
      }
      const seen = window.localStorage.getItem(LS_SEEN_ACHIEVEMENTS)
      if (seen) {
        try {
          const arr = JSON.parse(seen)
          if (Array.isArray(arr)) setSeenAchievementIds(new Set(arr))
        } catch {
          // If parse fails, just skip; user will see the red dot again.
        }
      }
    } catch {
      // localStorage unavailable (private mode, etc.) — fall back to defaults.
    }
  }, [])

  const hasTwitter = useMemo(() => connections.some(c => c.platform === "twitter" && c.connected), [connections])
  const hasWallet = useMemo(() => connections.some(c => c.platform === "wallet" && c.connected), [connections])
  const hasEmail = useMemo(() => Boolean(user?.email), [user?.email])

  // Red-dot count: achievements that are ready to claim AND the user has
  // never viewed. Drops to zero the moment they open /achievements.
  const unseenAchievementsCount = useMemo(
    () =>
      achievements.filter(
        a => a.status === "available" && !seenAchievementIds.has(a.id)
      ).length,
    [achievements, seenAchievementIds]
  )

  // Blue-dot count: available achievements the user already saw but hasn't
  // minted yet — a gentle "reminder to claim" indicator.
  const mintableAchievementsCount = useMemo(
    () =>
      achievements.filter(
        a => a.status === "available" && seenAchievementIds.has(a.id)
      ).length,
    [achievements, seenAchievementIds]
  )

  const login = useCallback((options?: { walletAddress?: string }) => {
    setIsAuthenticated(true)

    // If the user connected a real wallet, surface the true address and
    // a shortened form for display. Falls back to the mock address so the
    // X-only path (no wallet yet) still renders correctly.
    const realAddress = options?.walletAddress
    const nextUser: User = realAddress
      ? {
          ...mockUser,
          walletAddress: `${realAddress.slice(0, 6)}...${realAddress.slice(-4)}`,
        }
      : mockUser
    setUser(nextUser)

    const nextConnections = realAddress
      ? mockConnections.map(c =>
          c.platform === "wallet"
            ? {
                ...c,
                address: `${realAddress.slice(0, 6)}...${realAddress.slice(-4)}`,
                connected: true,
              }
            : c,
        )
      : mockConnections
    setConnections(nextConnections)
    setAchievements(mockAchievements)
    setChats(mockChats)
    try {
      window.localStorage.setItem(LS_AUTH_KEY, "true")
    } catch {
      /* noop */
    }
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setUser(null)
    setConnections([])
    setAchievements([])
    setChats([])
    setHasSeenChatsUnlocked(false)
    setChatTutorialDismissed(false)
    setSeenAchievementIds(new Set())
    try {
      window.localStorage.removeItem(LS_AUTH_KEY)
      window.localStorage.removeItem(LS_CHATS_UNLOCKED_SEEN)
      window.localStorage.removeItem(LS_CHAT_TUTORIAL_DISMISSED)
      window.localStorage.removeItem(LS_SEEN_ACHIEVEMENTS)
    } catch {
      /* noop */
    }
  }, [])

  const handleSetEmail = useCallback((email: string) => {
    setUser(prev => prev ? { ...prev, email, totalRep: prev.totalRep + 30 } : null)
  }, [])

  const markChatsUnlockedSeen = useCallback(() => {
    setHasSeenChatsUnlocked(true)
    try {
      window.localStorage.setItem(LS_CHATS_UNLOCKED_SEEN, "true")
    } catch {
      /* noop */
    }
  }, [])

  const dismissChatTutorial = useCallback(() => {
    setChatTutorialDismissed(true)
    try {
      window.localStorage.setItem(LS_CHAT_TUTORIAL_DISMISSED, "true")
    } catch {
      /* noop */
    }
  }, [])

  // Flags every currently-available achievement as "seen". Called once
  // when the user lands on the /achievements page — in the prototype this
  // is the only place unseen → seen can happen.
  const markAchievementsSeen = useCallback(() => {
    setSeenAchievementIds(prev => {
      const next = new Set(prev)
      for (const a of achievements) {
        if (a.status === "available") next.add(a.id)
      }
      try {
        window.localStorage.setItem(
          LS_SEEN_ACHIEVEMENTS,
          JSON.stringify(Array.from(next))
        )
      } catch {
        /* noop */
      }
      return next
    })
  }, [achievements])

  const value = useMemo(() => ({
    isAuthenticated,
    user,
    connections,
    achievements,
    chats,
    hasTwitter,
    hasWallet,
    hasEmail,
    unseenAchievementsCount,
    mintableAchievementsCount,
    hasSeenChatsUnlocked,
    chatTutorialDismissed,
    login,
    logout,
    setEmail: handleSetEmail,
    markChatsUnlockedSeen,
    dismissChatTutorial,
    markAchievementsSeen,
  }), [
    isAuthenticated,
    user,
    connections,
    achievements,
    chats,
    hasTwitter,
    hasWallet,
    hasEmail,
    unseenAchievementsCount,
    mintableAchievementsCount,
    hasSeenChatsUnlocked,
    chatTutorialDismissed,
    login,
    logout,
    handleSetEmail,
    markChatsUnlockedSeen,
    dismissChatTutorial,
    markAchievementsSeen,
  ])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
