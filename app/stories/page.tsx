"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StoryShareActions } from "@/components/story-share-actions"
import { Num } from "@/components/ui/primitives"
import {
  X1SmartFollowers,
  X2NotableFollowers,
  X3InnerCircle,
  X4TopInteractions,
  X5AudienceAuthenticity,
  X6EngagementQuality,
  X7Tribes,
  X8Mindshare,
  X9AccountAge,
  X10Momentum,
} from "@/components/stories/x-block"
import {
  W1OnchainSnapshot,
  W2Ecosystem,
  W3WalletAge,
  W4Pnl,
  W5BestTrade,
  W6WorstTrade,
  W7DiamondHands,
  W8TokenDiversity,
  W9GasStation,
} from "@/components/stories/w-block"
import {
  C1AntiSybil,
  C2NetworkCompounding,
  C3Rank,
} from "@/components/stories/c-block"
import {
  ConnectWalletPrompt,
  ConnectXPrompt,
  BlurredOnchain,
  BlurredTwitter,
  SubscribePrompt,
} from "@/components/stories/intermediate"
import { FinalCard, finalCardShareText } from "@/components/stories/final-card"
import { StoryBg } from "@/components/stories/story-bg"
import {
  SHARE_TEXT,
  STORY_REGISTRY,
  USER,
  evaluateTrigger,
  type StoryId,
} from "@/lib/mock-stories"

// ---------------------------------------------------------------------------
// Block sequences per spec §1 (in order, with all 10/9/3 stories)
// ---------------------------------------------------------------------------

const X_BLOCK: StoryId[] = [
  "x1-smart-followers",
  "x2-notable-followers",
  "x3-inner-circle",
  "x4-top-interactions",
  "x5-audience-authenticity",
  "x6-engagement-quality",
  "x7-tribes",
  "x8-mindshare",
  "x9-account-age",
  "x10-momentum",
]

// Per spec §7.3, wallet-only path splits W block: W1+W2 first (before
// connect-X prompt), then W3-W9 after.
const W_BLOCK_HEAD: StoryId[] = ["w1-onchain-snapshot", "w2-ecosystem"]
const W_BLOCK_TAIL: StoryId[] = [
  "w3-wallet-age",
  "w4-pnl",
  "w5-best-trade",
  "w6-worst-trade",
  "w7-diamond-hands",
  "w8-token-diversity",
  "w9-gas-station",
]
const W_BLOCK_FULL: StoryId[] = [...W_BLOCK_HEAD, ...W_BLOCK_TAIL]

// ---------------------------------------------------------------------------
// Path matrix (spec §7) — pure function of state. primarySource decides
// where the secondary-connect prompt slots in (after X10 vs after W2).
// ---------------------------------------------------------------------------

function buildPath({
  primarySource,
  hasX,
  hasWallet,
  skippedX,
  skippedWallet,
  subscribedToR3p,
}: {
  primarySource: "x" | "wallet"
  hasX: boolean
  hasWallet: boolean
  skippedX: boolean
  skippedWallet: boolean
  subscribedToR3p: boolean
}): StoryId[] {
  const seq: StoryId[] = []

  if (primarySource === "x") {
    // ---- X-led path: X block → secondary slot → closing → subscribe → summary
    if (hasX) seq.push(...X_BLOCK.filter(evaluateTrigger))

    if (hasWallet) {
      seq.push(...W_BLOCK_FULL.filter(evaluateTrigger))
    } else if (skippedWallet) {
      seq.push("blurred-onchain")
    } else {
      seq.push("connect-wallet")
    }
  } else {
    // ---- Wallet-led path: W1+W2 → secondary slot → (X block) → W3-W9
    if (hasWallet) seq.push(...W_BLOCK_HEAD.filter(evaluateTrigger))

    if (hasX) {
      seq.push(...X_BLOCK.filter(evaluateTrigger))
    } else if (skippedX) {
      seq.push("blurred-twitter")
    } else {
      seq.push("connect-x")
    }

    if (hasWallet) seq.push(...W_BLOCK_TAIL.filter(evaluateTrigger))
  }

  // ---- Closing block ----
  // C1 needs both sources connected (≥2 of 3 signals)
  if (hasX && hasWallet && evaluateTrigger("c1-anti-sybil")) {
    seq.push("c1-anti-sybil")
  }
  // C2 always shows
  seq.push("c2-network-compounding")
  // C3 only if percentile ≤ 50%
  if (evaluateTrigger("c3-rank")) {
    seq.push("c3-rank")
  }

  // ---- Subscribe prompt (only if X connected and not subscribed) ----
  if (hasX && !subscribedToR3p) {
    seq.push("subscribe-rep")
  }

  // ---- Final card ----
  seq.push("summary")

  return seq
}

