"use client"

import { useState } from "react"
import { Check, Plus, Copy, X as XIcon, RefreshCw, Wallet } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// ============================================================================
// CONNECTED ACCOUNTS — two side-by-side cards
//   • Social connections:  X / Telegram / Farcaster (+ "Add more")
//   • Connected wallets:   EVM Wallet / Solana Wallet (+ "Add wallet" — each
//     new wallet pays REP, even when the user already has one connected of
//     the same kind, so multi-wallet users keep earning)
//
// Cards stack on mobile, sit side-by-side on md+. Each tile keeps the same
// click semantics: connected → expand details popover; unconnected → trigger
// onConnect flow.
// ============================================================================

export interface ConnectedAccount {
  id: string
  label: string
  type: "social" | "wallet"
  iconUrl?: string
  /** When true, render a lucide Wallet glyph instead of an image. */
  walletIcon?: boolean
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
    id: "evm",
    label: "EVM Wallet",
    type: "wallet",
    walletIcon: true,
    connected: true,
    address: "0x1a2b...9f0e",
    lastSynced: "1 min ago",
    repReward: 35,
  },
  {
    id: "solana",
    label: "Solana Wallet",
    type: "wallet",
    iconUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sol-tkXP2sWc2bqJuH8kLsR1oKVbyVtSRr.png",
    connected: true,
    address: "7xKX...9dFe",
    lastSynced: "3 min ago",
    repReward: 35,
  },
]

