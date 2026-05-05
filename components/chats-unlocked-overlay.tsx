"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Sparkles, MessageCircle, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Chat } from "@/lib/auth-context"

// ============================================================================
// CHATS UNLOCKED OVERLAY
// Celebration popup shown once after a user completes onboarding and lands on
// their profile. Mirrors the achievements unlock carousel pattern.
// ============================================================================

interface ChatsUnlockedOverlayProps {
  chats: Chat[]
  onClose: () => void
  onJoin: (slug: string) => void
}

export function ChatsUnlockedOverlay({ chats, onClose, onJoin }: ChatsUnlockedOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const current = chats[currentIndex]
  const isLast = currentIndex === chats.length - 1

  // Lock body scroll while overlay is open + allow Escape to close
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight" && currentIndex < chats.length - 1) {
        setCurrentIndex(i => i + 1)
      }
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex(i => i - 1)
      }
    }
    window.addEventListener("keydown", onKey)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [currentIndex, chats.length, onClose])

  if (!current) return null

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chats-unlocked-title"
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Previous chat"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}
      {!isLast && (
        <button
          onClick={handleNext}
          className="absolute right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Next chat"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {/* Chat card */}
      <div className="max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-500" key={currentIndex}>
        {/* Header label above card */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-positive/15 border border-positive/30">
            <Sparkles className="h-3.5 w-3.5 text-positive" />
            <span className="text-xs font-medium uppercase tracking-wider text-positive">
              {chats.length} chat{chats.length === 1 ? "" : "s"} unlocked
            </span>
          </div>
        </div>

        <div className="relative rounded-2xl bg-primary/10 border-2 border-primary/40 p-8 shadow-[0_0_40px_var(--accent-glow)]">
          <Sparkles className="absolute top-4 right-4 h-6 w-6 text-primary animate-pulse" />

          {/* Chat icon */}
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-primary/20 border-4 border-primary/40 flex items-center justify-center shadow-[0_0_30px_var(--accent-glow)]">
              <MessageCircle className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Requirement met badge — signals the user already qualifies */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-positive/20 text-positive border border-positive/30">
              <svg
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 010 1.42l-8 8a1 1 0 01-1.42 0l-4-4a1 1 0 011.42-1.42L8 12.58l7.29-7.29a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              You qualify: {current.requirement}
            </span>
          </div>

          {/* Name */}
          <h2 id="chats-unlocked-title" className="text-2xl font-bold text-foreground text-center mb-2">
            {current.name}
          </h2>

          {/* Description */}
          <p className="text-sm text-muted-foreground text-center mb-5">
            {current.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50 text-center">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-foreground">
                <Users className="h-4 w-4 text-muted-foreground" />
                {current.members.toLocaleString()}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                Members
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50 text-center">
              <div className="text-lg font-bold text-primary glow">
                {current.avgRep.toLocaleString()}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                Avg REP
              </div>
            </div>
          </div>

          {/* Actions — Join is the primary CTA (filled), Next/secondary is outline */}
          <div className="flex gap-3">
            <Button
              onClick={handleNext}
              variant="outline"
              className="flex-1"
            >
              {isLast ? "Explore profile" : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
            <Button onClick={() => onJoin(current.slug)} className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Join
            </Button>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {chats.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-muted hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to chat ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Hint below card */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          {isLast ? "You can rejoin these any time from your profile" : "Press → or swipe to browse"}
        </p>
      </div>
    </div>
  )
}
