"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Briefcase,
  HelpCircle,
  Layers,
  Users,
} from "lucide-react"
import {
  StoryCard,
  BigStat,
  MidStat,
  SubStat,
  PullQuote,
  TierLabel,
  Caption,
  ShareRow,
  CountUp,
} from "./primitives"
import { X_DATA } from "@/lib/mock-stories"

// v2.2: TRIBE_COLORS retained — used for "YOUR ORBIT" cluster colouring (X7).
const TRIBE_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  DeFi: { bg: "bg-emerald-500/20", text: "text-emerald-400", bar: "bg-emerald-500" },
  "NFT/Art": { bg: "bg-fuchsia-500/20", text: "text-fuchsia-400", bar: "bg-fuchsia-500" },
  DAO: { bg: "bg-amber-500/20", text: "text-amber-400", bar: "bg-amber-500" },
  MEV: { bg: "bg-red-500/20", text: "text-red-400", bar: "bg-red-500" },
  Builders: { bg: "bg-sky-500/20", text: "text-sky-400", bar: "bg-sky-500" },
}

// v2.2: rename SMART FOLLOWERS → INFLUENCE + tooltip (choly review)
const INFLUENCE_TOOLTIP =
  "Influence is calculated from your social graph: rank on X, activity, and the influence of accounts following you."

export function X1SmartFollowers() {
  const d = X_DATA.smartFollowers
  const [showTooltip, setShowTooltip] = useState(false)
  return (
    <StoryCard label="INFLUENCE" seedKey="x1-smart-followers">
      <div className="mb-5 text-center">
        <div className="relative inline-flex items-center gap-2">
          <BigStat>
            <CountUp end={d.total} />
          </BigStat>
          <button
            type="button"
            aria-label="What does Influence mean?"
            onClick={(e) => {
              e.stopPropagation()
              setShowTooltip((v) => !v)
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-ink-faint transition-colors hover:text-accent"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          {showTooltip && (
            <div className="absolute left-1/2 top-full z-10 mt-2 w-64 -translate-x-1/2 rounded-lg border border-border/60 bg-background/95 p-3 text-left text-xs text-foreground/80 shadow-lg backdrop-blur-sm">
              {INFLUENCE_TOOLTIP}
            </div>
          )}
        </div>
        <Caption>HIGH-SIGNAL FOLLOWERS</Caption>
      </div>
      <div className="mb-5 grid grid-cols-3 gap-3 rounded-xl border border-border/40 bg-background/20 p-3">
        <SubStat icon={Briefcase} value={<CountUp end={d.vcs} duration={1200} />} label="VCs" />
        <SubStat icon={Layers} value={<CountUp end={d.projects} duration={1200} />} label="Projects" />
        <SubStat icon={Users} value={<CountUp end={d.influencers} duration={1200} />} label="Influencers" />
      </div>
      <PullQuote>You are followed by signal, not noise.</PullQuote>
      <p className="mb-5 text-xs text-ink-faint">
        If just 5 of them join your REP, your 4-generation network can reach 125
        people.
      </p>
      <ShareRow storyId="x1-smart-followers" />
    </StoryCard>
  )
}

// X2 - NOTABLE FOLLOWERS
export function X2NotableFollowers() {
  return (
    <StoryCard label="NOTABLE FOLLOWERS" seedKey="x2-notable-followers">
      <div className="mb-5 text-center">
        <BigStat>
          <CountUp end={X_DATA.notableScore} />
        </BigStat>
        <Caption>CUMULATIVE INFLUENCE SCORE</Caption>
      </div>
      <div className="mb-5 space-y-2">
        {X_DATA.notableFollowers.map((f, i) => (
          <div
            key={f.handle}
            className="flex animate-in fade-in slide-in-from-left-4 items-center gap-3 rounded-lg border border-border/40 bg-background/20 p-2"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}
          >
            <div className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-border/60">
              <Image src={f.avatarUrl} alt={f.handle} fill sizes="36px" className="object-cover" />
            </div>
            <div className="flex-1 text-sm font-medium text-foreground">@{f.handle}</div>
            <div className="font-mono text-sm font-semibold text-foreground">
              <CountUp end={f.score} duration={1200 + i * 100} decimals={1} />
            </div>
          </div>
        ))}
      </div>
      <PullQuote>The people who follow you define your signal.</PullQuote>
      <ShareRow storyId="x2-notable-followers" />
    </StoryCard>
  )
}

