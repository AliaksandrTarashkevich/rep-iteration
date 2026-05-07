"use client"

import { useState } from "react"
import { Wallet, Twitter, ChevronRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StoryCard } from "./primitives"

// Inline Solana glyph — small purple-to-green gradient mark used by Solana brand.
function SolanaGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sol-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <g fill="url(#sol-grad)">
        <path d="M5 7l3-3h11l-3 3z" />
        <path d="M5 13l3-3h11l-3 3z" />
        <path d="M5 19l3-3h11l-3 3z" />
      </g>
    </svg>
  )
}

export function ConnectWalletPrompt({
  onConnect,
  onSkip,
}: {
  onConnect: () => void
  onSkip: () => void
}) {
  return (
    <StoryCard label="CONNECT WALLET" variant="prompt" seedKey="connect-wallet">
      <div className="text-center">
        <div className="mx-auto mb-5 flex items-center justify-center gap-3">
          <span className="glow flex items-center text-5xl font-bold leading-none tracking-tight text-primary">
            <span className="text-primary">+</span>
            <span className="italic">REP</span>
          </span>
          <span className="h-12 w-px bg-border/60" aria-hidden="true" />
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
            <Wallet className="h-6 w-6 text-primary" />
          </span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-foreground">
          {"There's more to your story"}
        </h3>
        <p className="mb-2 text-sm text-foreground/70">
          Connect any EVM wallet to reveal onchain reputation.
        </p>
        <p className="mb-6 text-sm font-medium text-positive">+35 REP bonus</p>
        <Button
          className="mb-3 w-full bg-foreground text-background hover:bg-foreground/90"
          onClick={onConnect}
        >
          Connect Wallet
        </Button>
        <button
          onClick={onSkip}
          className="mx-auto flex items-center justify-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </StoryCard>
  )
}

export function ConnectXPrompt({
  onConnect,
  onSkip,
}: {
  onConnect: () => void
  onSkip: () => void
}) {
  return (
    <StoryCard label="CONNECT X" variant="prompt" seedKey="connect-x">
      <div className="text-center">
        <div className="mx-auto mb-5 flex items-center justify-center gap-3">
          <span className="glow flex items-center text-5xl font-bold leading-none tracking-tight text-primary">
            <span className="text-primary">+</span>
            <span className="italic">REP</span>
          </span>
          <span className="h-12 w-px bg-border/60" aria-hidden="true" />
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
            <Twitter className="h-6 w-6 text-primary" />
          </span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-foreground">
          Unlock your social layer
        </h3>
        <p className="mb-2 text-sm text-foreground/70">
          Connect X to see who trusts you.
        </p>
        <p className="mb-6 text-sm font-medium text-positive">+35 REP bonus</p>
        <Button
          className="mb-3 w-full bg-foreground text-background hover:bg-foreground/90"
          onClick={onConnect}
        >
          Connect X
        </Button>
        <button
          onClick={onSkip}
          className="mx-auto flex items-center justify-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </StoryCard>
  )
}

export function BlurredOnchain({ onConnect }: { onConnect: () => void }) {
  return (
    <StoryCard label="ONCHAIN LOCKED" variant="blurred" seedKey="blurred-onchain">
      <div className="relative">
        {/* Blurred fake content */}
        <div className="pointer-events-none select-none blur-md">
          <div className="mb-4 flex justify-center">
            <span className="rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-xs text-accent">
              Tier: Veteran
            </span>
          </div>
          <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-border/40 bg-background/20 p-3">
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground">14,847</div>
              <div className="text-xs text-muted-foreground">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground">187</div>
              <div className="text-xs text-muted-foreground">Protocols</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground">+$2.1M</div>
              <div className="text-xs text-muted-foreground">PnL</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground">8y</div>
              <div className="text-xs text-muted-foreground">Onchain</div>
            </div>
          </div>
          <p className="text-center font-serif text-sm italic text-ink-mute">
            Your chain history speaks louder than words.
          </p>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line-strong bg-card-bg/80 backdrop-blur-sm">
            <Lock className="h-6 w-6 text-ink-mute" />
          </div>
          <p className="text-center text-sm font-medium text-ink">
            Connect Wallet to Reveal
          </p>
        </div>
      </div>

      <Button
        className="mt-6 w-full bg-foreground text-background hover:bg-foreground/90"
        onClick={onConnect}
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    </StoryCard>
  )
}