const ADD_WALLET_REP_REWARD = 30

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
  const [walletPickerOpen, setWalletPickerOpen] = useState(false)

  // Wallet picker just closes the modal — in a real app this hands off to
  // the wallet provider (WalletConnect, Phantom, etc.) right inside the
  // popup, not by redirecting away. For the prototype the close is enough
  // to demo the flow.
  const handleWalletPick = (_kind: "evm" | "solana") => {
    setWalletPickerOpen(false)
  }

  const socialAccounts = accounts.filter((a) => a.type === "social")
  const walletAccounts = accounts.filter((a) => a.type === "wallet")

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
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <AccountsCard
          title="Social connections"
          accounts={socialAccounts}
          addLabel="Add more"
          addRepReward={null}
          onTileClick={handleTileClick}
          onAddClick={() => onConnect?.("add-social")}
          expandedId={expanded}
        />
        <AccountsCard
          title="Connected wallets"
          accounts={walletAccounts}
          addLabel="Add wallet"
          addRepReward={ADD_WALLET_REP_REWARD}
          onTileClick={handleTileClick}
          onAddClick={() => setWalletPickerOpen(true)}
          expandedId={expanded}
        />
      </div>

      <Dialog open={walletPickerOpen} onOpenChange={setWalletPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a wallet</DialogTitle>
            <DialogDescription>
              Each new wallet you connect earns +{ADD_WALLET_REP_REWARD} REP.
              You can connect multiple wallets of the same kind.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-2">
            <button
              onClick={() => handleWalletPick("evm")}
              className="group flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 text-left hover:border-primary/40 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/60"
            >
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-positive/10 border border-positive/30 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">EVM Wallet</p>
                <p className="text-xs text-muted-foreground">
                  ETH, Base, Polygon, Arbitrum…
                </p>
                <p className="mt-1 text-[10px] font-semibold text-primary">
                  +{ADD_WALLET_REP_REWARD} REP
                </p>
              </div>
            </button>

            <button
              onClick={() => handleWalletPick("solana")}
              className="group flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 text-left hover:border-primary/40 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/60"
            >
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-positive/10 border border-positive/30 flex items-center justify-center overflow-hidden">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sol-tkXP2sWc2bqJuH8kLsR1oKVbyVtSRr.png"
                  alt=""
                  className="h-5 w-5"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Solana Wallet</p>
                <p className="text-xs text-muted-foreground">
                  Phantom, Backpack, Solflare…
                </p>
                <p className="mt-1 text-[10px] font-semibold text-primary">
                  +{ADD_WALLET_REP_REWARD} REP
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shared expanded-account drawer — sits below both cards so the layout
          doesn't reflow asymmetrically when an account is opened. */}
      {expandedAccount && expandedAccount.connected && (
        <div className="rep-surface-glass-blur rep-glass-stroke-bright p-3 relative animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => setExpanded(null)}
            className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close details"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-3 pr-6">
            <div className="h-9 w-9 rounded-full bg-positive/10 border border-positive/30 flex items-center justify-center flex-shrink-0">
              {expandedAccount.walletIcon ? (
                <Wallet className="h-4 w-4 text-foreground" />
              ) : expandedAccount.iconUrl ? (
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
                  <span className="truncate">
                    {formatAddress(expandedAccount.address)}
                  </span>
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

function AccountsCard({
  title,
  accounts,
  addLabel,
  addRepReward,
  onTileClick,
  onAddClick,
  expandedId,
}: {
  title: string
  accounts: ConnectedAccount[]
  addLabel: string
  /** REP earned per new connection added via the "+" tile, or null to hide. */
  addRepReward: number | null
  onTileClick: (acc: ConnectedAccount) => void
  onAddClick: () => void
  expandedId: string | null
}) {
  // Sum REP already earned from connected accounts — used to show a single
  // "+N REP earned" tag in the header so individual pills stay icon-only and
  // compact (matches Mitya's profile mock).
  const earnedRep = accounts
    .filter((a) => a.connected)
    .reduce((sum, a) => sum + a.repReward, 0)

  return (
    <div className="rep-surface-glass-blur rep-glass-stroke-bright px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{title}:</p>
        {earnedRep > 0 && (
          <span className="text-[11px] font-semibold text-primary whitespace-nowrap">
            +{earnedRep} REP earned
          </span>
        )}
      </div>

      <div
        className="flex items-center flex-wrap gap-2"
        role="list"
        aria-label={title}
      >
        {accounts.map((acc) => (
          <AccountTile
            key={acc.id}
            account={acc}
            isActive={expandedId === acc.id}
            onClick={() => onTileClick(acc)}
          />
        ))}

        <AddTile
          label={addLabel}
          repReward={addRepReward}
          onClick={onAddClick}
        />
      </div>
    </div>
  )
}

function AccountTile({
  account,
  isActive,
  onClick,
}: {
  account: ConnectedAccount
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-full"
      aria-label={
        account.connected
          ? `${account.label}: connected. Tap for details`
          : `Connect ${account.label} for +${account.repReward} REP`
      }
      aria-expanded={account.connected ? isActive : undefined}
    >
      <div className="relative">
        <div
          className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
            account.connected
              ? `bg-positive/10 border border-positive/30 ${
                  isActive
                    ? "ring-2 ring-primary/60 shadow-[0_0_15px_var(--accent-glow)]"
                    : ""
                }`
              : "bg-muted/20 border border-dashed border-primary/40 group-hover:border-primary/70 group-hover:bg-primary/5"
          }`}
        >
          {account.walletIcon ? (
            <Wallet
              className={`h-4 w-4 ${
                account.connected ? "text-foreground" : "text-muted-foreground opacity-60"
              }`}
            />
          ) : account.iconUrl ? (
            <img
              src={account.iconUrl}
              alt=""
              className={`h-4 w-4 ${
                account.connected ? "" : "opacity-50 grayscale"
              }`}
            />
          ) : (
            <span
              className={`text-[9px] font-bold uppercase ${
                account.connected ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {account.label.slice(0, 3)}
            </span>
          )}
        </div>

        {account.connected ? (
          <span
            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-positive flex items-center justify-center ring-2 ring-card"
            aria-hidden="true"
          >
            <Check className="h-2 w-2 text-background" strokeWidth={3} />
          </span>
        ) : (
          <span
            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary/90 flex items-center justify-center ring-2 ring-card group-hover:scale-110 transition-transform"
            aria-hidden="true"
          >
            <Plus className="h-2 w-2 text-primary-foreground" strokeWidth={3} />
          </span>
        )}
      </div>
    </button>
  )
}

function AddTile({
  label,
  repReward,
  onClick,
}: {
  label: string
  repReward: number | null
  onClick: () => void
}) {
  // repReward intentionally unused in compact mode — the parent card surfaces
  // the cumulative "+N REP earned" tag, so individual pills stay icon-only.
  void repReward
  return (
    <button
      onClick={onClick}
      className="group relative flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-full"
      aria-label={label}
    >
      <div className="h-9 w-9 rounded-full flex items-center justify-center bg-muted/20 border border-dashed border-primary/40 group-hover:border-primary/70 group-hover:bg-primary/5 transition-colors">
        <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </button>
  )
}
