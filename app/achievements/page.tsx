"use client"

import React, { useState, useEffect } from "react"
import { 
  Award, 
  Lock, 
  Check, 
  Share2, 
  X, 
  Star,
  Link2,
  Megaphone,
  Users,
  Compass,
  Layers,
  Heart,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ExternalLink,
  Copy,
  CheckCircle2,
  Zap,
} from "lucide-react"
import { useAuth, type Achievement } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageShell } from "@/components/ui/page-shell"

// Achievement icon mapping
function AchievementIcon({ icon, className }: { icon: string; className?: string }) {
  const iconProps = { className: className || "h-6 w-6" }
  switch (icon) {
    case "star": return <Star {...iconProps} />
    case "link": return <Link2 {...iconProps} />
    case "megaphone": return <Megaphone {...iconProps} />
    case "users": return <Users {...iconProps} />
    case "compass": return <Compass {...iconProps} />
    case "layers": return <Layers {...iconProps} />
    case "share": return <Share2 {...iconProps} />
    case "heart": return <Heart {...iconProps} />
    default: return <Award {...iconProps} />
  }
}

// Rarity styling
function getRarityStyle(rarity: Achievement["rarity"]) {
  switch (rarity) {
    case "legendary":
      return {
        bg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
        border: "border-amber-500/40",
        text: "text-amber-400",
        glow: "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
        badge: "bg-amber-500/20 text-amber-400",
      }
    case "epic":
      return {
        bg: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
        border: "border-purple-500/40",
        text: "text-purple-400",
        glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
        badge: "bg-purple-500/20 text-purple-400",
      }
    case "rare":
      return {
        bg: "bg-gradient-to-br from-primary/20 to-accent/20",
        border: "border-primary/40",
        text: "text-primary",
        glow: "shadow-[0_0_20px_rgba(59,107,138,0.3)]",
        badge: "bg-primary/20 text-primary",
      }
    default: // common
      return {
        bg: "bg-muted/50",
        border: "border-border",
        text: "text-muted-foreground",
        glow: "",
        badge: "bg-muted text-muted-foreground",
      }
  }
}

