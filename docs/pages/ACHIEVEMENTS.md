# Achievements Page (/achievements)

## Purpose
Display all user achievements with ability to mint as NFTs on Base.

## Achievement Unlock Celebration (NEW 04/12 - V0 CONFIRMED)

When user has newly earned achievements, upon visiting `/achievements`:

1. **Full-screen overlay** shows new achievements one by one (top 2-3 latest)
2. **Animation:** Icon with glow effect, rarity indicator, share button
3. User taps through each
4. Then lands on normal achievements grid

## V1 Scope

- Transfer existing EVM achievements to Web
- **Key requirement:** Ability to mint achievements on Base network
- Web = single source of truth for all achievement calculations
- Forecaster becomes read-only client (consumes Web API)
- All achievements visible in Web (not just chat eligibility)
- Static after earning (don't change retroactively)
- Cadence target: 10 achievements/week/network (post-launch)

## Achievement Progress

- 70/140 done (as of 04/09)
- Remaining 70 by ~04/23 (Vasya)

## Personas (Weights)

Personas = set of achievements with weights.

- Users see only base rep, weights hidden
- Stepped weight system (LP1: 0.05, LP2: 0.02, LP3: 0.05, LP4: 0.05)
- First level gives main weight, next levels add less
- Lower threshold as gate for entering persona
- Visualization: quests with progress bars
- Legions (B2B) get personas with weights

## Components

### 1. Unlock Celebration Overlay
- Full-screen modal
- Achievement icon with glow
- Achievement name and description
- Rarity indicator
- Share to Twitter button
- "Next" / "Done" button

### 2. Achievements Grid
- All available achievements
- Earned vs locked states
- Progress indicators for in-progress
- Rarity tiers (visual differentiation)

### 3. Achievement Card
- Icon
- Name
- Description
- Status (earned/locked/in-progress)
- Progress bar (if applicable)
- Mint button (if earned, not minted)
- Share button (if earned)

### 4. Category Filters
- By ecosystem
- By status (earned/locked/all)
- By rarity

### 5. Mint Modal
- NFT preview
- Base network indicator
- Mint button
- Gas estimate
- Success/error states

## NFT Minting

- **Network:** Base only for V0
- Chat creation = NFT purchase ($5, separate contract)
- Achievement NFTs mintable on Base

## Design Notes

- Card grid layout
- Visual hierarchy: earned achievements prominent
- Glow/shine effects for new unlocks
- Progress bars for trackable achievements
- Celebration animations
