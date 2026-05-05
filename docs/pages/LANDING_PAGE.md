# Landing Page (/)

## Purpose
Entry point for new users. Shows product value proposition and auth options.

## Auth Methods (V1)

| Method | Status |
|--------|--------|
| X (Twitter) OAuth | Active |
| Base wallet (MetaMask, Rabby, WalletConnect, Coinbase) | Active |
| EVM (other chains) | Offered in profile |
| Solana | Offered in profile |
| Telegram | Offered in profile (for chat notifications) |

## Referral Handling

- Referral code in URL: `r3p.xyz/invite/abc123` (optional, for tracking only)
- Format: 6 characters, alphanumeric, case-insensitive
- **Text codes, NOT links** (Twitter deprioritizes links)
- 4-generation referral tree (Gen 1: 10%, Gen 2: 5%, Gen 3: 2%, Gen 4: 1%)
- Capped at 40% of organic gravity

## Identity Model

- Any auth method = one REP ID
- X handle and wallet address = linked identifiers
- Additional identities connected from profile (not onboarding)
- Returning users → straight to Profile
- Single auth: one login for Web + Forecaster (shared backend)

## Components

1. **Hero Section**
   - Product name/logo
   - Tagline
   - CTA buttons: Connect X / Connect Wallet

2. **Value Proposition**
   - Brief explanation of REP system
   - Visual preview of features

3. **Auth Modal**
   - X OAuth flow
   - Wallet connection (MetaMask, Rabby, WalletConnect, Coinbase)

## User Flow

```
Landing → Auth Method Selection → Loading Screen → Stories Flow
```

## Design Notes

- Dark theme default
- Cyberpunk aesthetic
- Animated graph background (existing component)
