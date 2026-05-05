# REP Web App — Growth & Retention Update Prompt

> **Context:** Mock site on Next.js 16 + Tailwind v4 + shadcn/ui + Framer Motion. Dark mode, black bg, mint/teal accent. All data is mock/useState — no backend.
> **Goal:** Make the app viral, retention-heavy, and centered on the reputation voting system as the core value prop.

---

## 1. LEADERBOARD (new page — sidebar nav)

Add a full **Leaderboard** page. This is the PvP layer — devs competing on proof density, not vanity metrics.

### 1a. Three leaderboard tabs (matching Reputation categories)

| Tab | Ranked by | Columns |
|-----|-----------|---------|
| **Developers** | REP Score | rank, avatar+handle, REP score, achievements count, connections count, trend arrow (↑↓), "View Profile" |
| **Agents** | Trust Score | rank, agent name, owner handle, trust score, tasks completed, success rate %, uptime |
| **Skills** | Endorsement Score | rank, skill name (e.g. "Solidity", "Prompt Engineering"), total endorsements, top endorser tier, verified practitioners count |

### 1b. Leaderboard UX details

- **Your position highlighted** — always visible even if you're #847. Sticky row at bottom: "You are #847 — 23 points from #800". Progress bar to next milestone rank.
- **Time filters:** 24h / 7d / 30d / All time — show velocity, not just totals. Someone climbing fast is more interesting than someone sitting at the top.
- **Tier badges inline:** Show Remoji tier icons (pilgrim/cicada/droog/ꙮ) next to names.
- **Percentile label:** "Top 5%", "Top 10%", "Top 25%" badges next to rank number.
- **Mini share button** on your own row → generates share card (see section 4).

### 1c. Leaderboard mock data

Generate 50+ mock entries with realistic distribution:
- Top 10: scores 900-980 (ꙮ tier, 8+ achievements)
- Top 50: scores 700-899 (droog tier, 5-7 achievements)
- Top 200: scores 400-699 (cicada tier, 3-5 achievements)
- Rest: scores 100-399 (pilgrim tier, 1-2 achievements)

Current user ("you") should be around #47 with score 742 — close enough to Top 25 to feel the pull.

---

## 2. REPUTATION TAB — Redesign as centerpiece

The Reputation page (Agents / Skills / Developers voting) is the most unique feature. Make it the hero, not a sibling tab.

### 2a. Layout upgrade

- **Move Reputation to be the SECOND item in sidebar** (right after Overview). It's more important than Connections.
- **Hero section at top:** Large heading: "The Trust Layer" with subtext: "Upvote agents, skills, and developers you trust. Your vote is weighted by your own reputation." Animated subtle glow on the heading.
- **Vote weight indicator:** Show the current user's vote weight prominently: "Your vote power: 3.2x" (based on their own REP score + achievements). Tooltip explains: "Top 5% users have 3-5x vote weight. Connect more accounts to increase yours."

### 2b. Enhanced voting cards

Each item card (agent/skill/developer) should show:
- **Score** (large, left side) with upvote/downvote arrows
- **Sparkline** — tiny 30-day trend chart of the score (7 data points)
- **Top voter badges** — "Endorsed by 3 users with 'Shipped Agent' achievement" (shows WHY the score is credible)
- **Tags** — category tags (e.g. "Code Assistant", "DeFi", "Infrastructure")
- **Verification badge** — green check if the entity has connected 3+ sources

### 2c. Context-filtered voting (make it prominent)

The achievement-based vote filters are powerful. Make them a **prominent filter bar** at the top, not hidden:

```
Filter votes by voter credentials:
[All] [Top 5% OpenAI] [Top 5% Claude] [Burned $5K+ on AI] [Shipped Agent] [AI Bubble Top 100] [OSS Contributor]
```

When a filter is active, show: "Showing scores weighted by [filter] voters only" — this demonstrates that REP votes aren't just popularity, they're credential-weighted trust signals.

### 2d. "Rate this" prompts

After a user views 3+ items without voting, show a gentle inline prompt:
> "You've used Claude extensively. Your vote on AI agents carries 2.4x weight. Rate one?"

### 2e. Mock data for Reputation

