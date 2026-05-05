"use client"

// Custom REP-style icons - unique, not standard shadcn/lucide

// Ecosystem icons (SVG)
export function PolymarketIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function HyperliquidIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2v6m0 8v6M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24M2 12h6m8 0h6M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

export function SolanaIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M4 17h14l2-2H4l0 2zM4 12h16l-2-2H4v2zM6 7l-2 2h16l-2-2H6z" fill="currentColor"/>
    </svg>
  )
}

export function EthereumIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 1.5l-7 10.5 7 4 7-4-7-10.5z" fillOpacity="0.6"/>
      <path d="M12 22.5l-7-10 7 4 7-4-7 10z" fill="currentColor"/>
      <path d="M12 13l-7-1.5 7 4 7-4-7 1.5z" fillOpacity="0.3"/>
    </svg>
  )
}

export function BaseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function BNBIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2l3 3-3 3-3-3 3-3zM5 9l3 3-3 3-3-3 3-3zM19 9l3 3-3 3-3-3 3-3zM12 16l3 3-3 3-3-3 3-3zM12 9l3 3-3 3-3-3 3-3z" fill="currentColor"/>
    </svg>
  )
}

// Map ecosystem to icon component
export function EcosystemIcon({ 
  ecosystem, 
  className = "h-4 w-4" 
}: { 
  ecosystem: string
  className?: string 
}) {
  switch (ecosystem.toLowerCase()) {
    case "polymarket":
      return <PolymarketIcon className={className} />
    case "hyperliquid":
      return <HyperliquidIcon className={className} />
    case "solana":
      return <SolanaIcon className={className} />
    case "ethereum":
      return <EthereumIcon className={className} />
    case "base":
      return <BaseIcon className={className} />
    case "bnb":
      return <BNBIcon className={className} />
    default:
      return <div className={className} />
  }
}

// Custom REP icons
export function RepLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor">
      <path d="M16 2L4 8v8c0 6.627 5.373 12 12 12s12-5.373 12-12V8L16 2z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2"/>
      <text x="16" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">+</text>
    </svg>
  )
}

export function ZapBolt({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
    </svg>
  )
}

export function TrendArrow({ className = "h-4 w-4", direction = "up" }: { className?: string; direction?: "up" | "down" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      {direction === "up" ? (
        <path d="M7 17l5-5 3 3 5-7" strokeLinecap="round" strokeLinejoin="round"/>
      ) : (
        <path d="M7 7l5 5 3-3 5 7" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  )
}

export function UsersGroup({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="9" cy="7" r="3" fill="currentColor"/>
      <circle cx="15" cy="7" r="3" fill="currentColor" fillOpacity="0.6"/>
      <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" fill="currentColor" fillOpacity="0.3"/>
      <path d="M13 21v-2a4 4 0 014-4h2a4 4 0 014 4v2" fill="currentColor" fillOpacity="0.15"/>
    </svg>
  )
}

export function ShieldCheck({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l8 4v6c0 5.5-3.5 10-8 11-4.5-1-8-5.5-8-11V6l8-4z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function Trophy({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M6 2h12v6a6 6 0 11-12 0V2z" fill="currentColor" fillOpacity="0.3"/>
      <path d="M4 4H2v4c0 1.1.9 2 2 2h2a6 6 0 01-2-6zM20 4h2v4c0 1.1-.9 2-2 2h-2a6 6 0 002-6z" fill="currentColor" fillOpacity="0.5"/>
      <rect x="10" y="14" width="4" height="4" fill="currentColor"/>
      <rect x="8" y="18" width="8" height="2" rx="1" fill="currentColor"/>
    </svg>
  )
}

export function ChatBubbles({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M4 4h12a2 2 0 012 2v6a2 2 0 01-2 2H8l-4 4V6a2 2 0 012-2z" fill="currentColor" fillOpacity="0.5"/>
      <path d="M8 10h12a2 2 0 012 2v6a2 2 0 01-2 2h-4l-4 4v-4H8a2 2 0 01-2-2v-6a2 2 0 012-2z" fill="currentColor"/>
    </svg>
  )
}

export function AwardStar({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
    </svg>
  )
}

export function Flame({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2c-4 4-6 7-6 11a6 6 0 0012 0c0-4-2-7-6-11z" fill="currentColor" fillOpacity="0.3"/>
      <path d="M12 8c-2 2-3 4-3 6a3 3 0 006 0c0-2-1-4-3-6z" fill="currentColor"/>
    </svg>
  )
}

export function Wallet({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 10v4" strokeLinecap="round"/>
      <circle cx="18" cy="12" r="2" fill="currentColor"/>
    </svg>
  )
}

export function Signal({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="3" y="14" width="4" height="8" rx="1" fill="currentColor" fillOpacity="0.3"/>
      <rect x="10" y="10" width="4" height="12" rx="1" fill="currentColor" fillOpacity="0.6"/>
      <rect x="17" y="6" width="4" height="16" rx="1" fill="currentColor"/>
    </svg>
  )
}

export function Sparkle({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="currentColor"/>
      <path d="M19 8l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="currentColor" fillOpacity="0.5"/>
    </svg>
  )
}

export function Lock({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" fillOpacity="0.2"/>
      <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round"/>
    </svg>
  )
}

export function Check({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function AlertCircle({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// Planet rank icon (blue)
export function PlanetIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.3"/>
      <ellipse cx="12" cy="12" rx="11" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(-20 12 12)"/>
      <circle cx="12" cy="12" r="6" fill="currentColor" fillOpacity="0.6"/>
      <circle cx="10" cy="10" r="2" fill="currentColor" fillOpacity="0.8"/>
    </svg>
  )
}

// Leaderboard icon (for position)
export function LeaderboardIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <rect x="3" y="12" width="5" height="10" rx="1" fill="currentColor" fillOpacity="0.4"/>
      <rect x="9.5" y="6" width="5" height="16" rx="1" fill="currentColor"/>
      <rect x="16" y="10" width="5" height="12" rx="1" fill="currentColor" fillOpacity="0.6"/>
    </svg>
  )
}

// Crown icon for top rank
export function CrownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M2 8l4 12h12l4-12-5 4-5-6-5 6-5-4z" fill="currentColor"/>
      <circle cx="2" cy="8" r="2" fill="currentColor"/>
      <circle cx="12" cy="4" r="2" fill="currentColor"/>
      <circle cx="22" cy="8" r="2" fill="currentColor"/>
    </svg>
  )
}

// Medal/Achievement icon
export function MedalIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="14" r="6" fill="currentColor"/>
      <path d="M8 2h2l2 6-2 6h-2l2-6-2-6z" fill="currentColor" fillOpacity="0.5"/>
      <path d="M14 2h2l-2 6 2 6h-2l-2-6 2-6z" fill="currentColor" fillOpacity="0.5"/>
      <circle cx="12" cy="14" r="3" fill="currentColor" fillOpacity="0.3"/>
    </svg>
  )
}

// Chevron down for accordions
export function ChevronDown({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// Chevron up for accordions
export function ChevronUp({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
