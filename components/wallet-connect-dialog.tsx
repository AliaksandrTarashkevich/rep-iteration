"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  connectWallet,
  discoverProviders,
  WalletConnectionError,
  type ConnectedWallet,
  type EIP6963ProviderDetail,
} from "@/lib/wallet"
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react"

interface WalletConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnected: (wallet: ConnectedWallet) => void
}

// Download links surfaced when we detect zero injected wallets. These
// keep users moving — otherwise "Connect Wallet" is a dead-end on a fresh
// browser profile.
const INSTALL_OPTIONS = [
  {
    name: "MetaMask",
    url: "https://metamask.io/download/",
    rdns: "io.metamask",
  },
  {
    name: "Rabby",
    url: "https://rabby.io/",
    rdns: "io.rabby",
  },
  {
    name: "Coinbase Wallet",
    url: "https://www.coinbase.com/wallet/downloads",
    rdns: "com.coinbase.wallet",
  },
] as const

export function WalletConnectDialog({
  open,
  onOpenChange,
  onConnected,
}: WalletConnectDialogProps) {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([])
  const [discovering, setDiscovering] = useState(false)
  const [connectingRdns, setConnectingRdns] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Re-discover providers every time the dialog opens — users can install
  // a wallet, then click "Connect" again without a full page reload.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setError(null)
    setDiscovering(true)
    discoverProviders().then((found) => {
      if (cancelled) return
      setProviders(found)
      setDiscovering(false)
    })
    return () => {
      cancelled = true
    }
  }, [open])

  const handleConnect = async (detail: EIP6963ProviderDetail) => {
    setError(null)
    setConnectingRdns(detail.info.rdns || detail.info.uuid)
    try {
      const wallet = await connectWallet(detail)
      onConnected(wallet)
      onOpenChange(false)
    } catch (err) {
      if (err instanceof WalletConnectionError) {
        // User rejection is common; soften the copy.
        setError(
          err.code === "USER_REJECTED"
            ? "Connection cancelled. Approve the request in your wallet to continue."
            : err.message,
        )
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setConnectingRdns(null)
    }
  }

  const noProviders = !discovering && providers.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect wallet</DialogTitle>
          <DialogDescription>
            {noProviders
              ? "We couldn't find a wallet in this browser. Install one to continue."
              : "Pick the wallet you want to connect."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {discovering ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Detecting wallets…
          </div>
        ) : noProviders ? (
          <div className="flex flex-col gap-2 py-2">
            {INSTALL_OPTIONS.map((opt) => (
              <a
                key={opt.rdns}
                href={opt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-border bg-secondary px-4 py-3 transition hover:border-accent/40 hover:bg-secondary/70"
              >
                <span className="font-medium text-foreground">
                  Install {opt.name}
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
            <p className="mt-2 text-center text-xs text-muted-foreground">
              WalletConnect &amp; mobile support coming soon.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 py-2">
            {providers.map((detail) => {
              const isConnecting =
                connectingRdns === (detail.info.rdns || detail.info.uuid)
              return (
                <Button
                  key={detail.info.uuid}
                  variant="outline"
                  size="lg"
                  className="h-14 justify-start gap-3 px-4"
                  disabled={connectingRdns !== null}
                  onClick={() => handleConnect(detail)}
                >
                  {detail.info.icon ? (
                    // Wallet icons are data URIs per EIP-6963, safe to inline.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detail.info.icon}
                      alt=""
                      className="h-7 w-7 rounded-md"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-md bg-muted" />
                  )}
                  <span className="flex-1 text-left font-medium">
                    {detail.info.name}
                  </span>
                  {isConnecting && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </Button>
              )
            })}
            <p className="mt-2 text-center text-xs text-muted-foreground">
              By connecting, you agree to sign a message that verifies your
              address. No transaction, no gas.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
