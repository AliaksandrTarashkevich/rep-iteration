# REP Web V1 - Project Overview

**Version:** 1.1  
**Date:** 24 March 2026 (updated 12 April 2026)  
**Status:** Draft

## Goal

Launch a working product with the full user journey:
- Entry via Twitter/wallet
- Stories flow
- Summary Card
- Profile
- Achievements
- Leaderboard
- Chats
- Referrals

**Open access from day one** (invite gate removed 03/31). Email capture at signup.

## Key Updates (04/07-04/12)

- Invite gate REMOVED - Open access from day one
- Early adopter achievement for first 1000 users
- Web + Chats = ONE release
- Chat structure: per ecosystem = 1 OG + 1 General + 3 behavior-type chats (~25 total across 5 ecosystems)
- TON skipped from V0 release (only Telegram connect available)
- Grok API (xAI) for AI one-liner profile descriptions
- Achievement unlock celebration - full-screen overlay
- NFT minting: Base only for V0
- Referral codes: 6-char text codes, NOT links (Twitter deprioritizes links)
- Daily task / what-to-do-next: confirmed as primary retention hook (+1 rep)

## Prototypes

- **Kellas prototype (profile):** https://repweb.thelargest.site/profile
- **V0 REP Network:** https://v0-rep-network.vercel.app/
- **V0 REP Web MVP:** https://v0-rep-web-mvp.vercel.app/
- **V0 Portable Reputation:** https://v0-portable-reputation-platform.vercel.app/
- **Figma (REP Prod):** https://www.figma.com/design/TkZGr910sTevcUczaT8q4t/REP-Prod

## Tech Stack

- Next.js (App Router)
- Dark theme (default) / Light theme
- Multilanguage: EN default
- Base blockchain for NFT minting

## Data Sources

| Source | API | Data |
|--------|-----|------|
| Twitter | Sorsa API | Analytics, engagement |
| Twitter | Moni API | Social score, graph, influence |
| Twitter | TweetScout API | Audience quality, bot detection |
| Twitter | X API (direct) | Profile, followers, follow check |
| On-chain | Zerion | Tx count, NFT, DeFi, tokens, protocols, PnL, wallet age |
