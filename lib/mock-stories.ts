import type { RankTier } from "@/lib/auth-context"
import { getAvatarUrl } from "@/lib/avatars"

export type AuthSource = "x" | "wallet"

export type StoryKind =
  | "data"
  | "prompt"
  | "blurred"
  | "summary"

// v2.2: x4-top-interactions, x5-audience-authenticity, x6-engagement-quality,
// c1-anti-sybil dropped per choly review (07/05). solana-followup added (§5.4).
export type StoryId =
  | "x1-smart-followers"
  | "x2-notable-followers"
  | "x3-inner-circle"
  | "x7-tribes"
  | "x8-mindshare"
  | "x9-account-age"
  | "x10-momentum"
  | "w1-onchain-snapshot"
  | "w2-ecosystem"
  | "w3-wallet-age"
  | "w4-pnl"
  | "w5-best-trade"
  | "w6-worst-trade"
  | "w7-diamond-hands"
  | "w8-token-diversity"
  | "w9-gas-station"
  | "c2-network-compounding"
  | "c3-rank"
  | "connect-wallet"
  | "connect-x"
  | "blurred-onchain"
  | "blurred-twitter"
  | "solana-followup"
  | "subscribe-rep"
  | "summary"

export interface StoryDescriptor {
  id: StoryId
  block: "x" | "w" | "c" | "intermediate" | "final"
  kind: StoryKind
  label: string
  shareable: boolean
  requiresSource?: AuthSource
}

export const USER = {
  handle: "tradoor",
  avatarUrl: getAvatarUrl("tradoor"),
  rankTier: "yo" as RankTier,
}

export const X_DATA = {
  // X1 Smart Followers
  smartFollowers: {
    total: 448,
    vcs: 47,
    projects: 89,
    influencers: 312,
  },

  // X2 Notable Followers (top 5 by score)
  notableFollowers: [
    { handle: "vitalik", score: 94.2, avatarUrl: getAvatarUrl("vitalik") },
    { handle: "cobie", score: 87.5, avatarUrl: getAvatarUrl("cobie") },
    { handle: "punk6529", score: 82.1, avatarUrl: getAvatarUrl("punk6529") },
    { handle: "tetranode", score: 78.9, avatarUrl: getAvatarUrl("tetranode") },
    { handle: "DefiIgnas", score: 71.3, avatarUrl: getAvatarUrl("DefiIgnas") },
  ],
  notableScore: 414,

  // X3 Inner Circle (top 3 by mutual engagement)
  innerCircle: [
    { handle: "hsaka", score: 98, avatarUrl: getAvatarUrl("hsaka") },
    { handle: "loomdart", score: 94, avatarUrl: getAvatarUrl("loomdart") },
    { handle: "blknoiz06", score: 91, avatarUrl: getAvatarUrl("blknoiz06") },
  ],

  // X7 Tribes (label "YOUR ORBIT" в UI v2.2; data shape без изменений)
  tribes: [
    { name: "DeFi", percentage: 34 },
    { name: "NFT/Art", percentage: 22 },
    { name: "DAO", percentage: 19 },
    { name: "MEV", percentage: 15 },
    { name: "Builders", percentage: 10 },
  ],

  // X8 Mindshare
  mindshare: {
    percentile: 4,
    category: "Onchain Reputation",
  },

  // X9 Account Age (X seniority)
  accountAge: {
    yearsOnX: 9,
    monthYear: "March 2017",
    createdAtYear: 2017,
    ogTier: "X OG",
  },

  // X10 Momentum
  momentum: {
    growth30d: 142,
    sparkline: [12, 15, 18, 22, 19, 27, 31, 38, 35, 42, 48, 56, 61, 68, 74, 81, 88, 96, 104, 110, 118, 124, 129, 134, 138, 140, 142],
    label: "Accelerating",
  },
}

