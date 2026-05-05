# Summary Card (Final Card in Stories)

## Purpose
"Screenshot moment" - the card users want to share. Adaptive: not a fixed set of metrics, but a selection of the most impressive data.

## AI One-liner (NEW 04/12)

**Grok API (xAI)** generates a personalized one-liner punch line per user.

- **Style:** Cyberpunk vibe, max 10 words, English, shareworthy
- **Input:** User context (achievements, REP score, connected accounts) + Grok's native Twitter data access
- **Output:** One-liner displayed on Summary Card and Profile
- **Example:** "Chief Vampire Officer hacking neon coordination graphs."
- **Why Grok:** Native Twitter/X data access without separate API calls

## Fixed Elements

| Element | Description |
|---------|-------------|
| Avatar | From X or wallet identicon |
| Nick | @handle |
| REP Score | Large number, main visual anchor |
| Overall Rank | #847 of 12,400 |

## Dynamic Slots

### Slot 1 - Avatar Highlight (up to 3 avatars, by priority)

1. **Notable Followers** (X + 3+ notable) - "followed by"
2. **Inner Circle** (X, notable < 3) - "your inner circle"
3. **Top Protocols** (wallet only) - "power user"
4. **Top Achievements** (fallback) - 3 achievement icons

### Slots 2-4 - Text Highlights (best for user)

| Rank | Highlight | Example | Threshold |
|------|-----------|---------|-----------|
| A | Twitter Score percentile | "Top 3% Crypto Twitter" | Top 50% |
| B | PnL | "+$12.4k total PnL" | Any |
| C | Active chains | "Active on 15 blockchains" | 3+ chains |
| D | Wallet age | "On-chain since 2021" | Before 2023 |
| E | Communities | "DeFi Maxi (72%)" | Dominant > 40% |
| F | Tx count | "4,200 transactions" | Top 50% |
| G | Unique assets | "47 tokens in portfolio" | 10+ assets |
| H | Early Adopter | "REP Early Adopter" | First 1000 users |

**Rule:** Don't show metrics below 50th percentile (except fun negative).

## Fun Negative Achievements

| Tier | Threshold | Label |
|------|-----------|-------|
| 1 | -$1k to -$5k | "Battle-tested" |
| 2 | -$5k to -$25k | "Battle-scarred Degen" |
| 3 | -$25k+ | "Survived the Trenches" |

Additional:
- "Gas Station Regular" (top 10% gas)
- "Chain Hopper" (10+ chains, <5 tx each)

## Card Types

| hasX | hasWallet | Type |
|------|-----------|------|
| Yes | Yes | Full REP Card |
| Yes | No | Social REP Card |
| No | Yes | Onchain REP Card |

## Components

1. **Card Container**
   - Shareable card format
   - REP branding
   - Dark theme

2. **Header Section**
   - Avatar
   - Handle
   - AI one-liner

3. **Score Display**
   - Large REP Score
   - Overall Rank

4. **Dynamic Highlights**
   - Avatar highlight slot
   - Text highlight slots (2-4)

5. **Share Button**
   - Twitter share intent
   - Download as image

## Design Notes

- Optimized for Twitter sharing dimensions
- High contrast for readability
- REP branding elements
- Cyberpunk aesthetic
