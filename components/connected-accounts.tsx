"use client"

import { useState } from "react"
import { Check, Plus, Copy, X as XIcon, RefreshCw, Wallet } from "lucide-react"

// ============================================================================
// CONNECTED ACCOUNTS — single compact card
// Merges the old "Social Connections" + "Connected Wallets" cards into one
// horizontal scrollable row of circular icons. Connected accounts are bright
// with a green checkmark. Unconnected ones are grey/dashed with a "+" overlay
// and a small REP bonus label beneath. Click a connected account to expand
// a small dropdown with details (handle, address, sync status). Click an
// unconnected one to trigger the connect flow.
// ============================================================================

export interface ConnectedAccount {
  id: string
  label: string
  type: "social" | "wallet"
  iconUrl?: string
  connected: boolean
  handle?: string
  address?: string
  lastSynced?: string
  repReward: number
}

const DEFAULT_ACCOUNTS: ConnectedAccount[] = [
  {
    id: "twitter",
    label: "X",
    type: "social",
    iconUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/x-0x0rmmIhEggm2lw2laeGIQq3KBPemP.png",
    connected: true,
    handle: "@nord_monkey",
    lastSynced: "2 min ago",
    repReward: 35,
  },
  {
    id: "telegram",
    label: "Telegram",
    type: "social",
    iconUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/telegram-xMcTralxayGafDsbpvjM01agVwtky4.png",
    connected: true,
    handle: "@nord_monkey",
    lastSynced: "5 min ago",
    repReward: 35,
  },
  {
    id: "farcaster",
    label: "Farcaster",
    type: "social",
    iconUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/farcaster-7UBjbSbM4uL1HNA2XNlP0iMDo38vPm.png",
    connected: false,
    repReward: 50,
  },
  {
    id: "eth",
    label: "Ethereum",
    type: "wallet",
    iconUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eth-1WFCZw0qoju6H0sBfcwXPLXZToDpIE.png",
    connected: true,
    address: "0x1a2b...9f0e",
    lastSynced: "1 min ago",
    repReward: 35,
  },
  {
    id: "base",
    label: "Base",
    type: "wallet",
    iconUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/base-NN1OcTMXsH4ZO02VfIEqnTH43vLkWY.png",
    connected: true,
    address: "0x1a2b...9f0e",
    lastSynced: "1 min ago",
    repReward: 35,
  },
  {
    id: "solana",
    label: "Solana",
    type: "wallet",
    iconUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sol-tkXP2sWc2bqJuH8kLsR1oKVbyVtSRr.png",
    connected: true,
    address: "7xKX...9dFe",
    lastSynced: "3 min ago",
    repReward: 35,
  },
  {
    id: "bnb",
    label: "BNB Chain",
    type: "wallet",
    connected: false,
    repReward: 50,
  },
]