export const W_DATA = {
  // W1 Onchain Snapshot
  onchainSnapshot: {
    txCount: 4247,
    protocolCount: 23,
    pnl: 12438,
    yearsOnchain: 5,
    firstTxDate: "April 2021",
    tier: "Power User",
  },

  // W2 Ecosystem (v2.2: top 5 protocols, было 3)
  ecosystem: {
    chains: [
      { name: "Ethereum", percentage: 45 },
      { name: "Base", percentage: 28 },
      { name: "Arbitrum", percentage: 15 },
      { name: "Optimism", percentage: 8 },
      { name: "Polygon", percentage: 4 },
    ],
    protocols: ["Uniswap", "Aave", "Compound", "Lido", "Curve"],
  },

  // W3 Wallet Age
  walletAge: {
    years: 5,
    firstTxDate: "April 2021",
    firstTxYear: 2021,
    ogTier: "Bull Run Survivor",
  },

  // W4 PnL — positive variant by default. flip pnl<0 to test battle-scarred.
  pnl: {
    total: 12438, // change to -7250 to test battle-scarred
    tierLabel: "Battle-scarred Degen", // shown when negative
  },

  // W5 Best Trade
  bestTrade: {
    ticker: "WIF",
    pnl: 28400,
  },

  // W6 Worst Trade
  worstTrade: {
    ticker: "LUNA",
    pnl: -4820,
  },

  // W7 Diamond Hands
  diamondHands: {
    token: "ETH",
    days: 1342,
    holdSince: "Jan 2022",
    tier: "Iron Grip",
  },

  // W8 Token Diversity
  tokenDiversity: {
    uniqueTokens: 34,
    chains: 8,
    uniqueNfts: 12,
    tier: "Collector",
  },

  // W9 Gas Station
  gasStation: {
    gasSpent: 2840,
    percentile: 8,
  },
}

export const CLOSING_DATA = {
  // v2.2: C1 Anti-Sybil dropped (choly review). Triple-signal logic moved
  // inline into computeSignatureBadge in components/stories/final-card.tsx.

  // C2 Network Compounding
  networkCompounding: {
    invitees: 3,
    reach4gen: 125, // 5×5×5
    generations: [1, 5, 25, 125],
  },

  // C3 Rank / Percentile
  rank: {
    percentile: "Top 3%",
    percentileNumber: 3,
    repScore: 847,
    rank: 3840,
    totalIdentities: 128000,
  },
}

export const FINAL_CARD = {
  rankLabel: "Adept" as "Pilgrim" | "Apprentice" | "Adept" | "Master" | "Sage",
  identityBadge: "Top 5% DeFi Maxi", // computed from highest-priority signal
  achievements: ["DeFi OG", "Inner Circle", "X OG", "Bull Run Survivor"],
}

// ---------------------------------------------------------------------------
// Story registry — used by the path-matrix controller
// ---------------------------------------------------------------------------

export const STORY_REGISTRY: Record<StoryId, StoryDescriptor> = {
  "x1-smart-followers": { id: "x1-smart-followers", block: "x", kind: "data", label: "INFLUENCE", shareable: true, requiresSource: "x" },
  "x2-notable-followers": { id: "x2-notable-followers", block: "x", kind: "data", label: "NOTABLE FOLLOWERS", shareable: true, requiresSource: "x" },
  "x3-inner-circle": { id: "x3-inner-circle", block: "x", kind: "data", label: "INNER CIRCLE", shareable: true, requiresSource: "x" },
  "x7-tribes": { id: "x7-tribes", block: "x", kind: "data", label: "YOUR ORBIT", shareable: true, requiresSource: "x" },
  "x8-mindshare": { id: "x8-mindshare", block: "x", kind: "data", label: "CONVERSATION DRIVER", shareable: true, requiresSource: "x" },
  "x9-account-age": { id: "x9-account-age", block: "x", kind: "data", label: "X SENIORITY", shareable: true, requiresSource: "x" },
  "x10-momentum": { id: "x10-momentum", block: "x", kind: "data", label: "MOMENTUM", shareable: true, requiresSource: "x" },

  "w1-onchain-snapshot": { id: "w1-onchain-snapshot", block: "w", kind: "data", label: "ONCHAIN SNAPSHOT", shareable: true, requiresSource: "wallet" },
  "w2-ecosystem": { id: "w2-ecosystem", block: "w", kind: "data", label: "ECOSYSTEM", shareable: true, requiresSource: "wallet" },
  "w3-wallet-age": { id: "w3-wallet-age", block: "w", kind: "data", label: "WALLET AGE", shareable: true, requiresSource: "wallet" },
  "w4-pnl": { id: "w4-pnl", block: "w", kind: "data", label: "TOTAL PNL", shareable: true, requiresSource: "wallet" },
  "w5-best-trade": { id: "w5-best-trade", block: "w", kind: "data", label: "BEST TRADE", shareable: true, requiresSource: "wallet" },
  "w6-worst-trade": { id: "w6-worst-trade", block: "w", kind: "data", label: "WORST TRADE", shareable: true, requiresSource: "wallet" },
  "w7-diamond-hands": { id: "w7-diamond-hands", block: "w", kind: "data", label: "DIAMOND HANDS", shareable: true, requiresSource: "wallet" },
  "w8-token-diversity": { id: "w8-token-diversity", block: "w", kind: "data", label: "PORTFOLIO DIVERSITY", shareable: true, requiresSource: "wallet" },
  "w9-gas-station": { id: "w9-gas-station", block: "w", kind: "data", label: "GAS STATION REGULAR", shareable: true, requiresSource: "wallet" },

  "c2-network-compounding": { id: "c2-network-compounding", block: "c", kind: "data", label: "YOUR NETWORK COMPOUNDS", shareable: true },
  "c3-rank": { id: "c3-rank", block: "c", kind: "data", label: "YOUR RANK", shareable: true },

  "connect-wallet": { id: "connect-wallet", block: "intermediate", kind: "prompt", label: "CONNECT WALLET", shareable: false },
  "connect-x": { id: "connect-x", block: "intermediate", kind: "prompt", label: "CONNECT X", shareable: false },
  "blurred-onchain": { id: "blurred-onchain", block: "intermediate", kind: "blurred", label: "ONCHAIN LOCKED", shareable: false },
  "blurred-twitter": { id: "blurred-twitter", block: "intermediate", kind: "blurred", label: "SOCIAL LOCKED", shareable: false },
  "solana-followup": { id: "solana-followup", block: "intermediate", kind: "prompt", label: "ADD SOLANA", shareable: false },
  "subscribe-rep": { id: "subscribe-rep", block: "intermediate", kind: "prompt", label: "FOLLOW @R3P", shareable: false },

  summary: { id: "summary", block: "final", kind: "summary", label: "REP CARD", shareable: true },
}

