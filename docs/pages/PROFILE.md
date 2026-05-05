# Profile Page (/profile)

## Purpose
Main user dashboard showing reputation, achievements, and recommended actions.

## Components

### 1. Header
- Avatar (from X or wallet identicon)
- Username / @handle
- AI one-liner description (from Grok)
- REP Score (large, prominent)
- Overall Rank

### 2. Connected Accounts (separate block, not in header)
- X (Twitter) - connected/not connected
- Wallet - connected/not connected
- Telegram - for chat notifications
- Solana - optional
- EVM (other chains) - optional

**Note:** Connected accounts block moved out of profile header (mobile tap target issue).

### 3. Top Achievements
- Display top 3 achievements
- Share button for each (Twitter)
- Link to full achievements page

### 4. Leaderboard Position
- Current position in overall leaderboard
- Mini visualization
- Link to full leaderboard

### 5. What To Do Next (PRIMARY RETENTION HOOK - V0 CONFIRMED)
Universal recommendation engine showing:
- Connect missing account
- Earn specific achievement
- Create a chat
- Daily tasks (+1 rep per task)

**Critical:** Without this, users die within a week (confirmed 03/30 sync).

## Additional Connections (from profile)

Offered via gamification (rep and achievements as motivation):
- Telegram (for chat notifications)
- Solana
- EVM (other chains)
- Farcaster, Google, LinkedIn (future)

## User Flow

```
Profile
  ├── → Achievements page
  ├── → Leaderboard page
  ├── → Chats page
  ├── → Settings
  └── → Connect additional accounts
```

## Design Notes

- Clean, card-based layout
- Prominent REP Score display
- Clear CTAs for recommended actions
- Mobile-optimized (tap targets considered)
- Dark theme default
