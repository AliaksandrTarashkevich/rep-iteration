# Stories Flow (/stories)

## Purpose
Short onboarding flow showing user's reputation data in Instagram-style stories format.

## Story Matrix

On entry, always one source (X or Wallet). Second connected mid-flow via prompt.

### X Path Stories (in order)
1. Smart Followers
2. Notable Followers
3. Inner Circle
4. Communities / Tribes
5. Percentile / Rank
6. Share Magnet
7. Connect Wallet prompt → Onchain Snapshot + Ecosystem (if connected)
8. Subscribe @R3P prompt
9. Summary Card

### Wallet Path Stories (in order)
1. Onchain Snapshot
2. Ecosystem
3. Connect X prompt → Smart + Notable + Inner Circle + Tribes + Rank + Share Magnet (if connected)
4. Subscribe @R3P prompt
5. Summary Card

## Story Slides Data

| # | Story | Path | Data Source | Sharable |
|---|-------|------|-------------|----------|
| 1 | Smart Followers | X | Moni / TweetScout | Yes |
| 2 | Notable Followers | X | Moni / TweetScout | Yes |
| 3 | Inner Circle | X | Moni (mutual) | Yes |
| 4 | Communities / Tribes | X | Moni / TweetScout | Yes |
| 5 | Percentile / Rank | X | REP backend | Yes |
| 6 | Share Magnet | X | Moni + onchain | Yes |
| 7 | Onchain Snapshot | Wallet | Zerion | Yes |
| 8 | Ecosystem | Wallet | Zerion | Yes |

## Loading Screen

**X path messages:**
- Connecting to X
- Checking subscribers
- Analyzing TwitterScore
- Fetching social graph
- Finding closest friends
- Calculating REP
- Finalizing profile

**Wallet path messages:**
- Connecting wallet
- Checking transactions
- Scanning NFT holdings
- Analyzing DeFi activity
- Fetching token balances
- Calculating REP

**Timing:**
- Min display: 5 sec
- Timeout: 20 sec

## Components

1. **Story Container**
   - Full-screen story view
   - Progress bar at top
   - Tap to advance / go back
   - Swipe gestures

2. **Story Slide**
   - Title
   - Main visual/data
   - Share button (for shareable slides)

3. **Connect Prompt**
   - Prompt to connect missing source
   - Skip option (shows blurred card)

4. **Loading Screen**
   - Animated progress messages
   - Graph background animation

## User Flow

```
Auth → Loading Screen (5-20s) → Story 1 → ... → Connect Prompt → ... → Summary Card → Claim Screen
```

## Design Notes

- Full-screen immersive experience
- Dark theme
- Smooth transitions between stories
- Share buttons on each shareable slide