// ---------------------------------------------------------------------------
// Share text builders — per spec §2/§3/§4 (no em/en dashes anywhere)
// ---------------------------------------------------------------------------

const repLink = (handle: string) => `rep.xyz/@${handle}?ref=@${handle}`

export const SHARE_TEXT: Record<StoryId, (handle: string) => string> = {
  "x1-smart-followers": (h) => {
    const d = X_DATA.smartFollowers
    return `${d.vcs} VCs + ${d.projects} Projects + ${d.influencers} Influencers follow me.\n\nSignal > noise. What's yours?\n\n${repLink(h)}`
  },
  "x2-notable-followers": (h) => {
    const [a, b, c] = X_DATA.notableFollowers
    return `@${a.handle} follows me. So do @${b.handle} and @${c.handle}.\n\nThat's signal, not noise. What's yours?\n\n${repLink(h)}`
  },
  "x3-inner-circle": (h) => {
    const [a, b, c] = X_DATA.innerCircle
    return `My inner circle on @R3P:\n\n@${a.handle} · @${b.handle} · @${c.handle}\n\nTrust is mutual. Who's yours?\n\n${repLink(h)}`
  },
  "x7-tribes": (h) => {
    const top = X_DATA.tribes[0]
    return `I'm ${top.percentage}% ${top.name}-leaning according to @R3P.\n\nWhat's your orbit?\n\n${repLink(h)}`
  },
  "x8-mindshare": (h) =>
    `Top ${X_DATA.mindshare.percentile}% voice in ${X_DATA.mindshare.category} this week.\n\nNot following the conversation. Becoming it.\n\n${repLink(h)}`,
  "x9-account-age": (h) =>
    `On X since ${X_DATA.accountAge.monthYear}. ${X_DATA.accountAge.yearsOnX} years of building in public.\n\n${X_DATA.accountAge.ogTier} verified by @R3P.\n\n${repLink(h)}`,
  "x10-momentum": (h) =>
    `+${X_DATA.momentum.growth30d} influence followers in 30 days. ${X_DATA.momentum.label}.\n\nTrack your signal on @R3P.\n\n${repLink(h)}`,

  "w1-onchain-snapshot": (h) => {
    const d = W_DATA.onchainSnapshot
    return `${d.txCount.toLocaleString()} txs. ${d.protocolCount} protocols. ${d.yearsOnchain} years onchain.\n\nMy chain history on @R3P. What's yours?\n\n${repLink(h)}`
  },
  "w2-ecosystem": (h) => {
    const top = W_DATA.ecosystem.chains[0]
    return `${top.percentage}% ${top.name}. The rest? Scattered across ${W_DATA.ecosystem.chains.length} EVM chains.\n\nMy ecosystem on @R3P.\n\n${repLink(h)}`
  },
  "w3-wallet-age": (h) =>
    `On-chain since ${W_DATA.walletAge.firstTxDate}. ${W_DATA.walletAge.years} years.\n\n${W_DATA.walletAge.ogTier} - verified by @R3P.\n\n${repLink(h)}`,
  "w4-pnl": (h) => {
    const p = W_DATA.pnl
    if (p.total > 0) {
      return `+$${p.total.toLocaleString()} earned on-chain.\n\nThe graph remembers. What's yours?\n\n${repLink(h)}`
    }
    return `${p.tierLabel}. -$${Math.abs(p.total).toLocaleString()} in the trenches. Still standing.\n\n@R3P · ${repLink(h)}`
  },
  "w5-best-trade": (h) => {
    const t = W_DATA.bestTrade
    return `$${t.ticker}: +$${t.pnl.toLocaleString()}\n\nOne trade. On-chain receipts. What's yours?\n\n${repLink(h)}`
  },
  "w6-worst-trade": (h) => {
    const t = W_DATA.worstTrade
    return `$${t.ticker}: -$${Math.abs(t.pnl).toLocaleString()}\n\nLost it. Still trading. What's your worst?\n\n${repLink(h)}`
  },
  "w7-diamond-hands": (h) => {
    const d = W_DATA.diamondHands
    return `Held ${d.token} for ${d.days} days. Since ${d.holdSince}.\n\n${d.tier} hands verified by @R3P.\n\n${repLink(h)}`
  },
  "w8-token-diversity": (h) => {
    const d = W_DATA.tokenDiversity
    return `${d.uniqueTokens} tokens. ${d.uniqueNfts} NFT collections. ${d.tier}.\n\nMy portfolio diversity on @R3P.\n\n${repLink(h)}`
  },
  "w9-gas-station": (h) =>
    `Gas Station Regular on @R3P.\n\nBurned more gas than ${100 - W_DATA.gasStation.percentile}% of users. No regrets. Okay, maybe some.\n\n${repLink(h)}`,

  "c2-network-compounding": (h) =>
    `My 4-gen network on @R3P can reach ${CLOSING_DATA.networkCompounding.reach4gen} people.\n\nTrust compounds. Followers don't.\n\n${repLink(h)}`,
  "c3-rank": (h) => {
    const r = CLOSING_DATA.rank
    return `Top ${r.percentileNumber}% out of ${(r.totalIdentities / 1000).toFixed(0)}k identities on @R3P.\n\nReputation isn't given. It's proven.\n\n${repLink(h)}`
  },

  "connect-wallet": () => "",
  "connect-x": () => "",
  "blurred-onchain": () => "",
  "blurred-twitter": () => "",
  "solana-followup": () => "",
  "subscribe-rep": () => "",

  summary: (h) => {
    const d = W_DATA.onchainSnapshot
    const r = CLOSING_DATA.rank
    return `${r.repScore} REP · top ${r.percentileNumber}%\n${d.txCount.toLocaleString()} txs · +$${d.pnl.toLocaleString()} on-chain · ${d.yearsOnchain}y in the graph\n\nThe graph weighed me. What's your gravity?\n${repLink(h)}`
  },
}

