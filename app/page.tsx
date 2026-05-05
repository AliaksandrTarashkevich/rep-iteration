"use client"

import { Suspense } from "react"
import { LandingPage } from "@/components/landing-page"

function LandingPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )
}

// Landing page is always the home page - guests see it with sidebar
// Authenticated users can still visit it but will typically navigate to /profile
export default function Home() {
  return (
    <Suspense fallback={<LandingPageFallback />}>
      <LandingPage />
    </Suspense>
  )
}
