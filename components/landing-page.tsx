"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { WalletConnectDialog } from "@/components/wallet-connect-dialog"
import { Kicker, Pill, Title, Num } from "@/components/ui/primitives"
import { saveConnectedWallet, type ConnectedWallet } from "@/lib/wallet"

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function WalletIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  )
}

export function LandingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [referralCode, setReferralCode] = useState("")
  const [isLoading, setIsLoading] = useState<"x" | "wallet" | null>(null)
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)

  useEffect(() => {
    const refFromParams = searchParams.get("ref")
    if (refFromParams) {
      const cleanCode = refFromParams.slice(0, 6).toUpperCase()
      if (/^[A-Z0-9]{1,6}$/.test(cleanCode)) {
        setReferralCode(cleanCode)
      }
    }
  }, [searchParams])

  const handleReferralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6)
    setReferralCode(value)
  }

  const handleJoinWithX = () => {
    setIsLoading("x")
    const params = new URLSearchParams({ source: "x" })
    if (referralCode.trim()) params.append("ref", referralCode.trim())
    router.push(`/processing?${params.toString()}`)
  }

  const handleConnectWallet = () => {
    setWalletDialogOpen(true)
  }

  const handleWalletConnected = (wallet: ConnectedWallet) => {
    saveConnectedWallet({
      address: wallet.address,
      chainId: wallet.chainId,
      providerName: wallet.providerName,
    })
    setIsLoading("wallet")
    const params = new URLSearchParams({ source: "wallet" })
    if (referralCode.trim()) params.append("ref", referralCode.trim())
    router.push(`/processing?${params.toString()}`)
  }

  return (
    <div className="relative min-h-screen overflow-hidden rep-ambient">
      {/* Ambient blooms */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-[720px] w-[720px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(140,213,254,0.12), transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(242,153,51,0.08), transparent 62%)",
        }}
      />

      <section className="relative z-10 mx-auto mt-16 max-w-[1200px] px-6 md:mt-28 md:px-12">
        <Kicker>Verified context · owned by you</Kicker>

        <Title className="mt-6 text-[56px] leading-[0.98] tracking-[-0.028em] md:text-[96px] lg:text-[112px] lg:leading-[0.96]">
          Your reputation, <em>verified onchain</em>.
        </Title>

        <p className="mt-6 max-w-[720px] text-[18px] leading-[1.4] text-ink-mute md:text-[22px]">
          Connect your X or wallet. We&apos;ll show you what the graph sees — a
          living signal of what you&apos;ve done, earned, and become.
        </p>

        <div
          id="auth-section"
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Pill variant="accent" onClick={handleJoinWithX} disabled={isLoading !== null}>
            {isLoading === "x" ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            ) : (
              <XIcon />
            )}
            Connect X
            <ArrowRight size={14} />
          </Pill>
          <Pill
            variant="ghost"
            onClick={handleConnectWallet}
            disabled={isLoading !== null}
          >
            {isLoading === "wallet" ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
            ) : (
              <WalletIcon />
            )}
            Connect Wallet
          </Pill>
        </div>

        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
          MetaMask · Rabby · WalletConnect · Coinbase
        </p>

        <div className="mt-8 max-w-[320px]">
          {referralCode ? (
            <div className="rounded-md border border-ok/30 bg-ok/10 p-4 text-center">
              <p className="text-sm font-medium text-ok">
                Invited by the community
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
                Code: {referralCode}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Input
                type="text"
                placeholder="Enter invite code"
                value={referralCode}
                onChange={handleReferralChange}
                maxLength={6}
                className="text-center font-mono uppercase tracking-widest"
              />
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
                Have an invite? Enter it above for priority access
              </p>
            </div>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 border-t border-line pt-10 sm:grid-cols-3 md:mt-24">
          {[
            ["3.5M", "users"],
            ["30M", "profiles indexed"],
            ["0", "raw data stored"],
          ].map(([n, l]) => (
            <div key={l}>
              <Num className="text-[40px] tracking-[-0.02em] text-ink md:text-[48px]">
                {n}
              </Num>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
                {l}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 pb-12 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
          EVM supported · Solana & TON coming soon
        </p>
      </section>

      <WalletConnectDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onConnected={handleWalletConnected}
      />
    </div>
  )
}
