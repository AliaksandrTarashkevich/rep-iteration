"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  User,
  Award,
  Trophy,
  MessageSquare,
  Settings,
  ExternalLink,
  Network,
  FileText,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Pill } from "@/components/ui/primitives"
import { Wordmark } from "@/components/ui/wordmark"
import { cn } from "@/lib/utils"

// Rank badge images - ꙮ (top tier) and yo (second tier)
const rankBadges: Record<string, string> = {
  "ꙮ": "/images/ranks/crown.png",
  "yo": "/images/ranks/base.png",
  "ToT": "/images/ranks/star.jpg",
  "roko": "/images/ranks/star.jpg",
  "droog": "/images/ranks/star.jpg",
  "cicada": "/images/ranks/star.jpg",
  "pilgrim": "/images/ranks/star.jpg",
}

// Rank ring colors
const rankRingColors: Record<string, string> = {
  "ꙮ": "ring-amber-400",
  "yo": "ring-accent",
  "ToT": "ring-emerald-400",
  "roko": "ring-purple-400",
  "droog": "ring-sky-400",
  "cicada": "ring-ink-faint",
  "pilgrim": "ring-ink-faint",
}

const authenticatedNavItems = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Matches", href: "/matches", icon: Sparkles },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Achievements", href: "/achievements", icon: Award },
  { label: "Chats", href: "/chats", icon: MessageSquare },
  { label: "Network", href: "/network", icon: Network },
]

const guestNavItems = [
  { label: "Profile", href: "/", icon: User, external: false },
  { label: "Chats", href: "/chats", icon: MessageSquare, external: false },
  { label: "Manifesto", href: "https://r3p.xyz/manifesto", icon: FileText, external: true },
]

const manifestoLink = { label: "Manifesto", href: "https://r3p.xyz/manifesto" }

interface NavItemProps {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  isActive?: boolean
  external?: boolean
  badgeCount?: number
  badgeIsUnseen?: boolean
}

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  external,
  badgeCount,
  badgeIsUnseen,
}: NavItemProps) {
  const className = cn(
    "relative flex items-center gap-3 rounded-md px-3 py-2 text-[14px] transition-colors",
    isActive
      ? "text-ink font-medium"
      : "text-ink-mute hover:text-ink hover:bg-card-bg",
  )
  const inner = (
    <>
      {isActive && (
        <span className="absolute -left-3 top-2.5 bottom-2.5 w-0.5 rounded bg-accent" />
      )}
      <Icon size={16} className={isActive ? "text-ink" : "text-ink-mute"} />
      <span>{label}</span>
      {external && <ExternalLink size={12} className="ml-auto opacity-60" />}
      {!!badgeCount && (
        <span
          className={cn(
            "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-medium text-white",
            badgeIsUnseen ? "bg-bad" : "bg-accent text-[#021319]",
          )}
          aria-label={
            badgeIsUnseen
              ? `${badgeCount} new achievements`
              : `${badgeCount} achievements ready to mint`
          }
        >
          {badgeCount}
        </span>
      )}
    </>
  )
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const {
    isAuthenticated,
    user,
    unseenAchievementsCount,
    mintableAchievementsCount,
  } = useAuth()

  const achievementBadgeCount =
    unseenAchievementsCount > 0
      ? unseenAchievementsCount
      : mintableAchievementsCount
  const achievementBadgeIsUnseen = unseenAchievementsCount > 0

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col bg-[#050505] border-r border-line p-6 pb-5 md:flex">
      <div className="px-2 pb-2">
        <Link href="/" aria-label="REP">
          <Wordmark size={22} />
        </Link>
      </div>

      <div className="mono-cap-sm px-2.5 pt-4 pb-2">Network</div>

      <nav className="flex-1 space-y-0.5">
        {isAuthenticated ? (
          <>
            {authenticatedNavItems.map((item) => {
              const isActive = pathname === item.href
              const showBadge =
                item.label === "Achievements" && achievementBadgeCount > 0
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive}
                  badgeCount={showBadge ? achievementBadgeCount : undefined}
                  badgeIsUnseen={achievementBadgeIsUnseen}
                />
              )
            })}

            <div className="mono-cap-sm px-2.5 pt-5 pb-2">More</div>
            <NavItem
              href={manifestoLink.href}
              label={manifestoLink.label}
              icon={FileText}
              external
            />
          </>
        ) : (
          guestNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                external={item.external}
              />
            )
          })
        )}
      </nav>

      <div className="mt-auto">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2.5 rounded-md border border-line bg-card-bg p-3 hover:bg-card-bg-2 transition">
            <div className="relative flex-shrink-0">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-bg overflow-hidden",
                  rankRingColors[user.rankTier] || "ring-accent",
                )}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.handle}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-accent" />
                )}
              </div>
              <img
                src={rankBadges[user.rankTier] || rankBadges["pilgrim"]}
                alt={user.rankTier}
                className="absolute -bottom-1 -right-1 h-5 w-5 object-contain z-10 drop-shadow-md"
              />
            </div>
            <Link href="/profile" className="flex-1 min-w-0">
              <p className="truncate text-[13px] font-medium leading-tight text-ink">
                @{user.handle}
              </p>
              <p className="font-mono text-[11px] leading-tight text-accent mt-[1px]">
                {user.totalRep} REP
              </p>
            </Link>
            <Link
              href="/settings"
              aria-label="Settings"
              title="Settings"
              className={cn(
                "flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                pathname === "/settings"
                  ? "bg-accent-dim text-accent"
                  : "text-ink-faint hover:text-ink",
              )}
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <Pill
            variant="accent"
            className="w-full"
            onClick={() => {
              const authSection = document.getElementById("auth-section")
              authSection?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            Connect
          </Pill>
        )}
      </div>
    </aside>
  )
}
