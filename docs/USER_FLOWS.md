# User Flows

## Top-Level Flow

```
Landing (r3p.xyz + optional invite code)
    ↓
Auth Method Selection
    ├── Connect X → X OAuth 2.0
    └── Connect Wallet → Base Wallet
    ↓
Loading Screen (X data / Wallet data)
    ↓
Stories Flow
    ↓
Summary Card
    ↓
Claim Screen
    ├── Share to Twitter
    ├── Lock in REP → Profile
    └── Connect missing source → Back to Auth
```

## Post-Onboarding Flow

```
Profile
    ├── Achievements
    ├── Leaderboard
    ├── Chats
    ├── Referrals
    └── + Connect Telegram / Solana / EVM
```

## Critical Path

### Chats
```
US6 (achievement pool) 
    → US5 (seed content) + US4 (chat creation) 
    → US9 (Telegram) 
    → US1 (catalog) + US2 (chat page)
```

### Web
```
US-WEB-1 (shell) 
    → US-WEB-2 (auth) 
    → US-WEB-3/4/5/6 (parallel) 
    → US-WEB-7 + US-SHARE-1
```

### Backend
```
US6 → US-ACH-1 (multi-wallet) → US-ACH-2 (repeatable tasks)
```

**Parallel:** US3 (auth), US7 (landings), US8 (invites), US10 (metrics)

## Returning Users

- If already authenticated → straight to Profile
- Single auth: one login for Web + Forecaster (shared backend)

## Open UX Gaps

- Return-from-chat flow: UX gap, still open
- Sharing card timing (onboarding vs post-chat): needs A/B test