// X3 - INNER CIRCLE
export function X3InnerCircle() {
  return (
    <StoryCard label="INNER CIRCLE" seedKey="x3-inner-circle">
      <p className="mb-5 text-center text-sm text-ink-mute">
        Your top 3 closest connections by mutual engagement
      </p>
      <div className="mb-5 grid grid-cols-3 gap-2">
        {X_DATA.innerCircle.map((c, i) => (
          <div
            key={c.handle}
            className="flex animate-in fade-in zoom-in-95 flex-col items-center gap-2 rounded-xl border border-border/40 bg-background/20 p-3 text-center"
            style={{ animationDelay: `${i * 150}ms`, animationFillMode: "backwards" }}
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-border/60">
              <Image src={c.avatarUrl} alt={c.handle} fill sizes="48px" className="object-cover" />
            </div>
            <div className="truncate text-xs font-medium text-foreground">@{c.handle}</div>
            <div className="font-mono text-lg font-bold text-positive">
              <CountUp end={c.score} duration={1200 + i * 100} />
            </div>
          </div>
        ))}
      </div>
      <PullQuote>Trust is mutual. These people prove it.</PullQuote>
      <ShareRow storyId="x3-inner-circle" />
    </StoryCard>
  )
}

// v2.2: X4 Top Interactions, X5 Audience Authenticity, X6 Engagement Quality
// dropped per choly review (07/05). See STORIES_DEV_HANDOFF.md §13 v2.2.

// X7 - YOUR ORBIT (renamed from YOUR TRIBES in v2.2)
export function X7Tribes() {
  const top = X_DATA.tribes[0]
  return (
    <StoryCard label="YOUR ORBIT" seedKey="x7-tribes">
      <div className="mb-5 text-center">
        <BigStat>
          <CountUp end={top.percentage} suffix="%" />
        </BigStat>
        <Caption>{top.name}-leaning</Caption>
      </div>
      <div className="mb-5 space-y-3">
        {X_DATA.tribes.map((t, i) => {
          const colors = TRIBE_COLORS[t.name] ?? {
            bg: "bg-primary/20",
            text: "text-primary",
            bar: "bg-primary",
          }
          return (
            <div
              key={t.name}
              className="animate-in fade-in slide-in-from-right-4 space-y-1.5"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
                  {t.name}
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  <CountUp end={t.percentage} duration={1200 + i * 100} suffix="%" />
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`}
                  style={{ width: `${t.percentage * 2.5}%`, transitionDelay: `${i * 150}ms` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <PullQuote>You are what your graph says you are.</PullQuote>
      <ShareRow storyId="x7-tribes" />
    </StoryCard>
  )
}

// X8 - CONVERSATION DRIVER (renamed from MINDSHARE LEADER in v2.2)
export function X8Mindshare() {
  const d = X_DATA.mindshare
  return (
    <StoryCard label="CONVERSATION DRIVER" seedKey="x8-mindshare">
      <div className="mb-3 text-center">
        <BigStat>
          Top <CountUp end={d.percentile} suffix="%" />
        </BigStat>
      </div>
      <div className="mb-5 text-center">
        <Caption>Top voice in {d.category}</Caption>
      </div>
      <PullQuote>{"You're not following the conversation. You are it."}</PullQuote>
      <ShareRow storyId="x8-mindshare" />
    </StoryCard>
  )
}

// X9 - X SENIORITY
export function X9AccountAge() {
  const d = X_DATA.accountAge
  const isOg = d.createdAtYear <= 2020
  return (
    <StoryCard label="X SENIORITY" seedKey="x9-account-age">
      <div className="mb-3 text-center">
        <MidStat>
          <CountUp end={d.yearsOnX} /> YEARS
        </MidStat>
      </div>
      <div className="mb-4 text-center">
        <Caption>On X since {d.monthYear}</Caption>
      </div>
      <div className="mb-5">
        <TierLabel tone={isOg ? "positive" : "accent"}>{d.ogTier}</TierLabel>
      </div>
      <PullQuote>
        {isOg ? "You were here before the hype." : "Your journey is just starting."}
      </PullQuote>
      <ShareRow storyId="x9-account-age" />
    </StoryCard>
  )
}

// X10 - MOMENTUM
export function X10Momentum() {
  const d = X_DATA.momentum
  const max = Math.max(...d.sparkline)
  const w = 280
  const h = 56
  const points = d.sparkline
    .map((v, i) => {
      const x = (i / (d.sparkline.length - 1)) * w
      const y = h - (v / max) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <StoryCard label="MOMENTUM" seedKey="x10-momentum">
      <div className="mb-3 text-center">
        <BigStat>
          +<CountUp end={d.growth30d} />
        </BigStat>
        <Caption>New influence followers this month</Caption>
      </div>
      <div className="mb-4 flex justify-center">
        <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="overflow-visible">
          <defs>
            <linearGradient id="momentum-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2" />
          <polyline points={`${points} ${w},${h} 0,${h}`} fill="url(#momentum-grad)" />
        </svg>
      </div>
      <div className="mb-5">
        <TierLabel tone="positive">{d.label}</TierLabel>
      </div>
      <PullQuote>Signal is building around you.</PullQuote>
      <ShareRow storyId="x10-momentum" />
    </StoryCard>
  )
}
