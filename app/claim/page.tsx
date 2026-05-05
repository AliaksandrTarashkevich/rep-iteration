"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Share2, Lock, Wallet, Check, Twitter, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MOCK_SUMMARY_DATA, MOCK_FULL_CARD_DATA, type SummaryCardData } from "@/components/summary-card"
import { RepCardStory } from "@/components/rep-card-story"
import { useAuth } from "@/lib/auth-context"
import { getAvatarUrl } from "@/lib/avatars"

// ---------------------------------------------------------------------------
// Adapter: map the legacy SummaryCardData shape to the new RepCardStory
// contract so the claim screen can render the same card the user just
// saw as the final frame of the /stories flow.
// ---------------------------------------------------------------------------
function getCardTypeLabel(hasX: boolean, hasWallet: boolean) {
  if (hasX && hasWallet) return "Full REP Card"
  if (hasX) return "Social REP Card"
  return "Onchain REP Card"
}

function pickStats(data: SummaryCardData) {
  // First highlight is treated as the "Rank" anchor; the other two fill
  // the sub-stats grid. Falls back gracefully when fewer are available.
  const [primary, ...rest] = data.highlights
  const stats: Array<{ label: string; value: string | number }> = []
  if (primary) stats.push({ label: primary.label, value: primary.value })
  for (const h of rest.slice(0, 2)) {
    stats.push({ label: h.label, value: h.value })
  }
  return stats
}

// ============================================================================
// TYPES
// ============================================================================

type ClaimState = "idle" | "connecting" | "propagating" | "claimed"

// ============================================================================
// CLAIM ANIMATION COMPONENT
// ============================================================================