// Mock NFT Minting Modal
function MintingModal({ 
  achievement, 
  onClose,
  onMintComplete
}: { 
  achievement: Achievement
  onClose: () => void
  onMintComplete: (achievement: Achievement) => void
}) {
  const [step, setStep] = useState<"confirm" | "minting" | "success">("confirm")
  const [txHash, setTxHash] = useState("")
  const [copied, setCopied] = useState(false)
  const style = getRarityStyle(achievement.rarity)

  // Generate mock tx hash
  const generateTxHash = () => {
    const chars = "0123456789abcdef"
    let hash = "0x"
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)]
    }
    return hash
  }

  const handleMint = async () => {
    setStep("minting")
    
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const hash = generateTxHash()
    setTxHash(hash)
    setStep("success")
    onMintComplete(achievement)
  }

  const copyTxHash = () => {
    navigator.clipboard.writeText(txHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    const text = encodeURIComponent(
      `Just minted my "${achievement.name}" achievement as an NFT on Base! +${achievement.repReward} REP @R3P #REPNetwork #NFT`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
        <div className={`relative rounded-2xl bg-card border ${style.border} p-6`}>
          {/* Close button (only show on confirm step) */}
          {step === "confirm" && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Confirm Step */}
          {step === "confirm" && (
            <>
              <div className="flex justify-center mb-6">
                {achievement.imageUrl ? (
                  <div className={`h-24 w-24 rounded-full overflow-hidden border-4 ${style.border}`}>
                    <img 
                      src={achievement.imageUrl} 
                      alt={achievement.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`p-6 rounded-full ${style.bg} ${style.border} border-2`}>
                    <AchievementIcon icon={achievement.icon} className={`h-16 w-16 ${style.text}`} />
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-foreground text-center mb-2">
                Mint as NFT
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Mint &quot;{achievement.name}&quot; to your wallet on Base network
              </p>

              {/* NFT Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Network</span>
                  <span className="text-sm font-medium text-foreground">Base</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Gas Fee</span>
                  <span className="text-sm font-medium text-positive">Free (Sponsored)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">REP Reward</span>
                  <span className="text-sm font-medium text-primary">+{achievement.repReward} REP</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleMint}>
                  Mint NFT
                </Button>
              </div>
            </>
          )}

          {/* Minting Step */}
          {step === "minting" && (
            <div className="py-8">
              <div className="flex justify-center mb-6">
                <div className={`p-6 rounded-full ${style.bg} ${style.border} border-2 animate-pulse`}>
                  <Loader2 className={`h-16 w-16 ${style.text} animate-spin`} />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground text-center mb-2">
                Minting...
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                Please wait while we mint your achievement
              </p>

              {/* Progress steps */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-positive" />
                  <span className="text-sm text-foreground">Preparing metadata</span>
                </div>
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">Submitting to Base network</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                  <span className="text-sm text-muted-foreground">Confirming transaction</span>
                </div>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <>
              <div className="flex justify-center mb-6">
                <div className={`p-6 rounded-full bg-positive/20 border-2 border-positive/40 ${style.glow}`}>
                  <CheckCircle2 className="h-16 w-16 text-positive" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground text-center mb-2">
                Successfully Minted!
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Your achievement is now an NFT on Base
              </p>

              {/* Transaction details */}
              <div className="space-y-3 mb-6">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-foreground font-mono truncate flex-1">
                      {txHash}
                    </code>
                    <button onClick={copyTxHash} className="p-1.5 hover:bg-muted rounded">
                      {copied ? (
                        <Check className="h-4 w-4 text-positive" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm text-foreground"
                >
                  View on BaseScan
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button className="flex-1" onClick={onClose}>
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Celebration Overlay Component
function CelebrationOverlay({ 
  achievements, 
  onClose 
}: { 
  achievements: Achievement[]
  onClose: () => void 
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const current = achievements[currentIndex]
  const style = getRarityStyle(current.rarity)

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleShare = () => {
    const text = encodeURIComponent(
      `Just unlocked "${current.name}" on @R3P! +${current.repReward} REP #REPNetwork`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}
      {currentIndex < achievements.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {/* Achievement Card */}
      <div className="max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-500">
        <div className={`relative rounded-2xl ${style.bg} ${style.border} border-2 p-8 ${style.glow}`}>
          {/* Sparkles decoration */}
          <Sparkles className="absolute top-4 right-4 h-6 w-6 text-amber-400 animate-pulse" />
          
          {/* Icon / Image */}
          <div className="flex justify-center mb-6">
            {current.imageUrl ? (
              <div className={`h-24 w-24 rounded-full overflow-hidden border-4 ${style.border} ${style.glow}`}>
                <img 
                  src={current.imageUrl} 
                  alt={current.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className={`p-6 rounded-full ${style.bg} ${style.border} border-2 ${style.glow}`}>
                <AchievementIcon icon={current.icon} className={`h-16 w-16 ${style.text}`} />
              </div>
            )}
          </div>

          {/* Rarity Badge */}
          <div className="flex justify-center mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${style.badge}`}>
              {current.rarity}
            </span>
          </div>

          {/* Name & Description */}
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            {current.name}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {current.description}
          </p>

          {/* REP Reward */}
          <div className="text-center mb-6">
            <span className="text-3xl font-bold text-primary glow">
              +{current.repReward}
            </span>
            <span className="text-lg text-muted-foreground ml-2">REP</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleShare} variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share on X
            </Button>
            <Button onClick={handleNext} className="flex-1">
              {currentIndex < achievements.length - 1 ? "Next" : "Done"}
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-1 mt-4">
            {achievements.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === currentIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Achievement Card Component
// NOTE: Individual minting has been replaced by the top-level "Claim All"
// flow, so the card no longer receives an `onMint` callback.
function AchievementCard({ 
  achievement, 
  onClick,
  isMinted
}: { 
  achievement: Achievement
  onClick: () => void
  isMinted?: boolean
}) {
  const style = getRarityStyle(achievement.rarity)

  // Check if this achievement was minted in this session
  const showAsMinted = achievement.status === "minted" || isMinted

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const text = encodeURIComponent(
      `Check out my "${achievement.name}" achievement on @R3P! #REPNetwork`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank")
  }

  // Per-rarity glow + border color (inline style so it overrides the CSS class)
  const rarityGlowStyle: React.CSSProperties = (() => {
    if (achievement.status === "available") {
      if (achievement.rarity === "legendary")
        return { boxShadow: "0 0 30px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.2), inset 0 1px 0 rgba(255,255,255,0.08)", borderColor: "rgba(251,191,36,0.6)" }
      if (achievement.rarity === "epic")
        return { boxShadow: "0 0 30px rgba(168,85,247,0.5), 0 0 60px rgba(168,85,247,0.2), inset 0 1px 0 rgba(255,255,255,0.08)", borderColor: "rgba(168,85,247,0.6)" }
      if (achievement.rarity === "rare")
        return {
          boxShadow: "0 0 30px var(--accent-glow), 0 0 60px color-mix(in srgb, var(--primary) 20%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.08)",
          borderColor: "color-mix(in srgb, var(--primary) 60%, transparent)",
        }
      // common available — uses REP --positive
      return {
        boxShadow: "0 0 24px color-mix(in srgb, var(--positive) 40%, transparent), 0 0 48px color-mix(in srgb, var(--positive) 15%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.08)",
        borderColor: "color-mix(in srgb, var(--positive) 55%, transparent)",
      }
    }
    if (achievement.status === "minted" || achievement.status === "earned") {
      if (achievement.rarity === "legendary")
        return { boxShadow: "0 0 18px rgba(251,191,36,0.3)", borderColor: "rgba(251,191,36,0.4)" }
      if (achievement.rarity === "epic")
        return { boxShadow: "0 0 18px rgba(168,85,247,0.3)", borderColor: "rgba(168,85,247,0.4)" }
      if (achievement.rarity === "rare")
        return {
          boxShadow: "0 0 18px var(--accent-glow)",
          borderColor: "color-mix(in srgb, var(--primary) 40%, transparent)",
        }
    }
    return {}
  })()

  const networkMeta: Record<string, { label: string; color: string }> = {
    base:        { label: "Base",        color: "bg-[#0052FF]/20 text-[#6fa8ff] border-[#0052FF]/30" },
    ethereum:    { label: "Ethereum",    color: "bg-[#627EEA]/20 text-[#8fa7f5] border-[#627EEA]/30" },
    bnb:         { label: "BNB",         color: "bg-[#F0B90B]/20 text-[#F0B90B] border-[#F0B90B]/30" },
    polygon:     { label: "Polygon",     color: "bg-[#8247E5]/20 text-[#a47af5] border-[#8247E5]/30" },
    arbitrum:    { label: "Arbitrum",    color: "bg-[#28A0F0]/20 text-[#6dc5f8] border-[#28A0F0]/30" },
    polymarket:  { label: "Polymarket",  color: "bg-[#00D395]/20 text-[#00D395] border-[#00D395]/30" },
    solana:      { label: "Solana",      color: "bg-[#9945FF]/20 text-[#b97aff] border-[#9945FF]/30" },
  }

  const netInfo = achievement.network ? networkMeta[achievement.network] : null

  return (
    <div
      onClick={onClick}
      style={achievement.status === "locked" ? {} : rarityGlowStyle}
      className={`relative rounded-2xl p-4 transition-all cursor-pointer overflow-hidden flex flex-col h-full ${
        achievement.status === "locked"
          ? "bg-muted/20 border border-border/50"
          : achievement.status === "available"
          ? "achievement-card-available"
          : `solid-card border ${style.border}`
      }`}
    >
      {/* Status indicator */}
      {showAsMinted && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-positive/20 text-positive text-xs">
            <Check className="h-3 w-3" />
            Minted
          </div>
        </div>
      )}
      


      {/* Icon / Image with glass inner container */}
      <div className="flex justify-center mb-3">
        <div className="glass-inner p-3 rounded-xl">
          {achievement.imageUrl ? (
            <div className={`h-14 w-14 rounded-full overflow-hidden border shadow-[0_0_15px_var(--accent-glow)] ${style.border} ${achievement.status === "locked" ? "opacity-50 grayscale" : ""}`}>
              <img 
                src={achievement.imageUrl} 
                alt={achievement.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className={`p-3 rounded-full ${
              achievement.status === "locked" 
                ? "bg-muted/50 text-muted-foreground"
                : `bg-primary/10 ${style.text}`
            }`}>
              {achievement.status === "locked" ? (
                <Lock className="h-7 w-7" />
              ) : (
                <AchievementIcon icon={achievement.icon} className="h-7 w-7" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content area - grows to fill space */}
      <div className="flex-1">
        {/* Rarity + Network labels row */}
        <div className="flex justify-center items-center gap-1.5 mb-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${style.badge}`}>
            {achievement.rarity}
          </span>
          {netInfo && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${netInfo.color}`}>
              {netInfo.label}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold text-foreground text-center mb-1">
          {achievement.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2">
          {achievement.description}
        </p>

        {/* Progress (for locked with progress) */}
        {achievement.status === "locked" && achievement.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{achievement.progress}/{achievement.maxProgress}</span>
            </div>
            <Progress 
              value={(achievement.progress / (achievement.maxProgress || 1)) * 100} 
              className="h-1.5" 
            />
          </div>
        )}

        {/* REP Reward */}
        <div className="text-center">
          <span className={`text-sm font-bold ${
            achievement.status === "locked" ? "text-muted-foreground" : "text-primary glow"
          }`}>
            +{achievement.repReward} REP
          </span>
        </div>
      </div>

      {/* Action Buttons — individual Mint CTA was replaced by the top-level
          "Claim All" flow, so available achievements render without a button
          to keep the card scannable. Minted cards still expose a share link
          and locked cards keep the requirement hint. */}
      <div className="mt-3 pt-3 border-t border-border/30">
        {showAsMinted && (
          <Button size="sm" variant="outline" className="w-full" onClick={handleShare}>
            <Share2 className="h-3 w-3 mr-1" />
            Share on X
          </Button>
        )}
        {achievement.status === "available" && !isMinted && (
          <p className="text-[10px] text-center text-positive font-medium">
            Ready to claim
          </p>
        )}
        {achievement.status === "locked" && achievement.requirements && (
          <p className="text-[10px] text-center text-muted-foreground">
            {achievement.requirements}
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// CLAIM ALL MODAL
// Batch-mints every `available` achievement in one flow, regardless of which
// chain each NFT settles on. Users don't pick a chain manually — this modal
// abstracts that completely and just shows per-achievement progress.
// ============================================================================

const claimAllChainMeta: Record<string, { label: string; color: string }> = {
  base:       { label: "Base",       color: "bg-[#0052FF]/20 text-[#6fa8ff] border-[#0052FF]/30" },
  ethereum:   { label: "Ethereum",   color: "bg-[#627EEA]/20 text-[#8fa7f5] border-[#627EEA]/30" },
  bnb:        { label: "BNB",        color: "bg-[#F0B90B]/20 text-[#F0B90B] border-[#F0B90B]/30" },
  polygon:    { label: "Polygon",    color: "bg-[#8247E5]/20 text-[#a47af5] border-[#8247E5]/30" },
  arbitrum:   { label: "Arbitrum",   color: "bg-[#28A0F0]/20 text-[#6dc5f8] border-[#28A0F0]/30" },
  polymarket: { label: "Polymarket", color: "bg-[#00D395]/20 text-[#00D395] border-[#00D395]/30" },
  solana:     { label: "Solana",     color: "bg-[#9945FF]/20 text-[#b97aff] border-[#9945FF]/30" },
}

function ClaimAllModal({
  achievements,
  onClose,
  onComplete,
}: {
  achievements: Achievement[]
  onClose: () => void
  onComplete: (ids: string[]) => void
}) {
  const [step, setStep] = useState<"confirm" | "minting" | "success">("confirm")
  const [progressIndex, setProgressIndex] = useState(0)

  const totalRep = achievements.reduce((s, a) => s + a.repReward, 0)
  const chains = Array.from(
    new Set(achievements.map(a => a.network).filter(Boolean))
  ) as string[]

  const handleConfirm = async () => {
    setStep("minting")
    for (let i = 0; i < achievements.length; i++) {
      setProgressIndex(i)
      await new Promise(resolve => setTimeout(resolve, 700))
    }
    setProgressIndex(achievements.length)
    onComplete(achievements.map(a => a.id))
    setStep("success")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-300">
        <div className="relative rounded-2xl bg-card border border-primary/40 shadow-[0_0_40px_var(--accent-glow)] p-6">
          {/* ----- Confirm ----- */}
          {step === "confirm" && (
            <>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-primary/15 border border-primary/40 shadow-[0_0_30px_var(--accent-glow)]">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground text-center mb-1">
                Claim All Achievements
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-5">
                Mint {achievements.length} NFT{achievements.length === 1 ? "" : "s"}
                {chains.length > 0 && <> across {chains.length} chain{chains.length === 1 ? "" : "s"}</>}{" "}
                in one click
              </p>

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Achievements</span>
                  <span className="text-sm font-semibold text-foreground">{achievements.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Total REP reward</span>
                  <span className="text-sm font-semibold text-primary glow">
                    +{totalRep.toLocaleString()} REP
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Gas fee</span>
                  <span className="text-sm font-semibold text-positive">Free (Sponsored)</span>
                </div>
                {chains.length > 0 && (
                  <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50 gap-3">
                    <span className="text-sm text-muted-foreground flex-shrink-0">Chains</span>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {chains.map(c => {
                        const meta = claimAllChainMeta[c]
                        if (!meta) return null
                        return (
                          <span
                            key={c}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleConfirm}>
                  <Zap className="h-4 w-4 mr-1.5" />
                  Claim All
                </Button>
              </div>
            </>
          )}

          {/* ----- Minting ----- */}
          {step === "minting" && (
            <div className="py-6">
              <div className="flex justify-center mb-5">
                <div className="p-5 rounded-full bg-primary/15 border-2 border-primary/40 shadow-[0_0_30px_var(--accent-glow)]">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground text-center mb-1">
                Minting {Math.min(progressIndex + 1, achievements.length)} of {achievements.length}…
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-5 truncate">
                {achievements[progressIndex]?.name ?? ""}
              </p>

              <Progress
                value={((progressIndex + 1) / achievements.length) * 100}
                className="h-2 mb-5"
              />

              {/* Rolling per-achievement status */}
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {achievements.map((a, i) => {
                  const done = i < progressIndex
                  const current = i === progressIndex
                  return (
                    <div
                      key={a.id}
                      className={`flex items-center gap-2 text-sm transition-opacity ${
                        i > progressIndex ? "opacity-30" : ""
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-positive flex-shrink-0" />
                      ) : current ? (
                        <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted flex-shrink-0" />
                      )}
                      <span className="truncate text-foreground/80">{a.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ----- Success ----- */}
          {step === "success" && (
            <>
              <div className="flex justify-center mb-5">
                <div className="p-5 rounded-full bg-positive/20 border-2 border-positive/40 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <CheckCircle2 className="h-12 w-12 text-positive" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground text-center mb-1">
                All Claimed!
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-5">
                {achievements.length} NFT{achievements.length === 1 ? "" : "s"} minted · +{totalRep.toLocaleString()} REP earned
              </p>

              <Button className="w-full" onClick={onClose}>
                Done
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// SHARE ACHIEVEMENT MODAL
// Dark preview card with the achievement centered, user handle, and REP
// watermark. "Share to X" and "Download PNG" are mock — they just toast.
// ============================================================================

function ShareAchievementModal({
  achievement,
  userHandle,
  onClose,
}: {
  achievement: Achievement
  userHandle: string
  onClose: () => void
}) {
  const [toast, setToast] = useState<string | null>(null)
  const style = getRarityStyle(achievement.rarity)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="max-w-sm w-full animate-in fade-in zoom-in duration-300">
        <div className="relative rounded-2xl bg-card border border-border p-6">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-lg font-bold text-foreground mb-1 pr-6">Share achievement</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Your flex card is ready. Post it or save it.
          </p>

          {/* Preview card — the image users actually share */}
          <div className={`relative rounded-xl p-6 mb-4 overflow-hidden bg-gradient-to-br from-background via-card to-background border ${style.border}`}>
            {/* Decorative glow */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background:
                  achievement.rarity === "legendary"
                    ? "radial-gradient(circle at 50% 0%, rgba(251,191,36,0.25), transparent 60%)"
                    : achievement.rarity === "epic"
                    ? "radial-gradient(circle at 50% 0%, rgba(168,85,247,0.25), transparent 60%)"
                    : "radial-gradient(circle at 50% 0%, var(--accent-glow), transparent 60%)",
              }}
            />

            {/* Rarity label */}
            <div className="relative flex justify-center mb-4">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${style.badge}`}>
                {achievement.rarity}
              </span>
            </div>

            {/* Achievement image/icon centered */}
            <div className="relative flex justify-center mb-4">
              {achievement.imageUrl ? (
                <div className={`h-24 w-24 rounded-full overflow-hidden border-2 ${style.border} shadow-[0_0_30px_var(--accent-glow)]`}>
                  <img
                    src={achievement.imageUrl}
                    alt={achievement.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className={`p-5 rounded-full ${style.bg} border-2 ${style.border} shadow-[0_0_30px_var(--accent-glow)]`}>
                  <AchievementIcon icon={achievement.icon} className={`h-14 w-14 ${style.text}`} />
                </div>
              )}
            </div>

            {/* Name */}
            <h3 className="relative text-center text-xl font-bold text-foreground mb-1">
              {achievement.name}
            </h3>

            {/* User handle */}
            <p className="relative text-center text-sm text-muted-foreground mb-4">
              @{userHandle}
            </p>

            {/* REP reward */}
            <div className="relative text-center mb-5">
              <span className="text-2xl font-bold text-primary glow">
                +{achievement.repReward}
              </span>
              <span className="text-sm text-muted-foreground ml-1.5">REP</span>
            </div>

            {/* REP watermark */}
            <div className="relative flex items-center justify-center gap-1.5 pt-3 border-t border-border/50">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                rep.xyz
              </span>
              <span className="text-[10px] text-primary font-bold">+REP</span>
            </div>
          </div>

          {/* Actions — both mock, just toast */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => showToast("PNG downloaded")}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Download PNG
            </Button>
            <Button
              className="flex-1"
              onClick={() => showToast("Shared to X")}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 mr-1.5" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Share to X
            </Button>
          </div>

          {/* Toast */}
          {toast && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-positive/20 border border-positive/40 text-positive text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
              {toast}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Achievements Page
type NetworkFilter = "all" | "base" | "ethereum" | "bnb" | "polygon" | "arbitrum" | "polymarket"

export default function AchievementsPage() {
  const { user, achievements, hasTwitter, hasWallet, markAchievementsSeen } = useAuth()

  // Flip the red "unseen" nav dot to blue "seen-but-mintable" the moment
  // the user lands on this page. Runs once per session; the id set is
  // persisted in localStorage.
  useEffect(() => {
    markAchievementsSeen()
  }, [markAchievementsSeen])
  const [activeFilter, setActiveFilter] = useState<"all" | "og" | "community" | "normie">("all")
  const [networkFilter, setNetworkFilter] = useState<NetworkFilter>("all")
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationAchievements, setCelebrationAchievements] = useState<Achievement[]>([])
  const [mintedAchievements, setMintedAchievements] = useState<Set<string>>(new Set())
  const [showClaimAll, setShowClaimAll] = useState(false)
  // Achievement being shared via the viral preview modal (null when closed)
  const [shareTarget, setShareTarget] = useState<Achievement | null>(null)

  // Check for new achievements on mount
  useEffect(() => {
    const newAchievements = achievements.filter(a => a.isNew && a.status === "available")
    if (newAchievements.length > 0) {
      setCelebrationAchievements(newAchievements.slice(0, 3))
      setShowCelebration(true)
    }
  }, [achievements])

  // Filter achievements by category and network
  const filteredAchievements = achievements.filter(a => {
    const categoryMatch = activeFilter === "all" || a.category === activeFilter
    const networkMatch = networkFilter === "all" || a.network === networkFilter
    return categoryMatch && networkMatch
  })

  // Count stats
  const mintedCount = achievements.filter(a => a.status === "minted").length
  const availableCount = achievements.filter(a => a.status === "available").length
  const totalXp = achievements
    .filter(a => a.status === "minted")
    .reduce((sum, a) => sum + a.repReward, 0)

  // Mark a batch of achievement ids as minted (called from ClaimAllModal).
  const handleClaimAllComplete = (ids: string[]) => {
    setMintedAchievements(prev => {
      const next = new Set(prev)
      ids.forEach(id => next.add(id))
      return next
    })
  }

  // The list of achievements that are still mintable *right now* — used both
  // for the CTA label and as the modal's input.
  const claimableAchievements = achievements.filter(
    a => a.status === "available" && !mintedAchievements.has(a.id)
  )

  // Rarity breakdown
  const rarityBreakdown = {
    legendary: achievements.filter(a => a.status === "minted" && a.rarity === "legendary").length,
    epic: achievements.filter(a => a.status === "minted" && a.rarity === "epic").length,
    rare: achievements.filter(a => a.status === "minted" && a.rarity === "rare").length,
    common: achievements.filter(a => a.status === "minted" && a.rarity === "common").length,
  }

  if (!user) return null

  return (
    <>
      {/* Celebration Overlay */}
      {showCelebration && celebrationAchievements.length > 0 && (
        <CelebrationOverlay
          achievements={celebrationAchievements}
          onClose={() => setShowCelebration(false)}
        />
      )}

      {/* Batch claim modal — replaces per-card minting. */}
      {showClaimAll && claimableAchievements.length > 0 && (
        <ClaimAllModal
          achievements={claimableAchievements}
          onClose={() => setShowClaimAll(false)}
          onComplete={handleClaimAllComplete}
        />
      )}

      {/* Share modal — polished, viral-ready preview for a single achievement */}
      {shareTarget && (
        <ShareAchievementModal
          achievement={shareTarget}
          userHandle={user.handle}
          onClose={() => setShareTarget(null)}
        />
      )}

      <PageShell
        kicker="Real-life proof orbs"
        title={
          <>
            Earn your <em>achievements</em>.
          </>
        }
        subtitle="Verified across Apple, Spotify, GitHub, Amex, Strava, wallet — earned, not bought. Every orb is a piece of your portable identity."
      >
        <div className="space-y-6">

        {/* Top-level Claim All CTA — the single entry point for minting.
            Hidden when there's nothing to claim so the page doesn't shout
            at users who are already caught up. */}
        {claimableAchievements.length > 0 && (
          <div className="rounded-2xl bg-card border-2 border-primary/40 shadow-[0_0_30px_var(--accent-glow)] p-4 md:p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="flex-shrink-0 h-11 w-11 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center relative">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {claimableAchievements.length} achievement{claimableAchievements.length === 1 ? "" : "s"} ready
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mint across all chains in a single click · gas sponsored
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => setShowClaimAll(true)}
                className="w-full sm:w-auto flex-shrink-0"
              >
                <Zap className="h-4 w-4 mr-1.5" />
                Claim All ({claimableAchievements.length} available)
              </Button>
            </div>
          </div>
        )}

        {/* 1. Level & Progress */}
        <div className="solid-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-3xl font-bold text-foreground">LVL {user.level}</span>
              <p className="text-sm text-muted-foreground mt-1">
                {totalXp.toLocaleString()} XP earned
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next level</p>
              <p className="text-lg font-semibold text-foreground">
                {user.xp.toLocaleString()} / {user.xpToNextLevel.toLocaleString()}
              </p>
            </div>
          </div>
          <Progress value={(user.xp / user.xpToNextLevel) * 100} className="h-3 mb-4" />
          
          {/* Rarity breakdown */}
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="text-amber-400">Legendary: {rarityBreakdown.legendary}</span>
            <span className="text-purple-400">Epic: {rarityBreakdown.epic}</span>
            <span className="text-primary">Rare: {rarityBreakdown.rare}</span>
            <span className="text-muted-foreground">Common: {rarityBreakdown.common}</span>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="solid-card p-4 text-center">
            <p className="text-2xl font-bold text-positive">{mintedCount}</p>
            <p className="text-xs text-muted-foreground">Minted</p>
          </div>
          <div className="solid-card p-4 text-center relative">
            {availableCount > 0 && (
              // Dot sits in the top-right corner. Using text-primary (blue)
              // instead of text-accent for both the number and the dot so
              // the count stays legible on the card background — the green
              // accent washed out against the dark card surface.
              <span className="absolute top-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
            <p className="text-2xl font-bold text-primary">{availableCount}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
          <div className="solid-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{achievements.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>

        {/* 2. Filter Tabs */}
        <div className="space-y-3">
          {/* Category Filter */}
          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as typeof activeFilter)}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="all">
                All ({achievements.length})
              </TabsTrigger>
              <TabsTrigger value="og">
                OG ({achievements.filter(a => a.category === "og").length})
              </TabsTrigger>
              <TabsTrigger value="community">
                Community ({achievements.filter(a => a.category === "community").length})
              </TabsTrigger>
              <TabsTrigger value="normie">
                Normie ({achievements.filter(a => a.category === "normie").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Network Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setNetworkFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                networkFilter === "all" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              All Networks
            </button>
            <button
              onClick={() => setNetworkFilter("base")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                networkFilter === "base" 
                  ? "bg-[#0052FF] text-white" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              Base
            </button>
            <button
              onClick={() => setNetworkFilter("ethereum")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                networkFilter === "ethereum" 
                  ? "bg-[#627EEA] text-white" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              Ethereum
            </button>
            <button
              onClick={() => setNetworkFilter("bnb")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                networkFilter === "bnb" 
                  ? "bg-[#F0B90B] text-black" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              BNB
            </button>
            <button
              onClick={() => setNetworkFilter("polygon")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                networkFilter === "polygon" 
                  ? "bg-[#8247E5] text-white" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              Polygon
            </button>
            <button
              onClick={() => setNetworkFilter("arbitrum")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                networkFilter === "arbitrum" 
                  ? "bg-[#28A0F0] text-white" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              Arbitrum
            </button>
            <button
              onClick={() => setNetworkFilter("polymarket")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                networkFilter === "polymarket" 
                  ? "bg-[#00D395] text-black" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              Polymarket
            </button>
          </div>
        </div>

        {/* Connection warnings */}
        {!hasTwitter && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-sm text-foreground">
              Connect X to unlock Twitter-based achievements
            </p>
            <Button size="sm" variant="outline" className="mt-2">
              Connect X
            </Button>
          </div>
        )}
        {!hasWallet && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-sm text-foreground">
              Connect Wallet to unlock onchain achievements
            </p>
            <Button size="sm" variant="outline" className="mt-2">
              Connect Wallet
            </Button>
          </div>
        )}

        {/* 3. Achievement Grid */}
        {filteredAchievements.length === 0 ? (
          <div className="solid-card p-8 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">No achievements yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start your journey. Connect accounts and explore to earn achievements.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Sort: available first, then minted, then locked */}
            {[...filteredAchievements]
              .sort((a, b) => {
                const order = { available: 0, minted: 1, locked: 2 }
                return order[a.status] - order[b.status]
              })
              .map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => setSelectedAchievement(achievement)}
                  isMinted={mintedAchievements.has(achievement.id)}
                />
              ))}
          </div>
        )}

        {/* Achievement Detail Modal would go here */}
        {selectedAchievement && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedAchievement(null)}
          >
            <div 
              className="max-w-md w-full mx-4 solid-card p-6"
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const style = getRarityStyle(selectedAchievement.rarity)
                return (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-4 rounded-lg ${style.bg} ${style.text}`}>
                        <AchievementIcon icon={selectedAchievement.icon} className="h-12 w-12" />
                      </div>
                      <button onClick={() => setSelectedAchievement(null)}>
                        <X className="h-5 w-5 text-muted-foreground" />
                      </button>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${style.badge}`}>
                      {selectedAchievement.rarity}
                    </span>
                    <h2 className="text-xl font-bold text-foreground mt-3">
                      {selectedAchievement.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedAchievement.description}
                    </p>
                    <div className="my-4">
                      <span className="text-2xl font-bold text-primary glow">
                        +{selectedAchievement.repReward}
                      </span>
                      <span className="text-muted-foreground ml-2">REP</span>
                    </div>
                    {selectedAchievement.requirements && (
                      <p className="text-sm text-muted-foreground mb-4">
                        Requirement: {selectedAchievement.requirements}
                      </p>
                    )}
                    {/* Share button always available on detail view — opens the
                        polished preview modal (works for minted/available/locked). */}
                    <Button
                      className="w-full"
                      onClick={() => {
                        setShareTarget(selectedAchievement)
                        setSelectedAchievement(null)
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    {selectedAchievement.status === "minted" && null}
                    {selectedAchievement.status === "available" && !mintedAchievements.has(selectedAchievement.id) && (
                      // Individual mint has been replaced by the batch
                      // "Claim All" flow at the top of the page. Detail modal
                      // just advertises the ready state + chain info here.
                      <div className="w-full rounded-lg bg-positive/10 border border-positive/30 p-3 text-center">
                        <p className="text-sm font-semibold text-positive">Ready to claim</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use &ldquo;Claim All&rdquo; to mint this along with every other available achievement.
                        </p>
                      </div>
                    )}
                    {selectedAchievement.status === "locked" && (
                      <Button variant="outline" className="w-full" disabled>
                        <Lock className="h-4 w-4 mr-2" />
                        Locked
                      </Button>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        )}
        </div>
      </PageShell>
    </>
  )
}