- **Agents tab:** 15+ agents. Mix of high-rep (Code Pilot: +3.2K, Data Mesh: +2.1K) and controversial (AutoTrader v3: -127, "flagged by 4 Shipped Agent holders"). Include one "trending" agent that jumped +400 in 7d.
- **Skills tab:** 20+ skills. "Solidity" (+8.4K), "Prompt Engineering" (+5.2K), "Rust" (+4.1K), "Fine-tuning" (+3.8K) down to niche ones like "MEV Strategy" (+234).
- **Developers tab:** 20+ devs. Top dev at +12K, realistic power-law distribution.

---

## 3. INSIGHT PACKS (new feature on Overview page)

This is REP's "Spotify Wrapped" — the single highest-leverage growth mechanic. Add it to the Overview dashboard.

### 3a. Insight Pack card on Overview

Below the REP Score section, add a card:

```
┌─────────────────────────────────────────────┐
│  ✨ Your Reputation Pulse — March 2026      │
│                                              │
│  Top 6% overall · 4 platforms · 742 REP     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Top 3%  │ │ 13      │ │ #47     │       │
│  │ DeFi    │ │ Achieve-│ │ Leader- │       │
│  │ Activity│ │ ments   │ │ board   │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                              │
│  "You're in the top 6% of verified          │
│   contributors across 4 platforms.           │
│   3 achievements earned this month."         │
│                                              │
│  [ 🔗 Share Insight Pack ]  [ View Full ]   │
└─────────────────────────────────────────────┘
```

### 3b. Full Insight Pack modal

Clicking "View Full" opens a full-screen modal — a multi-slide "wrapped" experience:

**Slide 1 — Score:**
"Your REP Score: 742" + animated ring chart + "Top 6% of all users"

**Slide 2 — Graph:**
"Your reputation graph" — visual showing connected platforms as nodes with lines between them. GitHub (234 repos) → X (12K followers) → Wallet (top 3% DeFi) → Email → Discord. Unconnected platforms shown as grey dashed nodes: "Connect LinkedIn to strengthen your graph"

**Slide 3 — Achievements:**
"13 achievements unlocked" — grid of unlocked achievement icons. Highlight: "Rarest: Top 5% Claude User — only 2.1% of users have this"

