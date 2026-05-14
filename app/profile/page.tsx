"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getPoolAvatarByIndex } from "@/lib/avatars"
import { ChatsUnlockedOverlay } from "@/components/chats-unlocked-overlay"
import {
  User,
  Copy,
  Share2,
  Play, 
  UserPlus, 
  ChevronRight, 
  Award,
  MessageCircle,
  Twitter,
  Wallet,
  Link2,
  Zap,
  Plus,
  Target,
  CheckCircle2,
  ArrowRight,
  Mail,
  Star,
  Megaphone,
  Users,
  Compass,
  Layers,
  Heart,
  Sparkles,
  Send
} from "lucide-react"
import { PlanetIcon, LeaderboardIcon, Trophy, MedalIcon, UsersGroup, AwardStar } from "@/components/icons"
import { useAuth, type Achievement } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { YourNetworkCard } from "@/components/your-network-card"
import { ConnectedAccounts } from "@/components/connected-accounts"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { PageShell } from "@/components/ui/page-shell"
import { Tile, GlassTile, Pill, Num, MonoCap, SectionTitle } from "@/components/ui/primitives"

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

// Achievement icon mapping
function AchievementIcon({ icon, className }: { icon: string; className?: string }) {
  const iconProps = { className: className || "h-6 w-6" }
  switch (icon) {
    case "star": return <Star {...iconProps} />
    case "link": return <Link2 {...iconProps} />
    case "megaphone": return <Megaphone {...iconProps} />
    case "users": return <Users {...iconProps} />
    case "compass": return <Compass {...iconProps} />
    case "layers": return <Layers {...iconProps} />
    case "share": return <Share2 {...iconProps} />
    case "heart": return <Heart {...iconProps} />
    default: return <Award {...iconProps} />
  }
}

// Rarity styling
function getRarityStyle(rarity: Achievement["rarity"]) {
  switch (rarity) {
    case "legendary":
      return {
        bg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
        border: "border-amber-500/40",
        text: "text-amber-400",
        glow: "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
        badge: "bg-amber-500/20 text-amber-400",
      }
    case "epic":
      return {
        bg: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
        border: "border-purple-500/40",
        text: "text-purple-400",
        glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
        badge: "bg-purple-500/20 text-purple-400",
      }
    case "rare":
      return {
        bg: "bg-gradient-to-br from-primary/20 to-accent/20",
        border: "border-primary/40",
        text: "text-primary",
        glow: "shadow-[0_0_20px_rgba(59,107,138,0.3)]",
        badge: "bg-primary/20 text-primary",
      }
    default: // common
      return {
        bg: "bg-muted/50",
        border: "border-border",
        text: "text-muted-foreground",
        glow: "",
        badge: "bg-muted text-muted-foreground",
      }
  }
}

// Ethereum icon
function EthereumIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || "h-5 w-5"}>
      <path d="M12 1.75l-6.25 10.5L12 16l6.25-3.75L12 1.75zM5.75 13.5L12 22.25l6.25-8.75L12 17.25l-6.25-3.75z"/>
    </svg>
  )
}

// Solana icon
function SolanaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || "h-5 w-5"}>
      <path d="M4.5 18.5l2.5-2.5h13l-2.5 2.5h-13zm0-6l2.5-2.5h13l-2.5 2.5h-13zm15.5-4l-2.5 2.5h-13l2.5-2.5h13z"/>
    </svg>
  )
}

// Farcaster icon
function FarcasterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || "h-5 w-5"}>
      <path d="M3 4h18v2h-2v12h2v2H3v-2h2V6H3V4zm4 2v12h10V6H7zm2 2h6v2H9V8zm0 4h6v2H9v-2z"/>
    </svg>
  )
}

// Telegram icon
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || "h-5 w-5"}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
    </svg>
  )
}

// Platform icon mapping
function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const iconClass = className || "h-4 w-4"
  switch (platform) {
    case "twitter":
      return <Twitter className={iconClass} />
    case "wallet":
    case "evm":
      return <EthereumIcon className={iconClass} />
    case "solana":
      return <SolanaIcon className={iconClass} />
    case "farcaster":
      return <FarcasterIcon className={iconClass} />
    case "telegram":
      return <TelegramIcon className={iconClass} />
    default:
      return <Link2 className={iconClass} />
  }
}

