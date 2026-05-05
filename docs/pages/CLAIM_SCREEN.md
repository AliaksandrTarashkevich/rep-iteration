# Claim Screen (/claim)

## Purpose
Intermediate screen after Summary Card where users can share, claim their REP, or upgrade by connecting missing sources.

## User Flow

```
Summary Card → Claim Screen
                ├── Share your REP Card → Twitter Intent
                ├── Lock in your REP → Connecting (1.2s) → Propagating (1.8s) → Claimed → Profile
                └── Connect missing source → Modal → (Success) Card updates / (Cancel) Back to Claim
```

## Actions

### 1. Share your REP Card
- Opens Twitter share intent
- Pre-populated text with REP stats
- Includes referral code (text, not link)

### 2. Lock in your REP
- Primary CTA button
- Animation sequence:
  1. "Connecting..." (1.2s)
  2. "Propagating..." (1.8s)
  3. "Claimed!"
- Redirects to Profile page

### 3. Connect Missing Source
- Shows if user has only X or only Wallet
- Opens modal to connect the other source
- On success: Summary Card updates to Full REP Card
- On cancel: Returns to Claim Screen

## Components

1. **Summary Card Display**
   - Shows the generated Summary Card
   - Non-interactive preview

2. **Action Buttons**
   - Share to Twitter (secondary)
   - Lock in REP (primary)
   - Connect X/Wallet (if incomplete)

3. **Connection Animation**
   - Step indicator
   - Progress animation
   - Success state

4. **Connect Modal**
   - X OAuth flow OR
   - Wallet connection flow

## Design Notes

- Clear visual hierarchy
- Primary action prominent
- Smooth transition animations
- Dark theme consistent with app
