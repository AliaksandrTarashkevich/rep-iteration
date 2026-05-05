/**
 * Server-safe story share registry.
 *
 * Used by both the OG image route (`/api/og/story`) and the share landing
 * page (`/share/[type]/[handle]`) so the preview card and the link target
 * always render consistent stat/tagline content.
 *
 * Values are demo-mirrored from the live app's MOCK_DATA. When real data
 * wiring lands, swap the static `STORY_SHARE_INFO` map for a per-handle
 * lookup (DB / API call) — the OG route and share page will keep working.
 */

export type StoryType =
  | "smart-followers"
  | "notable-followers"
  | "inner-circle"
  | "community"
  | "rank"
  | "share-magnet"
  | "onchain-snapshot"
  | "ecosystem"
  | "wallet-age"
  | "defi-power"
  | "summary"

export interface SubStat {
  value: string
  label: string
}

export interface StoryShareInfo {
  /** ALL-CAPS label rendered in mint on the OG card. */
  label: string
  /** Large hero number / value. */
  value: string
  /** Label directly beneath the hero number (e.g. "Smart Followers"). */
  heroLabel: string
  /** Up to 3 sub-stats rendered beneath the hero label. */
  subStats: SubStat[]
  /** Italic tagline / pull quote below the sub-stats. */
  tagline: string
  /** Short version used in X intent text (no tagline). */
  stat: string
}

export const STORY_TYPES: StoryType[] = [
  "smart-followers",
  "notable-followers",
  "inner-circle",
  "community",
  "rank",
  "share-magnet",
  "onchain-snapshot",
  "ecosystem",
  "wallet-age",
  "defi-power",
  "summary",
]

export const STORY_SHARE_INFO: Record<StoryType, StoryShareInfo> = {
  "smart-followers": {
    label: "Smart Followers",
    value: "448",
    heroLabel: "Smart Followers",
    subStats: [
      { value: "47", label: "VCs" },
      { value: "89", label: "Projects" },
      { value: "312", label: "Influencers" },
    ],
    tagline: "You are followed by signal, not noise.",
    stat: "448 smart followers",
  },
  "notable-followers": {
    label: "Notable Score",
    value: "38.0",
    heroLabel: "Notable Score",
    subStats: [
      { value: "@vitalik", label: "94.2" },
      { value: "@cobie", label: "87.5" },
      { value: "@punk6529", label: "82.1" },
    ],
    tagline: "The people who follow you define your signal.",
    stat: "Notable Score 38.0",
  },
  "inner-circle": {
    label: "Inner Circle",
    value: "94",
    heroLabel: "Avg Trust Score",
    subStats: [
      { value: "@hsaka", label: "98" },
      { value: "@loomdart", label: "94" },
      { value: "@blknoiz06", label: "91" },
    ],
    tagline: "Trust is mutual. These people prove it.",
    stat: "Inner circle of 3",
  },
  community: {
    label: "Your Community",
    value: "34%",
    heroLabel: "DeFi Maxi",
    subStats: [
      { value: "22%", label: "NFT/Art" },
      { value: "19%", label: "DAO" },
      { value: "15%", label: "MEV" },
    ],
    tagline: "You are what your graph says you are.",
    stat: "DeFi maxi (34%)",
  },
  rank: {
    label: "Your Rank",
    value: "Top 3%",
    heroLabel: "on REP Network",
    subStats: [
      { value: "847", label: "REP" },
      { value: "#3,840", label: "Position" },
      { value: "128K", label: "Identities" },
    ],
    tagline: "Reputation isn't given. It's proven.",
    stat: "Top 3% on REP Network",
  },
  "share-magnet": {
    label: "Share Magnet",
    value: "$12.4M",
    heroLabel: "Total Volume",
    subStats: [
      { value: "Top 0.4%", label: "DeFi Power" },
      { value: "3", label: "Badges" },
      { value: "OG", label: "DeFi Summer" },
    ],
    tagline: "Badges earned, not bought.",
    stat: "Top 0.4% DeFi Power User",
  },
  "onchain-snapshot": {
    label: "Onchain Snapshot",
    value: "$45.2K",
    heroLabel: "Portfolio Value",
    subStats: [
      { value: "8", label: "Chains" },
      { value: "23", label: "Protocols" },
      { value: "4.2K", label: "Txns" },
    ],
    tagline: "Every tx leaves a trail. Mine tells a story.",
    stat: "Onchain since 2021",
  },
  ecosystem: {
    label: "Your Ecosystem",
    value: "45%",
    heroLabel: "Ethereum Activity",
    subStats: [
      { value: "28%", label: "Base" },
      { value: "15%", label: "Arbitrum" },
      { value: "8%", label: "Optimism" },
    ],
    tagline: "Chains chosen, not assigned.",
    stat: "Ethereum maxi",
  },
  "wallet-age": {
    label: "Wallet Age",
    value: "4",
    heroLabel: "Years Onchain",
    subStats: [
      { value: "4,200", label: "Txns" },
      { value: "8", label: "Chains" },
      { value: "2021", label: "Active since" },
    ],
    tagline: "Onchain veterans are the backbone of web3.",
    stat: "4 years onchain",
  },
  "defi-power": {
    label: "DeFi Power",
    value: "23",
    heroLabel: "Protocols Used",
    subStats: [
      { value: "Uniswap", label: "#1" },
      { value: "Aave", label: "#2" },
      { value: "Compound", label: "#3" },
    ],
    tagline: "True DeFi natives build, they don't speculate.",
    stat: "23 protocols explored",
  },
  summary: {
    label: "REP Card",
    value: "847",
    heroLabel: "REP Score",
    subStats: [
      { value: "448", label: "Signal" },
      { value: "5", label: "Communities" },
      { value: "yo", label: "Rank" },
    ],
    tagline: "Chief Vampire Officer hacking neon coordination graphs.",
    stat: "REP Score 847",
  },
}

export function isStoryType(x: string): x is StoryType {
  return (STORY_TYPES as readonly string[]).includes(x)
}

export function getStoryShareInfo(type: string): StoryShareInfo | null {
  if (!isStoryType(type)) return null
  return STORY_SHARE_INFO[type]
}

/** Short, human-readable page title for `<title>` and X card title. */
export function getStoryPageTitle(type: StoryType, handle: string) {
  return `@${handle}'s ${STORY_SHARE_INFO[type].label} — REP`
}
