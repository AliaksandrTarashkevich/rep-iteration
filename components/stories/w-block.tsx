"use client"

import {
  Activity,
  Network,
  Coins,
  Calendar,
  TrendingUp,
  Flame,
  Diamond,
  Image as ImageIcon,
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
  AnimatedBar,
} from "./primitives"
import { W_DATA } from "@/lib/mock-stories"

// W1 - ONCHAIN SNAPSHOT
export function W1OnchainSnapshot() {
  const d = W_DATA.onchainSnapshot
  return (
    <StoryCard label="ONCHAIN SNAPSHOT" seedKey="w1-onchain-snapshot">
      <div className="mb-4">
        <TierLabel>{d.tier}</TierLabel>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-border/40 bg-background/20 p-3">
        <SubStat icon={Activity} value={<CountUp end={d.txCount} />} label="Transactions" />
        <SubStat
          icon={Coins}
          value={<CountUp end={d.protocolCount} duration={1200} />}
          label="Protocols"
        />
        <SubStat
          icon={TrendingUp}
          value={
            <>
              +$<CountUp end={d.pnl / 1000} duration={1500} decimals={1} />k
            </>
          }
          label="PnL"
        />
        <SubStat
          icon={Calendar}
          value={
            <>
              <CountUp end={d.yearsOnchain} duration={1200} />y
            </>
          }
          label="Onchain"
        />
      </div>
      <div className="mb-5 text-center">
        <Caption>First tx: {d.firstTxDate}</Caption>
      </div>
      <PullQuote>Your chain history speaks louder than words.</PullQuote>
      <ShareRow storyId="w1-onchain-snapshot" />
    </StoryCard>
  )
}

