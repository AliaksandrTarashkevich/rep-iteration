"use client"

import { type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { HorizonGlow } from "@/components/horizon-glow"

interface AppShellProps {
  children: ReactNode
}

// Pages that should NOT show sidebar (full screen experiences).
// These pages render their own shell/background.
const fullScreenPages = ["/stories", "/processing", "/claim", "/share"]

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()

  const isFullScreenPage = fullScreenPages.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`),
  )

  if (isFullScreenPage) {
    return <div className="min-h-screen bg-bg">{children}</div>
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Global ambient horizon glow — sits behind every authenticated page. */}
      <HorizonGlow />
      <Sidebar />
      <main className="relative z-10 md:ml-[240px]">
        <div className="min-h-screen pb-20 md:pb-0">{children}</div>
      </main>
      <MobileNav />
    </div>
  )
}
