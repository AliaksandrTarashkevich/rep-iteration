"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Award, Trophy, MessageSquare, Home, Sparkles, Network } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const authenticatedNavItems = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Matches", href: "/matches", icon: Sparkles },
  { label: "Chats", href: "/chats", icon: MessageSquare },
  { label: "Network", href: "/network", icon: Network },
  { label: "Achievements", href: "/achievements", icon: Award },
]

const guestNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Matches", href: "/matches", icon: Sparkles },
  { label: "Chats", href: "/chats", icon: MessageSquare },
  { label: "Network", href: "/network", icon: Network },
]

export function MobileNav() {
  const pathname = usePathname()
  const {
    isAuthenticated,
    unseenAchievementsCount,
    mintableAchievementsCount,
  } = useAuth()

  const navItems = isAuthenticated ? authenticatedNavItems : guestNavItems

  const achievementBadgeCount =
    unseenAchievementsCount > 0
      ? unseenAchievementsCount
      : mintableAchievementsCount
  const achievementBadgeIsUnseen = unseenAchievementsCount > 0

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-bg/95 backdrop-blur-lg md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const showBadge =
            item.label === "Achievements" && achievementBadgeCount > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 transition-colors rounded-md relative",
                isActive ? "text-accent" : "text-ink-mute hover:text-ink",
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {showBadge && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-medium text-white",
                      achievementBadgeIsUnseen ? "bg-bad" : "bg-accent text-black",
                    )}
                    aria-label={
                      achievementBadgeIsUnseen
                        ? `${achievementBadgeCount} new achievements`
                        : `${achievementBadgeCount} achievements ready to mint`
                    }
                  >
                    {achievementBadgeCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