**Slide 4 — Leaderboard:**
"You're #47 globally" — mini leaderboard showing users around you (#45-#49). "23 points from Top 25. Connect one more platform to get there."

**Slide 5 — Share:**
Pre-rendered share card preview. One-click copy/download. Format: 1080×1080 dark bg, REP watermark, key stats. Footer: "Verified by REP · rep.xyz"

### 3c. Share flow

"Share Insight Pack" button → modal with:
- Preview of the share card image
- Copy link button
- "Share to X" button (mock — just shows a toast "Copied to clipboard")
- "Download as PNG" button (mock)

---

## 4. SHARE SYSTEM (pervasive — add to everything)

Make sharing a first-class action everywhere, not just Insight Packs.

### 4a. Achievement share cards

Every unlocked achievement in the Achievements page gets a **share button** that opens a card preview:

```
┌──────────────────────────────────┐
│          🏆                       │
│    TOP 5% CLAUDE USER            │
│                                   │
│    alex.dev · REP Score 742      │
│    Only 2.1% of users qualify    │
│                                   │
│    Verified by REP · rep.xyz     │
└──────────────────────────────────┘
```

Dark bg, mint accent, REP watermark. Each achievement card has a rarity indicator: "Only X% of users have this."

### 4b. Leaderboard position share

On the Leaderboard page, your row has a share button:

```
┌──────────────────────────────────┐
│    #47 GLOBALLY                   │
│                                   │
│    alex.dev                       │
│    REP Score: 742 · Top 6%       │
│    13 achievements · 4 platforms │
│                                   │
│    Powered by REP · rep.xyz      │
└──────────────────────────────────┘
```

### 4c. REP Score share

On Overview, the REP Score card gets a share button:

```
┌──────────────────────────────────┐
│    REP SCORE                      │
│                                   │
│         742                       │
│      ━━━━━━━━━━━○                │
│                                   │
│    Top 6% · 4 platforms          │
│    alex.dev                       │
│                                   │
│    Build yours · rep.xyz         │
└──────────────────────────────────┘
```

### 4d. Reputation vote share

After upvoting an agent/skill/dev on the Reputation page, show a brief toast:
"You endorsed Code Pilot (+3.2K). Share your take?" → links to a share card showing your vote + your credentials.

### 4e. Share card component

Build ONE reusable `<ShareCard>` component used everywhere:
- Props: `type` (achievement | leaderboard | rep_score | insight_pack | vote), `data`, `onShare`, `onDownload`
- Consistent style: black bg (#000), mint/teal accent for key numbers, REP watermark bottom-right, "Build yours · rep.xyz" or "Verified by REP · rep.xyz" footer
- Framer Motion entrance animation (scale from 0.95 + fade)
- "Copy Link" + "Download" + "Share to X" buttons (all mock — toast confirmation)

---

## 5. REFERRAL SYSTEM (new section on Overview or dedicated page)

### 5a. Referral card on Overview

Below the Insight Pack card:

```
┌─────────────────────────────────────────────┐
│  👥 Invite & Earn Trust                      │
│                                              │
│  Your invite is a trust signal, not a link. │
│  People you invite start with your           │
│  reputation as a warm start.                 │
│                                              │
│  Connector Achievement: BRONZE (7/25)        │
│  ████████░░░░░░░░░░░░░░░░░ 28%              │
│  Next: Silver (25 referrals)                 │
│                                              │
│  [ 🔗 Copy Invite Link ]                    │
│  [ 📊 View Referral Stats ]                 │
└─────────────────────────────────────────────┘
```

### 5b. Referral stats expansion

Clicking "View Referral Stats" expands or opens a panel:

| Metric | Value |
|--------|-------|
| Total invited | 7 |
| Activated (connected 1+ account) | 5 |
| Their combined REP | 2,340 |
| Your network trust multiplier | 1.3x |

List of invited users: avatar + handle + their REP score + "Trust-Linked" badge.

### 5c. Connector achievement tiers (shown with progress)

| Tier | Requirement | Status | Perk |
|------|-------------|--------|------|
| Bronze | 5 referrals | ✅ Unlocked | Connector badge |
| Silver | 25 referrals | 🔒 7/25 | 1.5x vote weight |
| Gold | 100 referrals | 🔒 | Custom Remoji + elite access |

---

## 6. RETENTION MECHANICS

### 6a. Reputation pulse notification (Overview)

A notification banner that appears on Overview (simulated — always visible in mock):

```
┌─────────────────────────────────────────────┐
│  📈 Your graph grew 12% this month.         │
│  You earned achievements 2x faster than     │
│  last month. 1 platform away from Top 5%.   │
│                                        [✕]  │
└─────────────────────────────────────────────┘
```

### 6b. Unlock proximity nudges

On the Connections page, for unconnected platforms, show what they'd unlock:

```
LinkedIn  [Not Connected]
→ "Connect to unlock: Professional Proof Pack + estimated +45 REP points"

Anthropic Claude  [Not Connected]
→ "Connect to unlock: Top 5% Claude User achievement (you likely qualify)"
```

### 6c. Achievement velocity on Achievements page

Add a stats row at the top:

```
Achievements: 13/26 unlocked · Earning rate: 2.1x faster than average · Next unlock: ~3 days
```

### 6d. Graph density indicator on Overview

Replace or augment the existing "Connections" stat card:

```
Graph Density: 67%
████████████████░░░░░░░░
"4 of 6 platform categories connected.
Connect AI Providers to reach 83% — unlocks: Top 5% threshold."
```

### 6e. "What if" simulator on Connections page

For each unconnected platform, show a simulated impact:

```
GitHub  [Not Connected]
├── Estimated REP boost: +89 points
├── Would unlock: "OSS Contributor" achievement
├── Leaderboard impact: #47 → estimated #38
└── [Connect GitHub]
```

This creates desire by showing the concrete outcome BEFORE the action.

---

## 7. MICRO-INTERACTIONS & POLISH

### 7a. Vote animations

When user upvotes/downvotes on the Reputation page:
- Number counter animates (count up/down)
- Brief green/red pulse on the score
- Confetti micro-burst on significant milestones (your first vote, 10th vote)

### 7b. Achievement unlock celebration

When navigating to an achievement that was recently "unlocked" (mock: first visit to achievements page can trigger one):
- Full-screen overlay for 2 seconds
- Achievement icon scales up with glow
- "TOP 5% CLAUDE USER — UNLOCKED"
- "Only 2.1% of users have this"
- [Share] [Dismiss] buttons
- Subtle particle effect

### 7c. Leaderboard position change animation

If user's position changed (mock: show on page load):
- Green badge: "↑ 3 positions this week"
- Brief slide-up animation on the rank number

### 7d. Progress bar animations

All progress bars (Connector tier, graph density, REP score ring) should animate on mount — not instant, but a 1-second fill animation. Creates satisfaction.

---

## 8. NAVIGATION REORDER

Update sidebar order to reflect importance:

1. **Overview** (dashboard — score, insight pack, referrals, notifications)
2. **Reputation** ← moved UP (the core product — voting on agents/skills/devs)
3. **Leaderboard** ← NEW
4. **Connections** (how you build proof)
5. **Achievements** (what you've earned)
6. **Agents** (your agents)
7. **Gated Chats** (access you've unlocked)

---

## 9. OVERVIEW PAGE — Restructure

The Overview becomes a growth-optimized dashboard:

```
┌──────────────────────────────────────────────────────┐
│  REP Score: 742         │  #47 Globally  │ Top 6%    │
│  ━━━━━━━━━━━━━━━━○      │  ↑3 this week  │           │
│                         │                │ [Share]   │
├──────────────────────────────────────────────────────┤
│  📊 Insight Pack — March 2026                        │
│  Top 6% · 4 platforms · 13 achievements              │
│  [Share Insight Pack]  [View Full]                    │
├──────────────────────────────────────────────────────┤
│  📈 Reputation Pulse                                 │
│  Graph grew 12% · 2.1x achievement velocity          │
│  1 platform from Top 5% · Connect LinkedIn →         │
├──────────────────────────────────────────────────────┤
│  👥 Referrals: 7 invited · Connector: Bronze (7/25)  │
│  [Copy Invite Link]                                   │
├──────────────────────────────────────────────────────┤
│  📈 Reputation Graph (6-month chart)                 │
│  [existing line chart]                                │
├──────────────────────────────────────────────────────┤
│  🔥 Trending on Reputation                           │
│  "Code Pilot" +412 this week · "Solidity" +89        │
│  [Go to Reputation →]                                │
├──────────────────────────────────────────────────────┤
│  Recent Activity (existing feed)                     │
└──────────────────────────────────────────────────────┘
```

---

## 10. MOCK DATA REQUIREMENTS

All features use mock data via useState. Generate realistic, consistent data:

- **User profile:** alex.dev, REP 742, #47, 13 achievements, 4 connections, 7 referrals
- **Leaderboard:** 50 entries, power-law distribution, user at #47
- **Referrals:** 7 invited, 5 activated, Bronze tier (5/25 → next: Silver)
- **Insight Pack:** March 2026, top 6%, 4 platforms, 3 new achievements this month
- **Reputation entries:** 15 agents, 20 skills, 20 developers with realistic scores
- **Vote weight:** User has 3.2x (based on Top 5% Claude + Shipped Agent achievements)

---

## IMPLEMENTATION PRIORITY

If doing in phases:

1. **Phase 1 (core viral):** Leaderboard page + Share card component + Insight Pack on Overview
2. **Phase 2 (retention):** Reputation page redesign + unlock proximity nudges + referral system
3. **Phase 3 (polish):** Animations, achievement celebrations, "what if" simulator, reputation pulse

---

## DESIGN SYSTEM NOTES

- **Colors:** Keep black (#000) bg. Mint/teal accent for positive metrics. Use amber/orange for "almost there" progress states. Red only for downvotes, never for user's own metrics.
- **Typography:** Space Grotesk for big numbers and headings. Inter for body. Fira Code for scores/ranks.
- **Cards:** Use glass-morphism (subtle white border, slight bg opacity) for share card previews. Solid dark cards for dashboard sections.
- **Animations:** Framer Motion throughout. Spring physics for counters. Ease-out for progress bars. Scale + fade for modals.
- **Share cards (for export/preview):** Always 1080×1080. Black bg. Centered content. REP watermark bottom-right. Footer text: "Verified by REP · rep.xyz"