function formatAddress(addr?: string) {
  if (!addr) return ""
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function ConnectedAccounts({
  accounts = DEFAULT_ACCOUNTS,
  onConnect,
}: {
  accounts?: ConnectedAccount[]
  onConnect?: (id: string) => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const connectedCount = accounts.filter((a) => a.connected).length
  const totalRepEarned = accounts
    .filter((a) => a.connected)
    .reduce((sum, a) => sum + a.repReward, 0)

  const expandedAccount = expanded
    ? accounts.find((a) => a.id === expanded)
    : null

  const handleTileClick = (acc: ConnectedAccount) => {
    if (acc.connected) {
      setExpanded((prev) => (prev === acc.id ? null : acc.id))
    } else {
      onConnect?.(acc.id)
    }
  }

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rep-surface-glass-blur rep-glass-stroke-bright p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Connected accounts</p>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">
            {connectedCount} of {accounts.length} connected
          </p>
        </div>
        <span className="text-xs font-medium text-positive whitespace-nowrap">
          +{totalRepEarned} REP earned
        </span>
      </div>

      {/* Flex-wrap row — fits all tiles without cutting off; wraps to a
          second row on narrow viewports. */}
      <div
        className="flex items-start flex-wrap gap-x-4 gap-y-5 pt-1"
        role="list"
        aria-label="Connected accounts"
      >
        {accounts.map((acc) => {
          const isActive = expanded === acc.id
          return (
            <button
              key={acc.id}
              onClick={() => handleTileClick(acc)}
              className="group relative flex-shrink-0 flex flex-col items-center gap-1 focus:outline-none"
              aria-label={
                acc.connected
                  ? `${acc.label}: connected. Tap for details`
                  : `Connect ${acc.label} for +${acc.repReward} REP`
              }
              aria-expanded={acc.connected ? isActive : undefined}
            >
              <div className="relative">
                {/* Tile */}
                <div
                  className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${
                    acc.connected
                      ? `bg-positive/10 border border-positive/30 ${
                          isActive
                            ? "ring-2 ring-primary/60 shadow-[0_0_15px_var(--accent-glow)]"
                            : ""
                        }`
                      : "bg-muted/20 border border-dashed border-primary/40 group-hover:border-primary/70 group-hover:bg-primary/5"
                  }`}
                >
                  {acc.iconUrl ? (
                    <img
                      src={acc.iconUrl}
                      alt=""
                      className={`h-5 w-5 ${
                        acc.connected ? "" : "opacity-50 grayscale"
                      }`}
                    />
                  ) : (
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        acc.connected ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {acc.label.slice(0, 3)}
                    </span>
                  )}
                </div>

                {/* Badge overlay: green check (connected) OR plus (unconnected) */}
                {acc.connected ? (
                  <span
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-positive flex items-center justify-center ring-2 ring-card"
                    aria-hidden="true"
                  >
                    <Check className="h-2.5 w-2.5 text-background" strokeWidth={3} />
                  </span>
                ) : (
                  <span
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary/90 flex items-center justify-center ring-2 ring-card group-hover:scale-110 transition-transform"
                    aria-hidden="true"
                  >
                    <Plus className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* Label under tile */}
              <span
                className={`text-[10px] font-medium truncate max-w-[56px] ${
                  acc.connected ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {acc.label}
              </span>

              {/* REP bonus beneath unconnected */}
              {!acc.connected && (
                <span className="text-[10px] font-semibold text-primary leading-none">
                  +{acc.repReward} REP
                </span>
              )}
            </button>
          )
        })}

        {/* "+ Add another wallet" tile — always present so users can link
            additional wallets (e.g., a second EVM address, a Ledger, a
            fresh chain) even after their primary wallets are connected. */}
        <button
          onClick={() => onConnect?.("add-wallet")}
          className="group relative flex-shrink-0 flex flex-col items-center gap-1 focus:outline-none"
          aria-label="Add another wallet"
        >
          <div className="relative">
            <div className="h-11 w-11 rounded-full flex items-center justify-center bg-muted/20 border border-dashed border-primary/40 group-hover:border-primary/70 group-hover:bg-primary/5 transition-colors">
              <Wallet className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary/90 flex items-center justify-center ring-2 ring-card group-hover:scale-110 transition-transform"
              aria-hidden="true"
            >
              <Plus className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
            </span>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[56px]">
            Add wallet
          </span>
        </button>
      </div>

      {/* Expanded dropdown for a connected account */}
      {expandedAccount && expandedAccount.connected && (
        <div className="mt-3 p-3 rounded-xl bg-background/60 border border-border relative animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => setExpanded(null)}
            className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close details"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-3 pr-6">
            <div className="h-9 w-9 rounded-full bg-positive/10 border border-positive/30 flex items-center justify-center flex-shrink-0">
              {expandedAccount.iconUrl ? (
                <img src={expandedAccount.iconUrl} alt="" className="h-4 w-4" />
              ) : (
                <span className="text-[9px] font-bold text-foreground">
                  {expandedAccount.label.slice(0, 3).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">
                {expandedAccount.label}
              </p>
              {expandedAccount.handle && (
                <p className="text-xs text-muted-foreground truncate">
                  {expandedAccount.handle}
                </p>
              )}
              {expandedAccount.address && (
                <button
                  onClick={() => handleCopy(expandedAccount.address || "")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
                >
                  <span className="truncate">{formatAddress(expandedAccount.address)}</span>
                  {copied ? (
                    <Check className="h-3 w-3 text-positive flex-shrink-0" />
                  ) : (
                    <Copy className="h-3 w-3 flex-shrink-0" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span>Synced {expandedAccount.lastSynced || "just now"}</span>
            </div>
            <span className="text-[10px] font-semibold text-positive">
              +{expandedAccount.repReward} REP
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
