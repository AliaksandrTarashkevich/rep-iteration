"use client"

import { Check, Star, Crown, Network } from "lucide-react"
import {
  StoryCard,
  BigStat,
  MidStat,
  SubStat,
  PullQuote,
  Pill,
  Caption,
  ShareRow,
  CountUp,
} from "./primitives"
import { CLOSING_DATA } from "@/lib/mock-stories"
import { RANK_TIERS } from "@/lib/auth-context"

// C1 - VERIFIED HUMAN
export function C1AntiSybil() {
  const d = CLOSING_DATA.antiSybil
  const items = [
    { key: "twitterAge", label: "Twitter age", on: d.twitterAge },
    { key: "walletAge", label: "Wallet age", on: d.walletAge },
    { key: "smartFollowers", label: "Smart followers", on: d.smartFollowers },
  ]
  return (
    <StoryCard label="VERIFIED HUMAN" seedKey="c1-anti-sybil">
      <div className="mb-5 space-y-2">
        {items.map((item, i) => (
          <div
            key={item.key}
            className="flex animate-in fade-in slide-in-from-left-4 items-center gap-3 rounded-xl border border-border/40 bg-background/20 p-3"
            style={{ animationDelay: `${i * 150}ms`, animationFillMode: "backwards" }}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                item.on ? "bg-positive/20 text-positive" : "bg-muted text-muted-foreground"
              }`}
            >
              <Check className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mb-3 text-center">
        <BigStat>
          <CountUp end={d.count} duration={900} /> of 3
        </BigStat>
        <Caption>Unfakable signals</Caption>
      </div>
      <PullQuote>Bots have followers. You have proof.</PullQuote>
      <ShareRow storyId="c1-anti-sybil" />
    </StoryCard>
  )
}

// C2 - YOUR NETWORK COMPOUNDS
export function C2NetworkCompounding() {
  const d = CLOSING_DATA.networkCompounding
  return (
    <StoryCard label="YOUR NETWORK COMPOUNDS" seedKey="c2-network-compounding">
      <div className="mb-5">
        {/* 4-generation tree visualization */}
        <div className="space-y-3">
          {d.generations.map((count, i) => {
            const dotsPerRow = Math.min(count, 25)
            return (
              <div
                key={i}
                className="flex animate-in fade-in zoom-in-95 flex-col items-center gap-1.5"
                style={{ animationDelay: `${i * 250}ms`, animationFillMode: "backwards" }}
              >
                <div className="flex flex-wrap justify-center gap-1">
                  {Array.from({ length: dotsPerRow }).map((_, j) => (
                    <div
                      key={j}
                      className="h-2 w-2 rounded-full bg-accent shadow-[0_0_4px_rgba(140,213,254,0.6)]"
                      style={{ opacity: 0.4 + (i * 0.15) }}
                    />
                  ))}
                  {count > 25 && (
                    <span className="ml-2 font-mono text-[10px] text-ink-faint">
                      +{count - 25}
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  Gen {i + 1} · <CountUp end={count} duration={900 + i * 200} />
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mb-3 text-center">
        <BigStat>
          <CountUp end={d.reach4gen} />
        </BigStat>
        <Caption>Your 4-generation network reach</Caption>
      </div>
      <PullQuote>{"Trust compounds. Followers don't."}</PullQuote>
      <ShareRow storyId="c2-network-compounding" />
    </StoryCard>
  )
}

// C3 - YOUR RANK
export function C3Rank() {
  const d = CLOSING_DATA.rank
  const tier = "yo"
  const tierInfo = RANK_TIERS.find((t) => t.name === tier)
  return (
    <StoryCard label="YOUR RANK" seedKey="c3-rank">
      <div className="mb-4 flex justify-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/50 bg-gradient-to-br from-primary/30 via-primary/20 to-accent/20 shadow-[0_0_15px_var(--accent-glow)]">
            <span className="text-3xl font-bold text-primary">{tier}</span>
          </div>
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/30 bg-background px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Top {tierInfo?.percentile}%
          </div>
        </div>
      </div>

      <div className="mb-5 text-center">
        <BigStat>
          Top <CountUp end={d.percentileNumber} suffix="%" />
        </BigStat>
        <Caption>
          among <CountUp end={d.totalIdentities} duration={1800} /> identities
        </Caption>
      </div>

      <div className="mb-5">
        <div className="relative h-2.5 overflow-hidden rounded-full bg-muted/60">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-positive transition-all duration-1000"
            style={{ width: `${100 - d.percentileNumber}%` }}
          />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-primary bg-foreground shadow-[0_0_10px_var(--accent-glow)] transition-all duration-1000"
            style={{ left: `calc(${100 - d.percentileNumber}% - 8px)` }}
          />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-border/40 bg-background/20 p-3">
        <SubStat icon={Star} value={<CountUp end={d.repScore} />} label="REP" />
        <SubStat
          icon={Crown}
          value={
            <>
              #<CountUp end={d.rank} duration={1500} />
            </>
          }
          label="Rank"
        />
      </div>
      <PullQuote>{"Reputation isn't given. It's proven."}</PullQuote>
      <ShareRow storyId="c3-rank" />
    </StoryCard>
  )
}