// ---------------------------------------------------------------------------
// Trigger evaluation — decides whether a story shows for the current user
// ---------------------------------------------------------------------------

export function evaluateTrigger(id: StoryId): boolean {
  switch (id) {
    case "x1-smart-followers":
      return X_DATA.smartFollowers.total >= 1
    case "x2-notable-followers":
      return X_DATA.notableFollowers.length >= 1
    case "x3-inner-circle":
      return X_DATA.innerCircle.length >= 3
    case "x7-tribes":
      return X_DATA.tribes.some((t) => t.percentage >= 10)
    case "x8-mindshare":
      return X_DATA.mindshare.percentile <= 10
    case "x9-account-age":
      return X_DATA.accountAge.createdAtYear <= 2020
    case "x10-momentum":
      return X_DATA.momentum.growth30d >= 10

    case "w1-onchain-snapshot":
      return W_DATA.onchainSnapshot.txCount >= 1
    case "w2-ecosystem":
      return W_DATA.ecosystem.chains.length >= 2
    case "w3-wallet-age":
      return W_DATA.walletAge.firstTxYear <= 2022
    case "w4-pnl":
      return W_DATA.pnl.total !== 0
    case "w5-best-trade":
      return W_DATA.bestTrade.pnl > 1000
    case "w6-worst-trade":
      return W_DATA.worstTrade.pnl < -1000
    case "w7-diamond-hands":
      return W_DATA.diamondHands.days >= 365
    case "w8-token-diversity":
      return W_DATA.tokenDiversity.uniqueTokens >= 6
    case "w9-gas-station":
      return W_DATA.gasStation.gasSpent >= 1000

    case "c2-network-compounding":
      return true
    case "c3-rank":
      return CLOSING_DATA.rank.percentileNumber <= 50

    default:
      return true
  }
}
