# Chats Page (/chats)

## Purpose
Key new feature for V1. Users create and join chats based on achievements. Inspired by pumpfun model.

## Chat Structure (UPDATED 04/09)

Per ecosystem: 1 OG + 1 General + 3 behavior-type chats
- ~25 total chats across 5 ecosystems

Per chat required:
- Image
- Text description
- Eligibility criteria
- Landing page (auto-gen from admin panel)
- UTM tracking

**Note:** TON skipped from V0 (only TG connect)

## Chats Page Components

### 1. Chat List
- Existing chats with metrics
- Search functionality
- Filter: chats available to user
- Leaderboard of chats on main Chats page

### 2. Chat Card
- Chat image/avatar
- Name
- AI-generated description
- Member count
- Required achievements (icons)
- Join button (if eligible)
- Lock indicator (if not eligible)

### 3. Create Chat Button
- Visible based on eligibility

### 4. Chat Leaderboard
- Top chats by "Chat Power"
- **Chat Power formula TBD** - Alex owes spec to Kelos

## Chat Creation Flow

```
Chats Page → Create Button
              ├── High-rank user → Eligible (free)
              └── Non high-rank → Paywall ($5/chat)
                    ↓
              Select achievements
                    ↓
              Set name + avatar (LLM can generate avatar, moderate)
                    ↓
              Auto-generated description
                    ↓
              Chat Created → Mini-admin panel
```

### Who Can Create

| User Type | Cost |
|-----------|------|
| High-rank (O, droog) | Free |
| Others | $5 per chat |

### Creation Rules

- User sees list of achievements available to them
- Selects achievement set for chat
- User sets name and avatar (LLM can generate/moderate)
- Description auto-generated (achievements + lore)

## Post-Create Mini-Admin

- Add/remove achievements from set
- Regenerate meta-description when set changes

## Achievement Creation (by users)

- User creates name, description, avatar
- LLM generates in REP style and moderates
- Top-ranks vote for acceptance into achievement pool
- Reputation for creators based on achievement popularity

## Mechanics

- Auto-stickers = achievements
- Reputation for participation and activity in chats
- Reputation for creators (chat power)
- Top users highlighted
- Chat = Achievement = NFT (context changes, for chat quality + REP, chat is a graph)
- Chats for influencers (GTM via influencers)

## Beta Limitations

- Rate limit: 1 chat / 5 minutes per user
- Daily limit: TBD
- Kill-switch for manual creation disable
- Beta mode flag for quick limit changes

## Telegram Integration (Operational)

- Multi-accounts (eSIM pool) to reduce block risk
- Reserve admin on each chat creation
- Logging: who created, by which achievements, from which account, when, basis (rank/payment)

## Components

### 1. Chats Grid/List
- Filter controls
- Search bar
- Sort options

### 2. Chat Card
- Visual preview
- Key metrics
- Eligibility indicator
- CTA button

### 3. Create Chat Modal
- Achievement selector
- Name input
- Avatar upload/generate
- Preview
- Payment flow (if needed)

### 4. Chat Detail Page
- Full description
- Member list
- Achievement requirements
- Join/Admin actions
- Telegram link

### 5. Mini-Admin Panel
- Achievement management
- Description regeneration
- Chat settings

## Design Notes

- Card-based layout
- Clear eligibility indicators
- Smooth creation flow
- Telegram integration seamless
- Achievement icons prominent