// ---------------------------------------------------------------------------
// Story renderer
// ---------------------------------------------------------------------------

function StoryRenderer({
  id,
  onConnectWallet,
  onConnectX,
  onSkipWallet,
  onSkipX,
  onSubscribeContinue,
  onSubscribeSkip,
  hasX,
  hasWallet,
  skippedX,
  skippedWallet,
  onClaim,
}: {
  id: StoryId
  onConnectWallet: () => void
  onConnectX: () => void
  onSkipWallet: () => void
  onSkipX: () => void
  onSubscribeContinue: () => void
  onSubscribeSkip: () => void
  hasX: boolean
  hasWallet: boolean
  skippedX: boolean
  skippedWallet: boolean
  onClaim: () => void
}) {
  switch (id) {
    case "x1-smart-followers": return <X1SmartFollowers />
    case "x2-notable-followers": return <X2NotableFollowers />
    case "x3-inner-circle": return <X3InnerCircle />
    case "x4-top-interactions": return <X4TopInteractions />
    case "x5-audience-authenticity": return <X5AudienceAuthenticity />
    case "x6-engagement-quality": return <X6EngagementQuality />
    case "x7-tribes": return <X7Tribes />
    case "x8-mindshare": return <X8Mindshare />
    case "x9-account-age": return <X9AccountAge />
    case "x10-momentum": return <X10Momentum />

    case "w1-onchain-snapshot": return <W1OnchainSnapshot />
    case "w2-ecosystem": return <W2Ecosystem />
    case "w3-wallet-age": return <W3WalletAge />
    case "w4-pnl": return <W4Pnl />
    case "w5-best-trade": return <W5BestTrade />
    case "w6-worst-trade": return <W6WorstTrade />
    case "w7-diamond-hands": return <W7DiamondHands />
    case "w8-token-diversity": return <W8TokenDiversity />
    case "w9-gas-station": return <W9GasStation />

    case "c1-anti-sybil": return <C1AntiSybil />
    case "c2-network-compounding": return <C2NetworkCompounding />
    case "c3-rank": return <C3Rank />

    case "connect-wallet":
      return <ConnectWalletPrompt onConnect={onConnectWallet} onSkip={onSkipWallet} />
    case "connect-x":
      return <ConnectXPrompt onConnect={onConnectX} onSkip={onSkipX} />
    case "blurred-onchain":
      return <BlurredOnchain onConnect={onConnectWallet} />
    case "blurred-twitter":
      return <BlurredTwitter onConnect={onConnectX} />
    case "subscribe-rep":
      return (
        <SubscribePrompt
          onContinue={onSubscribeContinue}
          onSkip={onSubscribeSkip}
        />
      )

    case "summary":
      return (
        <FinalCard
          hasX={hasX}
          hasWallet={hasWallet}
          skippedX={skippedX && !hasX}
          skippedWallet={skippedWallet && !hasWallet}
          onClaim={onClaim}
          onConnectX={onConnectX}
          onConnectWallet={onConnectWallet}
        />
      )
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Main controller
// ---------------------------------------------------------------------------

function StoriesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSource = (searchParams.get("source") || "x") as "x" | "wallet"

  // primarySource is fixed for the lifetime of the flow — it dictates the
  // path structure (X-led vs Wallet-led, where the connect prompt slots in).
  const [primarySource] = useState<"x" | "wallet">(initialSource)
  const [hasX, setHasX] = useState(initialSource === "x")
  const [hasWallet, setHasWallet] = useState(initialSource === "wallet")
  const [skippedX, setSkippedX] = useState(false)
  const [skippedWallet, setSkippedWallet] = useState(false)
  const [subscribedToR3p, setSubscribedToR3p] = useState(false)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  // Build the full sequence based on current state
  const stories = useMemo(
    () =>
      buildPath({
        primarySource,
        hasX,
        hasWallet,
        skippedX,
        skippedWallet,
        subscribedToR3p,
      }),
    [primarySource, hasX, hasWallet, skippedX, skippedWallet, subscribedToR3p],
  )

  const totalStories = stories.length
  const currentId = stories[currentIndex]

  // Clamp index whenever the path mutates (e.g. after connect/skip)
  useEffect(() => {
    if (currentIndex >= stories.length) {
      setCurrentIndex(Math.max(0, stories.length - 1))
    }
  }, [stories.length, currentIndex])

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, stories.length - 1))
  }, [stories.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }, [])

  // For connect/skip handlers: the path itself mutates so the prompt slot
  // is replaced in-place by the next eligible story (W1, blurred card, or X1).
  // We don't advance the index — the same index now points at new content.
  const handleConnectWallet = () => {
    setHasWallet(true)
    setSkippedWallet(false)
  }

  const handleSkipWallet = () => {
    setSkippedWallet(true)
  }

  const handleConnectX = () => {
    setHasX(true)
    setSkippedX(false)
  }

  const handleSkipX = () => {
    setSkippedX(true)
  }

  const handleSubscribeContinue = () => {
    // Removing subscribe-rep from path shifts summary into the same slot.
    setSubscribedToR3p(true)
  }

  const handleClaim = () => {
    router.push("/claim")
  }

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "Escape") router.push("/")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goNext, goPrev, router])

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
    setTouchStart(null)
  }

  // Click navigation (right 70% = next, left 30% = prev)
  const handleAreaClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest("a")) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    if (pct > 0.7) goNext()
    else if (pct < 0.3) goPrev()
  }

  // Top-right share icon — only for shareable slides
  const shareableShareText: string | null = (() => {
    if (!currentId) return null
    if (!STORY_REGISTRY[currentId].shareable) return null
    if (currentId === "summary") return finalCardShareText
    return SHARE_TEXT[currentId]?.(USER.handle) ?? null
  })()

  return (
    <div
      className="fixed inset-0 z-50"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0">
        <StoryBg />
      </div>
      <div className="relative z-[1] flex h-full flex-col">
      {/* Progress bars */}
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

      {/* Top-right share icon */}
      {shareableShareText && currentId && (
        <div className="absolute right-4 top-4 z-10">
          <StoryShareActions
            variant="icon"
            storyId={currentId}
            shareText={shareableShareText}
            handle={USER.handle}
          />
        </div>
      )}

      {/* Story content */}
      <div
        className="flex-1 flex items-center justify-center px-4 cursor-pointer"
        onClick={handleAreaClick}
      >
        <div key={`${currentIndex}-${currentId}`}>
          {currentId && (
            <StoryRenderer
              id={currentId}
              onConnectWallet={handleConnectWallet}
              onConnectX={handleConnectX}
              onSkipWallet={handleSkipWallet}
              onSkipX={handleSkipX}
              onSubscribeContinue={handleSubscribeContinue}
              onSubscribeSkip={() => goNext()}
              hasX={hasX}
              hasWallet={hasWallet}
              skippedX={skippedX}
              skippedWallet={skippedWallet}
              onClaim={handleClaim}
            />
          )}
        </div>
      </div>

      {/* Counter */}
      <div className="pb-6 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
        <Num>{currentIndex + 1}</Num> / <Num>{totalStories}</Num>
        {currentId && (
          <span className="ml-3 opacity-50">
            · {STORY_REGISTRY[currentId].label}
          </span>
        )}
      </div>
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