export default function ProfilePage() {
  const {
    user,
    connections,
    achievements,
    chats,
    hasTwitter,
    hasWallet,
    hasEmail,
    setEmail,
    unseenAchievementsCount,
    mintableAchievementsCount,
    hasSeenChatsUnlocked,
    markChatsUnlockedSeen,
  } = useAuth()
  // On the profile's ACHIEVEMENTS preview we prefer the *unseen* count
  // (red-dot semantics — "look at these!"). If the user has already opened
  // the achievements page and cleared unseen, we fall back to the
  // *mintable* count so the badge still flags actionable items.
  const achievementBadgeCount =
    unseenAchievementsCount > 0 ? unseenAchievementsCount : mintableAchievementsCount
  const achievementBadgeIsUnseen = unseenAchievementsCount > 0
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [showEmailSuccess, setShowEmailSuccess] = useState(false)
  const [showChatsUnlocked, setShowChatsUnlocked] = useState(false)

  // Show the "chats unlocked" celebration popup once after onboarding.
  // Conditions: user is logged in, has at least one accessible chat, and
  // hasn't seen the popup before. Delay a beat so the profile mounts first
  // and the celebration feels like a reward rather than a blocking gate.
  const hasAccessibleChat = chats.some(c => c.isAccessible)
  useEffect(() => {
    if (!user) return
    if (hasSeenChatsUnlocked) return
    if (!hasAccessibleChat) return

    const t = setTimeout(() => setShowChatsUnlocked(true), 450)
    return () => clearTimeout(t)
  }, [user, hasSeenChatsUnlocked, hasAccessibleChat])

  const handleOverlayClose = () => {
    setShowChatsUnlocked(false)
    markChatsUnlockedSeen()
  }

  const handleJoinChatFromOverlay = (slug: string) => {
    // Mark seen so we don't show the popup again, then drop the user into
    // the chat with a flag that triggers the "back to profile" tutorial banner.
    markChatsUnlockedSeen()
    setShowChatsUnlocked(false)
    router.push(`/chats/${slug}?welcome=1`)
  }

  const copyAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleEmailSubmit = () => {
    if (emailInput && emailInput.includes("@")) {
      setEmail(emailInput)
      setShowEmailSuccess(true)
      setTimeout(() => setShowEmailSuccess(false), 3000)
    }
  }

  const handleShare = () => {
    if (user) {
      const text = encodeURIComponent(
        `${user.totalRep} REP. #${user.rank.toLocaleString()} of ${user.totalUsers.toLocaleString()}. "${user.aiOneLiner}" @R3P #REPNetwork`
      )
      window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank")
    }
  }

  const earnedAchievements = achievements.filter(a => a.status === "minted" || a.status === "available")
  const lockedAchievements = achievements.filter(a => a.status === "locked")
  // Accessible chats — sorted by avg REP (high → low) so the rarest rooms
  // the user has access to surface first.
  const accessibleChats = [...chats]
    .filter(c => c.isAccessible)
    .sort((a, b) => b.avgRep - a.avgRep)

  // Locked chats with the lowest REP bar first = the user's next-most-reachable
  // room. Used for the "almost there" card when they have zero unlocked chats.
  const nextReachableLockedChat = [...chats]
    .filter(c => !c.isAccessible)
    .sort((a, b) => a.avgRep - b.avgRep)[0]

  const connectedAccounts = connections.filter(c => c.connected)
  const availableToConnect = connections.filter(c => !c.connected && !c.comingSoon)
  const comingSoonAccounts = connections.filter(c => c.comingSoon)

  if (!user) return null

  return (
    <PageShell
      kicker="Cross-platform identity"
      title={
        <>
          Hello, <em>@{user.handle}</em>.
        </>
      }
      subtitle={
        <>
          REP <Num>{user.totalRep.toLocaleString()}</Num> is your portable
          score — the same one that earns chats, matches, and trust.
        </>
      }
      action={
        <Pill variant="accent" className="hidden md:inline-flex" onClick={handleShare}>
          <Share2 size={12} />
          Share
        </Pill>
      }
    >
      <div className="space-y-6">
        {/* Avatar + rank tier strip */}
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 flex-shrink-0">
            <div
              className={`h-full w-full overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-bg flex items-center justify-center bg-card-bg ${rankRingColors[user.rankTier]}`}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.handle}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-accent" />
              )}
            </div>
            <img
              src={rankBadges[user.rankTier]}
              alt={user.rankTier}
              className="absolute -bottom-1 -right-1 h-6 w-6 object-contain z-10 drop-shadow-md"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
              <span>RANK</span>
              <span className="text-ink">#{user.rank}</span>
              <span>·</span>
              <span className={rankStyles[user.rankTier].color}>
                {user.rankTier}
              </span>
            </div>
            <div className="mt-1 text-[14px] text-ink-mute">
              Top{" "}
              <Num className="text-ink">
                {((user.rank / user.totalUsers) * 100).toFixed(1)}%
              </Num>{" "}
              of{" "}
              <Num className="text-ink">
                {user.totalUsers.toLocaleString()}
              </Num>{" "}
              users.
            </div>
          </div>
        </div>

        {/* Connected accounts + wallets — compact "cloud" pair lives at the
            top of the profile per Mitya's mock. Pills are icon-only with a
            single "+N REP earned" tag per card. */}
        <ConnectedAccounts onConnect={() => router.push("/settings")} />

        {/* 4-up stat tiles — Performance / Position / Smart Followers /
            Achievements. Mirrors the Mitya mock. */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <GlassTile variant="bright" className="!p-4">
            <MonoCap size="sm">PERFORMANCE</MonoCap>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-[14px] font-medium leading-none text-ink-mute">Top</span>
              <span className="font-display text-[28px] font-semibold leading-none tracking-[-0.02em] text-accent tabular-nums rep-text-shadow-glow">
                {((user.rank / user.totalUsers) * 100).toFixed(0)}%
              </span>
            </div>
          </GlassTile>
          <Link href="/leaderboard" className="contents">
            <GlassTile variant="bright" interactive className="!p-4">
              <MonoCap size="sm">POSITION</MonoCap>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-[16px] font-medium leading-none text-ink-mute">#</span>
                <span className="font-display text-[28px] font-semibold leading-none tracking-[-0.02em] text-accent tabular-nums rep-text-shadow-glow">
                  {user.rank}
                </span>
              </div>
            </GlassTile>
          </Link>
          <GlassTile variant="bright" className="!p-4">
            <MonoCap size="sm">SMART FOLLOWERS</MonoCap>
            <div className="mt-2">
              <span className="font-display text-[28px] font-semibold leading-none tracking-[-0.02em] text-ink tabular-nums rep-text-shadow-glow">
                {(user.metrics.smartFollowers || 0).toLocaleString()}
              </span>
            </div>
          </GlassTile>
          <Link href="/achievements" className="contents">
            <GlassTile variant="bright" interactive className="!p-4 relative">
              <MonoCap size="sm">ACHIEVEMENTS</MonoCap>
              <div className="mt-2">
                <span className="font-display text-[28px] font-semibold leading-none tracking-[-0.02em] text-ink tabular-nums rep-text-shadow-glow">
                  {earnedAchievements.length}
                </span>
              </div>
              {achievementBadgeCount > 0 && (
                <span
                  className={`absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium text-white ${
                    achievementBadgeIsUnseen ? "bg-destructive" : "bg-accent"
                  }`}
                >
                  {achievementBadgeCount}
                </span>
              )}
            </GlassTile>
          </Link>
        </div>

        {/* Two primary action pills — Grow your REP + Stories. Live right
            above chats so the user always lands with their next action and
            their rooms in view. */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/leaderboard"
            className="rep-btn rep-btn-ghost rep-btn-md rep-btn-pill rep-focus-ring justify-center"
          >
            Grow your REP
          </Link>
          <Link
            href="/stories"
            className="rep-btn rep-btn-ghost rep-btn-md rep-btn-pill rep-focus-ring justify-center"
          >
            Stories
          </Link>
        </div>

      {/* Your Chats — upgraded preview. Each card now includes member
          avatars, an achievement-requirement badge, and a blue dot when
          there are unread messages. If the user qualifies for any new
          chat they haven't joined yet, a "new chat available" pill shows
          on the section header. Whole card is clickable → chat detail. */}
      {accessibleChats.length > 0 ? (
        <div className="rep-surface-glass-blur rep-glass-stroke-muted p-6">
          <div className="flex flex-col items-center text-center mb-4 gap-2">
            <SectionTitle className="text-lg">Your chats</SectionTitle>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* New chat available pill — shows when the user qualifies for
                  rooms beyond the 3 we preview. */}
              {accessibleChats.length > 3 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-semibold text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  {accessibleChats.length - 3} new chat{accessibleChats.length - 3 === 1 ? "" : "s"} available
                </span>
              )}
            </div>
            <Link href="/chats" className="text-sm text-accent hover:text-accent/80 flex items-center gap-1">
              See all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Deterministic mock avatars per chat — in a real app these would
              come from the chat's member list. Pulls from /images/avatars. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {accessibleChats.slice(0, 3).map((chat, chatIdx) => {
              const avatarSeed = (chat.id.charCodeAt(0) || 0) + chatIdx
              const memberAvatars = Array.from({ length: 4 }, (_, i) =>
                getPoolAvatarByIndex(avatarSeed + i)
              )
              const hasUnread = chat.unread > 0

              return (
                <Link
                  key={chat.id}
                  href={`/chats/${chat.slug}`}
                  className="group relative rounded-xl border border-border bg-muted/30 p-4 hover:border-primary/40 hover:bg-muted/50 transition-colors block"
                >
                  {/* Unread indicator */}
                  {hasUnread && (
                    <span
                      className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary ring-2 ring-muted/30"
                      aria-label={`${chat.unread} unread messages`}
                    />
                  )}

                  {/* Name + member count */}
                  <div className="pr-4 mb-3">
                    <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {chat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {chat.members.toLocaleString()} members
                    </p>
                  </div>

                  {/* Member avatars row */}
                  <div className="flex items-center mb-3">
                    <div className="flex -space-x-2">
                      {memberAvatars.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover ring-2 ring-muted/30"
                          style={{ zIndex: memberAvatars.length - i }}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-[10px] text-muted-foreground">
                      +{Math.max(0, chat.members - 4)}
                    </span>
                  </div>

                  {/* Achievement requirement badge */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-[10px] font-medium text-primary max-w-full">
                    <AwardStar className="h-2.5 w-2.5 flex-shrink-0" />
                    <span className="truncate">{chat.requirement}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      ) : nextReachableLockedChat ? (
        <div className="rep-surface-glass-blur rep-glass-stroke-muted p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Almost there
            </h2>
            <Link href="/chats" className="text-sm text-accent hover:text-accent/80 flex items-center gap-1">
              See all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {nextReachableLockedChat.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {nextReachableLockedChat.description}
                </p>
              </div>
            </div>

            {/* Requirement hint */}
            <div className="rounded-lg bg-background/50 border border-border/50 p-3 mb-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                To unlock
              </p>
              <p className="text-sm font-medium text-foreground">
                {nextReachableLockedChat.requirement}
              </p>
            </div>

            <Link href="/achievements">
              <Button size="sm" variant="outline" className="w-full">
                <Award className="h-3.5 w-3.5 mr-1.5" />
                Earn this achievement
              </Button>
            </Link>
          </div>
        </div>
      ) : null}

      {/* Achievements Preview - Big Blocks */}
      <div className="rep-surface-glass-blur rep-glass-stroke-bright p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <SectionTitle className="text-xl">ACHIEVEMENTS</SectionTitle>
            {achievementBadgeCount > 0 && (
              <span
                // Medium weight + explicit white so the count stays clean
                // on the vivid red/blue pill — matches the sidebar + mobile
                // nav treatment.
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium text-white animate-pulse ${
                  achievementBadgeIsUnseen ? "bg-destructive" : "bg-accent"
                }`}
              >
                {achievementBadgeCount}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-muted-foreground">
              {earnedAchievements.length} / {achievements.length} earned
            </span>
            {/* Show mintable achievements count */}
            {mintableAchievementsCount > 0 && (
              <span className="text-xs font-medium text-accent">
                {mintableAchievementsCount} ready to mint
              </span>
            )}
          </div>
        </div>

        {/* Big Achievement Blocks - Top 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {earnedAchievements.slice(0, 3).map((achievement) => {
            const style = getRarityStyle(achievement.rarity)
            return (
              <div
                key={achievement.id}
                className={`relative p-5 rounded-xl border ${style.border} ${style.bg} ${style.glow} transition-all hover:scale-[1.02]`}
              >
                {achievement.isNew && (
                  <div className="absolute top-2 right-2">
                    <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
                  </div>
                )}
                <div className="flex flex-col items-center text-center">
                  {achievement.imageUrl ? (
                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-border mb-3">
                      <img 
                        src={achievement.imageUrl} 
                        alt={achievement.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className={`p-4 rounded-xl ${style.bg} mb-3`}>
                      <AchievementIcon icon={achievement.icon} className={`h-10 w-10 ${style.text}`} />
                    </div>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider mb-2 ${style.badge}`}>
                    {achievement.rarity}
                  </span>
                  <h3 className="font-semibold text-foreground mb-1">
                    {achievement.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {achievement.description}
                  </p>
                  <span className={`text-sm font-bold ${style.text}`}>
                    +{achievement.repReward} REP
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <Link href="/achievements" className="flex items-center justify-center">
          <Button variant="outline" className="w-full max-w-xs">
            View all
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Leaderboard Position */}
      <div className="rep-surface-glass-blur rep-glass-stroke-bright p-6">
        <div className="text-center mb-6">
          <SectionTitle className="text-xl">LEADERBOARDS</SectionTitle>
        </div>

        {/* Mirrors /leaderboard column structure: Total / Connections Power /
            Onchain / Social. Mock numbers for the 3 secondary ranks until
            wired to real data. */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total:</p>
            <p className="text-2xl font-bold">
              <span className="text-primary">#</span>{user.rank}
              <span className="text-sm text-muted-foreground">/{user.totalUsers}</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Connections Power:</p>
            <p className="text-2xl font-bold">
              <span className="text-primary">#</span>5
              <span className="text-sm text-muted-foreground">/{user.totalUsers}</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Onchain:</p>
            <p className="text-2xl font-bold">
              <span className="text-primary">#</span>56
              <span className="text-sm text-muted-foreground">/1256</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Social:</p>
            <p className="text-2xl font-bold">
              <span className="text-primary">#</span>150
              <span className="text-sm text-muted-foreground">/1256</span>
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Top 300</span>
            <span className="text-primary">+REP {user.totalRep}/1200</span>
            <span className="text-muted-foreground">Top 200</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full"
              style={{ width: `${Math.min((user.totalRep / 1200) * 100, 100)}%` }}
            />
          </div>
        </div>

        <Link href="/leaderboard" className="flex items-center justify-center">
          <Button variant="outline" className="w-full max-w-xs">
            View details
          </Button>
        </Link>
      </div>

        {/* AI one-liner — Fraunces italic in a glass tile. Sits below the
            top fold (clouds / stats / chats / achievements / leaderboards)
            since Mitya's mock prioritises actionable surfaces up top. */}
        <GlassTile className="!p-5">
          <div className="flex items-start gap-3">
            <Sparkles
              className="h-4 w-4 flex-shrink-0 text-accent mt-0.5"
              aria-hidden="true"
            />
            <p className="font-serif text-[16px] italic leading-[1.5] text-ink">
              &ldquo;{user.aiOneLiner}&rdquo;
            </p>
          </div>
        </GlassTile>

        {/* Mobile-only Share button — the desktop pill lives in PageShell. */}
        <div className="md:hidden">
          <button
            onClick={handleShare}
            className="rep-btn rep-btn-ghost rep-btn-md rep-btn-pill rep-focus-ring"
          >
            <Share2 size={12} />
            Share
          </button>
        </div>

      {/* =================================================================
          WHAT TO DO NEXT — quest log
          Vertical list of actionable cards. Each card: icon · title ·
          description · REP reward · chevron. Email task always first if
          not connected. Compound tasks show "X of Y done" progress.
          Max 4 cards visible at once to keep it un-overwhelming.
          ================================================================= */}
      <div className="rep-surface-glass-blur rep-glass-stroke-bright p-6">
        <div className="text-center mb-4">
          <SectionTitle className="text-lg">What to do next</SectionTitle>
          <p className="mt-1 text-xs text-muted-foreground">Quests to grow your REP</p>
        </div>

        {(() => {
          type Task = {
            key: string
            icon: React.ReactNode
            title: string
            description: string
            repReward: number
            href?: string
            progress?: { done: number; total: number }
            onClick?: () => void
            inline?: React.ReactNode // email input card, etc.
          }

          // Build the quest list in priority order. Email is always first
          // when not connected. Connections + specific achievements follow.
          const tasks: Task[] = []

          if (!hasEmail) {
            tasks.push({
              key: "email",
              icon: <Mail className="h-5 w-5" />,
              title: "Add your email",
              description: "Get notified about new achievements and rewards",
              repReward: 30,
              inline: (
                <div className="mt-3 flex gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button size="sm" onClick={handleEmailSubmit}>
                    Add
                  </Button>
                </div>
              ),
            })
          }
          if (!hasTwitter) {
            tasks.push({
              key: "x",
              icon: <Twitter className="h-5 w-5" />,
              title: "Connect X",
              description: "Unlock social reputation and notable followers",
              repReward: 35,
              href: "/settings",
            })
          }
          if (!hasWallet) {
            tasks.push({
              key: "wallet",
              icon: <Wallet className="h-5 w-5" />,
              title: "Connect wallet",
              description: "Surface your onchain track record",
              repReward: 35,
              href: "/settings",
            })
          }

          // Compound "Claim 3 achievements" task when there are multiple
          // available to mint. Shows progress to illustrate the quest-log pattern.
          const availableAchs = achievements.filter((a) => a.status === "available")
          if (availableAchs.length > 0) {
            const target = Math.min(3, availableAchs.length)
            tasks.push({
              key: "claim-achievements",
              icon: (
                <img
                  src="/images/icons/achievs.png"
                  alt=""
                  className="h-6 w-6 object-contain"
                />
              ),
              title: `Claim ${target} achievements`,
              description: "Mint your earned proofs as NFTs",
              repReward: availableAchs
                .slice(0, target)
                .reduce((s, a) => s + a.repReward, 0),
              href: "/achievements",
              progress: { done: 0, total: target },
            })
          }

          tasks.push({
            key: "create-chat",
            icon: <Plus className="h-5 w-5" />,
            title: "Create a chat",
            description: "Start your own gated community around your proofs",
            repReward: 100,
            href: "/chats",
          })

          // Max 4 visible at a time per the spec
          const visible = tasks.slice(0, 4)

          return (
            <div className="space-y-2">
              {visible.map((task) => {
                const Body = (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border hover:border-primary/40 transition-colors">
                    <div className="flex-shrink-0 h-11 w-11 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_12px_rgba(99,193,230,0.15)]">
                      {task.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">
                          {task.title}
                        </p>
                        {task.progress && (
                          <span className="text-[10px] font-medium text-muted-foreground px-1.5 py-0.5 rounded bg-muted/60">
                            {task.progress.done} of {task.progress.total} done
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {task.description}
                      </p>
                      {task.inline}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2 pt-1">
                      <span className="text-xs font-semibold text-primary whitespace-nowrap">
                        +{task.repReward} REP
                      </span>
                      {!task.inline && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                )

                if (task.href && !task.inline) {
                  return (
                    <Link key={task.key} href={task.href} className="block">
                      {Body}
                    </Link>
                  )
                }
                return <div key={task.key}>{Body}</div>
              })}

              {showEmailSuccess && (
                <div className="p-3 rounded-xl bg-positive/10 border border-positive/30 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-positive flex-shrink-0" />
                  <span className="text-sm text-positive font-medium">
                    Email added. +30 REP earned.
                  </span>
                </div>
              )}
            </div>
          )
        })()}
      </div>

      {/* Your Network — pyramid visualization + How It Works.
          Shows 3 network levels with people counts + REP flowing up to you,
          plus an expandable explainer of the referral reward tiers. */}
      <YourNetworkCard
        userHandle={user.handle}
        userAvatarUrl={user.avatarUrl || undefined}
        referralLink={`rep.xyz/r/${user.handle}`}
      />

      {/* Bottom-of-profile CTA: nudges the user into the chats product.
          Dark card with mint/teal primary border — the page's only accent
          banner at this scale, so it reads as the final "next step". */}
      <Link href="/chats" className="block group">
        <div
          className="relative rounded-2xl bg-card border-2 border-primary/40 p-6 md:p-8 shadow-[0_0_30px_var(--accent-glow)] hover:border-primary/60 hover:shadow-[0_0_45px_var(--accent-glow)] transition-all"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 md:gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-foreground text-balance">
                  Chat with like-minded traders and builders
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Curated rooms gated by onchain reputation. Real alpha, zero noise.
                </p>
              </div>
            </div>
            <Button size="lg" className="w-full md:w-auto flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
              Explore Chats
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </Link>

      {/* First-visit celebration: unlocked chats */}
      {showChatsUnlocked && (
        <ChatsUnlockedOverlay
          chats={chats.filter(c => c.isAccessible)}
          onClose={handleOverlayClose}
          onJoin={handleJoinChatFromOverlay}
        />
      )}
      </div>
    </PageShell>
  )
}