// W2 - ECOSYSTEM (v2.2: caption explicit %, EVM hook, top 5 protocols, protocols above bars)
export function W2Ecosystem() {
  const chains = W_DATA.ecosystem.chains
  const top = chains[0]
  return (
    <StoryCard label="ECOSYSTEM" seedKey="w2-ecosystem">
      <div className="mb-5 text-center">
        <BigStat>
          <CountUp end={top.percentage} suffix="%" />
        </BigStat>
        <Caption>
          {top.name} Activity ({top.percentage}% of {chains.length} EVM chains)
        </Caption>
      </div>
      {/* v2.2: protocols row promoted above bar-chart per choly review */}
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <Coins className="h-3 w-3" /> Top Protocols
        </div>
        <div className="flex flex-wrap gap-2">
          {W_DATA.ecosystem.protocols.map((p) => (
            <span
              key={p}
              className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <Network className="h-3 w-3" /> Chain Activity
        </div>
        <div className="space-y-2">
          {chains.map((chain, i) => (
            <div key={chain.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">{chain.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  <CountUp end={chain.percentage} duration={1200 + i * 100} suffix="%" />
                </span>
              </div>
              <AnimatedBar percentage={chain.percentage * 2} delay={i * 100} />
            </div>
          ))}
        </div>
      </div>
      <PullQuote>EVM-native, not chain-locked.</PullQuote>
      <ShareRow storyId="w2-ecosystem" />
    </StoryCard>
  )
}

// W3 - WALLET AGE
export function W3WalletAge() {
  const d = W_DATA.walletAge
  return (
    <StoryCard label="WALLET AGE" seedKey="w3-wallet-age">
      <div className="mb-3 text-center">
        <MidStat>
          <CountUp end={d.years} /> YEARS
        </MidStat>
      </div>
      <div className="mb-4 text-center">
        <Caption>On-chain since {d.firstTxDate}</Caption>
      </div>
      <div className="mb-5">
        <TierLabel tone="positive">{d.ogTier}</TierLabel>
      </div>
      <PullQuote>You were on-chain before it was cool.</PullQuote>
      <ShareRow storyId="w3-wallet-age" />
    </StoryCard>
  )
}

// W4 - PNL (dual: positive vs battle-scarred)
export function W4Pnl() {
  const p = W_DATA.pnl
  const positive = p.total > 0
  const abs = Math.abs(p.total)
  return (
    <StoryCard
      label={positive ? "TOTAL PNL" : "BATTLE-SCARRED"}
      seedKey="w4-pnl"
    >
      <div className="mb-3 text-center">
        {positive ? (
          <BigStat>
            +$<CountUp end={abs / 1000} decimals={abs >= 10000 ? 0 : 1} />k
          </BigStat>
        ) : (
          <div className="flex items-center justify-center py-1">
            <div
              className="num text-7xl font-medium leading-none tracking-[-0.02em] text-red-300"
              style={{
                textShadow:
                  "0 0 28px rgba(248, 113, 113, 0.32), 0 0 10px rgba(248, 113, 113, 0.18)",
              }}
            >
              -$<CountUp end={abs / 1000} decimals={abs >= 10000 ? 0 : 1} />k
            </div>
          </div>
        )}
      </div>
      <div className="mb-5 text-center">
        {positive ? (
          <Caption>All-time on-chain</Caption>
        ) : (
          <p className="text-sm font-semibold text-red-300">{p.tierLabel}</p>
        )}
      </div>
      <PullQuote>
        {positive ? "Every trade has a signature." : "Still here. That's the proof."}
      </PullQuote>
      <ShareRow storyId="w4-pnl" />
    </StoryCard>
  )
}

// W5 - BEST TRADE
export function W5BestTrade() {
  const t = W_DATA.bestTrade
  return (
    <StoryCard label="BEST TRADE" seedKey="w5-best-trade">
      <div className="mb-3 text-center">
        <MidStat>
          +$<CountUp end={t.pnl / 1000} decimals={1} />k on ${t.ticker}
        </MidStat>
      </div>
      <div className="mb-5 text-center">
        <Caption>One trade. On-chain receipts.</Caption>
      </div>
      <PullQuote>Not luck. Signal.</PullQuote>
      <ShareRow storyId="w5-best-trade" />
    </StoryCard>
  )
}

// W6 - WORST TRADE
export function W6WorstTrade() {
  const t = W_DATA.worstTrade
  return (
    <StoryCard label="WORST TRADE" seedKey="w6-worst-trade">
      <div className="mb-3 text-center">
        <div className="flex items-center justify-center py-1">
          <div
            className="num text-5xl font-medium leading-none tracking-[-0.02em] text-red-300"
            style={{
              textShadow:
                "0 0 28px rgba(248, 113, 113, 0.32), 0 0 10px rgba(248, 113, 113, 0.18)",
            }}
          >
            -$<CountUp end={Math.abs(t.pnl) / 1000} decimals={1} />k on ${t.ticker}
          </div>
        </div>
      </div>
      <div className="mb-5 text-center">
        <Caption>Battle scars are flexes too.</Caption>
      </div>
      <PullQuote>Lessons learned.</PullQuote>
      <ShareRow storyId="w6-worst-trade" />
    </StoryCard>
  )
}

// W7 - DIAMOND HANDS
export function W7DiamondHands() {
  const d = W_DATA.diamondHands
  return (
    <StoryCard label="DIAMOND HANDS" seedKey="w7-diamond-hands">
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 ring-1 ring-accent/40">
          <Diamond className="h-8 w-8 text-accent" />
        </div>
      </div>
      <div className="mb-3 text-center">
        <MidStat>
          <CountUp end={d.days} /> DAYS
        </MidStat>
      </div>
      <div className="mb-4 text-center">
        <Caption>
          Held {d.token} since {d.holdSince}
        </Caption>
      </div>
      <div className="mb-5">
        <TierLabel>{d.tier}</TierLabel>
      </div>
      <PullQuote>{"Conviction can't be faked."}</PullQuote>
      <ShareRow storyId="w7-diamond-hands" />
    </StoryCard>
  )
}

// W8 - PORTFOLIO DIVERSITY
export function W8TokenDiversity() {
  const d = W_DATA.tokenDiversity
  return (
    <StoryCard label="PORTFOLIO DIVERSITY" seedKey="w8-token-diversity">
      <div className="mb-3 text-center">
        <BigStat>
          <CountUp end={d.uniqueTokens} />
        </BigStat>
        <Caption>Tokens across {d.chains} chains</Caption>
      </div>
      <div className="mb-4">
        <TierLabel>{d.tier}</TierLabel>
      </div>
      <div className="mb-5 flex items-center justify-center gap-2 text-xs text-ink-mute">
        <ImageIcon className="h-3 w-3" />
        {d.uniqueNfts} NFT collections
      </div>
      <PullQuote>Your portfolio tells a story. This is chapter one.</PullQuote>
      <ShareRow storyId="w8-token-diversity" />
    </StoryCard>
  )
}

// W9 - GAS STATION REGULAR
export function W9GasStation() {
  const d = W_DATA.gasStation
  return (
    <StoryCard label="GAS STATION REGULAR" seedKey="w9-gas-station">
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/40">
          <Flame className="h-8 w-8 text-amber-400" />
        </div>
      </div>
      <div className="mb-3 text-center">
        <BigStat>
          $<CountUp end={d.gasSpent} />
        </BigStat>
        <Caption>Burned in gas</Caption>
      </div>
      <div className="mb-5">
        <TierLabel tone="negative">Top {d.percentile}% gas burner</TierLabel>
      </div>
      <PullQuote>No regrets. Okay, maybe some.</PullQuote>
      <ShareRow storyId="w9-gas-station" />
    </StoryCard>
  )
}