function ClaimAnimation({ state }: { state: ClaimState }) {
  if (state === "idle") return null

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center animate-in fade-in duration-300">
        {/* Animated circles */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {state === "claimed" ? (
            <div className="w-24 h-24 rounded-full bg-positive/20 flex items-center justify-center animate-in zoom-in duration-300">
              <Check className="w-12 h-12 text-positive" />
            </div>
          ) : (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-accent/50 animate-ping" style={{ animationDelay: "0.2s" }} />
              <div className="absolute inset-4 rounded-full border-2 border-accent/70 animate-ping" style={{ animationDelay: "0.4s" }} />
              <div className="absolute inset-0 rounded-full bg-accent/10 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-accent animate-pulse" />
              </div>
            </>
          )}
        </div>

        {/* Status text */}
        <div className="space-y-2">
          <p className={`text-lg font-medium transition-colors duration-300 ${
            state === "connecting" ? "text-foreground" : "text-foreground/50"
          }`}>
            {state === "connecting" && "Connecting to network..."}
            {state === "propagating" && "Propagating your REP..."}
            {state === "claimed" && ""}
          </p>
          
          {state === "propagating" && (
            <p className="text-foreground animate-in fade-in duration-300">
              Propagating your REP...
            </p>
          )}
          
          {state === "claimed" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-2xl font-bold text-positive mb-2">Claimed!</p>
              <p className="text-foreground/70">Your reputation is now sealed.</p>
            </div>
          )}
        </div>

        {/* Progress dots */}
        {state !== "claimed" && (
          <div className="flex justify-center gap-2 mt-6">
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              state === "connecting" ? "bg-accent" : "bg-foreground/20"
            }`} />
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              state === "propagating" ? "bg-accent" : "bg-foreground/20"
            }`} />
            <div className="w-2 h-2 rounded-full bg-foreground/20" />
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// CONNECT MODAL COMPONENT
// ============================================================================

function ConnectModal({ 
  type, 
  onConnect, 
  onCancel 
}: { 
  type: "wallet" | "x"
  onConnect: () => void
  onCancel: () => void 
}) {
  const isWallet = type === "wallet"

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="solid-card p-6 w-full max-w-sm animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
            {isWallet ? (
              <Wallet className="w-8 h-8 text-accent" />
            ) : (
              <Twitter className="w-8 h-8 text-accent" />
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-foreground mb-2">
            {isWallet ? "Connect Your Wallet" : "Connect X Account"}
          </h3>

          {/* Description */}
          <p className="text-foreground/70 text-sm mb-2">
            {isWallet 
              ? "Link your wallet to reveal onchain reputation and earn bonus REP."
              : "Link your X account to unlock social graph insights."
            }
          </p>
          
          {/* Bonus */}
          <p className="text-positive text-sm font-medium mb-6">
            {isWallet ? "+35 REP bonus" : "+50 REP bonus"}
          </p>

          {/* Wallet providers (if wallet) */}
          {isWallet && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {["MetaMask", "Rabby", "WalletConnect", "Coinbase"].map((provider) => (
                <button
                  key={provider}
                  onClick={onConnect}
                  className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground hover:bg-muted transition-colors"
                >
                  {provider}
                </button>
              ))}
            </div>
          )}

          {/* Connect button (if X) */}
          {!isWallet && (
            <Button 
              className="w-full bg-foreground text-background hover:bg-foreground/90 mb-3"
              onClick={onConnect}
            >
              Connect with X
            </Button>
          )}

          {/* Cancel */}
          <button 
            onClick={onCancel}
            className="text-sm text-muted-foreground hover:text-foreground hover:cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN CLAIM PAGE CONTENT
// ============================================================================

function ClaimContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { connections, login } = useAuth()
  
  const [mounted, setMounted] = useState(false)
  const [claimState, setClaimState] = useState<ClaimState>("idle")
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [connectType, setConnectType] = useState<"wallet" | "x">("wallet")
  const [cardData, setCardData] = useState<SummaryCardData>(MOCK_SUMMARY_DATA)
  
  // Determine connection status
  const source = searchParams.get("source") || "x"
  const hasWallet = connections.some(c => c.platform === "wallet") || source === "wallet"
  const hasX = connections.some(c => c.platform === "twitter") || source === "x"
  const hasBothConnected = hasWallet && hasX

  useEffect(() => {
    setMounted(true)
    // Update card data based on connections
    if (hasBothConnected) {
      setCardData({ ...MOCK_FULL_CARD_DATA, hasX: true, hasWallet: true })
    } else if (hasWallet) {
      setCardData({ ...MOCK_SUMMARY_DATA, hasX: false, hasWallet: true })
    } else {
      setCardData({ ...MOCK_SUMMARY_DATA, hasX: true, hasWallet: false })
    }
  }, [hasBothConnected, hasWallet])

  const handleShare = () => {
    const referralCode = "ABC123" // In real app, get from user data
    const text = encodeURIComponent(
      `${cardData.repScore} REP. #${cardData.overallRank} of ${cardData.totalUsers.toLocaleString()}. My reputation card on @R3P. Prove yours. Code: ${referralCode}`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank")
  }

  const handleClaim = async () => {
    setClaimState("connecting")
    
    // Simulate connection (1.2s per spec)
    await new Promise(resolve => setTimeout(resolve, 1200))
    setClaimState("propagating")
    
    // Simulate propagation (1.8s per spec)
    await new Promise(resolve => setTimeout(resolve, 1800))
    setClaimState("claimed")
    
    // Log user in - this updates auth state so profile shows as authenticated
    login()
    
    // Brief pause to show success state
    await new Promise(resolve => setTimeout(resolve, 800))
    router.push("/profile")
  }

  const handleConnectMissing = () => {
    if (!hasWallet) {
      setConnectType("wallet")
    } else if (!hasX) {
      setConnectType("x")
    }
    setShowConnectModal(true)
  }

  const handleConnectSuccess = () => {
    setShowConnectModal(false)
    // Update card to full card
    setCardData({ ...MOCK_FULL_CARD_DATA, hasX: true, hasWallet: true })
  }

  return (
    <>
      {/* Claim animation overlay */}
      <ClaimAnimation state={claimState} />

      {/* Connect modal */}
      {showConnectModal && (
        <ConnectModal 
          type={connectType}
          onConnect={handleConnectSuccess}
          onCancel={() => setShowConnectModal(false)}
        />
      )}

      <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8 overflow-hidden">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* LEFT - REP Card */}
          <div 
            className={`flex justify-center lg:justify-end transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
            style={{ transitionDelay: "0.3s" }}
          >
            <RepCardStory
              handle={cardData.handle}
              avatarUrl={cardData.avatarUrl ?? getAvatarUrl(cardData.handle)}
              repScore={cardData.repScore}
              overallRank={cardData.overallRank}
              totalUsers={cardData.totalUsers}
              aiOneLiner={cardData.aiOneLiner}
              cardType={getCardTypeLabel(cardData.hasX, cardData.hasWallet)}
              rankTier={cardData.rankTier ?? "yo"}
              stats={pickStats(cardData)}
              notableFollowers={cardData.notableFollowers}
              achievements={cardData.topAchievements}
              isIncomplete={!cardData.hasX || !cardData.hasWallet}
            />
          </div>
          
          {/* RIGHT - Actions */}
          <div 
            className={`flex flex-col items-center lg:items-start transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
            style={{ transitionDelay: "0.5s" }}
          >
            {/* Headline */}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-center lg:text-left text-balance">
              The trust layer. Yours.
            </h1>
            
            {/* Description */}
            <p className="text-foreground/70 text-lg mb-8 text-center lg:text-left max-w-md">
              Your reputation is now portable. Share it, lock it in, let the network know who you are.
            </p>
            
            {/* Action Buttons */}
            <div 
              className={`flex flex-col gap-4 w-full max-w-sm transition-all duration-500 ease-out ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0.8s" }}
            >
              {/* Share Button */}
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full justify-center gap-2 h-12 hover:box-glow transition-shadow"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Share your REP Card
              </Button>
              
              {/* Claim Button */}
              <Button 
                size="lg" 
                className="w-full justify-center gap-2 h-12 bg-foreground text-background hover:bg-foreground/90 hover:box-glow transition-all"
                onClick={handleClaim}
                disabled={claimState !== "idle"}
              >
                <Lock className="w-4 h-4" />
                Lock in your REP
              </Button>
              
              {/* Connect Missing Source */}
              {!hasBothConnected && (
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full justify-center gap-2 h-12 group"
                  onClick={handleConnectMissing}
                >
                  {!hasWallet ? (
                    <>
                      <Wallet className="w-4 h-4" />
                      Connect wallet for full card
                    </>
                  ) : (
                    <>
                      <Twitter className="w-4 h-4" />
                      Connect X for full card
                    </>
                  )}
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Button>
              )}
            </div>

            {/* Bonus hint */}
            {!hasBothConnected && (
              <p 
                className={`mt-4 text-sm text-positive text-center lg:text-left transition-all duration-500 ${
                  mounted ? "opacity-100" : "opacity-0"
                }`}
                style={{ transitionDelay: "1s" }}
              >
                +{!hasWallet ? "35" : "50"} REP bonus for full verification
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================================================
// FALLBACK & EXPORT
// ============================================================================

function ClaimFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
    </div>
  )
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<ClaimFallback />}>
      <ClaimContent />
    </Suspense>
  )
}