export function BlurredTwitter({ onConnect }: { onConnect: () => void }) {
  return (
    <StoryCard label="SOCIAL LOCKED" variant="blurred" seedKey="blurred-twitter">
      <div className="relative">
        <div className="pointer-events-none select-none blur-md">
          <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-border/40 bg-background/20 p-3">
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground">2,847</div>
              <div className="text-xs text-muted-foreground">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground">91</div>
              <div className="text-xs text-muted-foreground">Trust</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground">Top 3%</div>
              <div className="text-xs text-muted-foreground">Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground">5</div>
              <div className="text-xs text-muted-foreground">Tribes</div>
            </div>
          </div>
          <div className="mb-5 flex justify-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="h-10 w-10 rounded-full bg-muted" />
          </div>
          <p className="text-center font-serif text-sm italic text-ink-mute">
            The people who follow you define your signal.
          </p>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line-strong bg-card-bg/80 backdrop-blur-sm">
            <Lock className="h-6 w-6 text-ink-mute" />
          </div>
          <p className="text-center text-sm font-medium text-ink">
            Connect X to Reveal
          </p>
        </div>
      </div>

      <Button
        className="mt-6 w-full bg-foreground text-background hover:bg-foreground/90"
        onClick={onConnect}
      >
        <Twitter className="mr-2 h-4 w-4" />
        Connect X
      </Button>
    </StoryCard>
  )
}

// v2.2 §5.4 — Solana Follow-up prompt. Inserted after W-block when EVM wallet
// is connected. V0: placeholder waitlist (email capture inline). V0+: real
// Phantom / Solflare integration + Helius API.
export function SolanaFollowupPrompt({
  onContinue,
  onSkip,
}: {
  onContinue: () => void
  onSkip: () => void
}) {
  const [email, setEmail] = useState("")
  const [joined, setJoined] = useState(false)

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    // V0: no real backend. Mark as joined and proceed.
    setJoined(true)
    setTimeout(onContinue, 600)
  }

  return (
    <StoryCard label="ADD SOLANA" variant="prompt" seedKey="solana-followup">
      <div className="text-center">
        <div className="mx-auto mb-5 flex items-center justify-center gap-3">
          <span className="glow flex items-center text-5xl font-bold leading-none tracking-tight text-primary">
            <span className="text-primary">+</span>
            <span className="italic">REP</span>
          </span>
          <span className="h-12 w-px bg-border/60" aria-hidden="true" />
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
            <SolanaGlyph className="h-6 w-6" />
          </span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-foreground">
          Bring your Solana side too
        </h3>
        <p className="mb-2 text-sm text-foreground/70">
          REP supports Solana wallets. Add yours to extend your onchain story.
        </p>
        <p className="mb-6 text-sm font-medium text-positive">+25 REP bonus</p>

        {joined ? (
          <p className="mb-3 text-sm font-medium text-accent">
            {"You're on the list. We'll ping you when Solana goes live."}
          </p>
        ) : (
          <form onSubmit={handleJoin} className="mb-3 space-y-2">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
            />
            <Button
              type="submit"
              className="w-full bg-foreground text-background hover:bg-foreground/90"
            >
              Add Solana Wallet
            </Button>
          </form>
        )}

        <button
          onClick={onSkip}
          className="mx-auto flex items-center justify-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Maybe later <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </StoryCard>
  )
}

export function SubscribePrompt({
  onContinue,
  onSkip,
}: {
  onContinue: () => void
  onSkip: () => void
}) {
  return (
    <StoryCard label="FOLLOW @R3P" variant="prompt" seedKey="subscribe-rep">
      <div className="text-center">
        <div className="mx-auto mb-5 flex items-center justify-center">
          <span className="glow flex items-center text-5xl font-bold leading-none tracking-tight text-primary">
            <span className="text-primary">+</span>
            <span className="italic">REP</span>
          </span>
        </div>
        <h3 className="mb-4 text-xl font-bold text-foreground">Follow @R3P on X</h3>
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-positive">
            <span className="font-semibold">+50 REP</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-accent">
            <span className="font-semibold">{`"Early Supporter"`} badge</span>
          </div>
        </div>
        <Button
          className="mb-3 w-full bg-foreground text-background hover:bg-foreground/90"
          onClick={() => {
            window.open("https://twitter.com/intent/follow?screen_name=R3P", "_blank")
            onContinue()
          }}
        >
          Follow @R3P
        </Button>
        <button
          onClick={onSkip}
          className="mx-auto flex items-center justify-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </StoryCard>
  )
}
