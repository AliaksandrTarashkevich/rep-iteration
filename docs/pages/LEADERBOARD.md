# Leaderboard Page (/leaderboard)

## Purpose
Show user rankings across different score types with retention mechanics.

## Structure

### 3 Tabs by Score Type

| Tab | Ranking by | Key Columns |
|-----|------------|-------------|
| Total | Total REP Score | Rank, Avatar, Total REP, On-chain sub, Social sub, Badges, Trend, Tier |
| On-chain | On-chain Score | Rank, Avatar, On-chain Score, Active chains, Tx count, DeFi activity, Trend |
| Social | Social Score | Rank, Avatar, Social Score, Followers, Connections, Engagement, Graph density, Trend |

### Time Filters
- 24h
- 7d
- 30d
- All time

Show velocity (growth rate), not just absolute values.

## "You" Row (Sticky)

Always visible user position showing:
- Current position
- Distance to milestone
- Progress bar
- Dynamics for period

## REP Score Formula (V1)

> **WARNING (04/09):** The formula below is OUTDATED. Achievement Bonus +20% is confirmed incorrect and must be removed. New formula TBD.

| Component | Weight |
|-----------|--------|
| On-chain Score | 40% |
| Social Score | 40% |
| ~~Achievement Bonus~~ | ~~20%~~ REMOVED |

## Retention Mechanics

1. **Proximity Nudges**
   - "23 points from Top 25. Connect LinkedIn to get there."

2. **Velocity Indicators**
   - "Climbing 3x faster than average"

3. **"What if" Simulator**
   - Shows estimated boost from connecting new platform

4. **Weekly Digest**
   - Notification about position change

## Components

### 1. Tab Navigation
- Total / On-chain / Social tabs
- Active state indicator

### 2. Time Filter
- 24h / 7d / 30d / All time buttons

### 3. Leaderboard Table
- Rank column
- User info (avatar, name, handle)
- Score columns (based on tab)
- Trend indicator (up/down/stable)
- Tier badge

### 4. Sticky "You" Row
- Always visible at bottom
- Current rank
- Score
- Progress to next milestone

### 5. Proximity Nudge
- Contextual suggestion
- CTA to improve rank

### 6. User Row (clickable)
- Opens mini-profile or navigates to user profile

## Leaderboard Target

- Current target: 221 weekly
- May be insufficient (top-10 Base apps at 2000+)
- Needs Deni discussion

## Design Notes

- Table layout with horizontal scroll on mobile
- Sticky header and user row
- Visual trend indicators (arrows, colors)
- Tier badges with distinct styling
- Smooth animations for rank changes
