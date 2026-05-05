"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Copy, Check, Share2, User, X } from "lucide-react"
import { getAvatarUrl } from "@/lib/avatars"

// ============================================================================
// SOCIAL GRAPH — tier list card
// Matches the reference mock: large headline + two big stats (Total
// connections / Total REP), a "How it works?" link in the top-right corner,
// followed by 4 collapsible tier rows (I–IV). Each row shows the number of
// people added at that depth and the REP flowing up from them. Every tier
// exposes its top connectors when expanded — tier I defaults to open so
// the richest data is visible without interaction.
//
// The pyramid visualization has been moved into the "How it works?"
// lightbox, where it acts as the visual explainer for how reward tiers work.
// ============================================================================

interface TopConnector {
  handle: string
  avatarUrl?: string
  people: number
  rep: number
  ringColor?: string
}

interface Tier {
  roman: "I" | "II" | "III" | "IV"
  label: string
  people: number
  rep: number
  topConnectors?: TopConnector[]
}

// Default mock tiers — every level now has a top-connectors list so the
// expand chevron has something to reveal at every depth of the graph.
// Ring colors roughly track rank: gold = top tier, sky/emerald/purple =
// mid tiers, muted = base.
const defaultTiers: Tier[] = [
  {
    roman: "I",
    label: "Direct referrals",
    people: 98,
    rep: 644,
    topConnectors: [
      { handle: "adam.eth", avatarUrl: getAvatarUrl("adam.eth"), people: 21, rep: 345, ringColor: "ring-amber-400" },
      { handle: "seth.sol", avatarUrl: getAvatarUrl("seth.sol"), people: 15, rep: 120, ringColor: "ring-amber-400" },
      { handle: "builder",  avatarUrl: getAvatarUrl("builder"), people: 10, rep: 56,  ringColor: "ring-sky-400" },
    ],
  },
  {
    roman: "II",
    label: "2nd degree",
    people: 324,
    rep: 104,
    topConnectors: [
      { handle: "nouns.fren",  avatarUrl: getAvatarUrl("nouns.fren"), people: 64, rep: 41, ringColor: "ring-emerald-400" },
      { handle: "zora.art",    avatarUrl: getAvatarUrl("zora.art"), people: 52, rep: 33, ringColor: "ring-sky-400" },
      { handle: "dao.maxi",    avatarUrl: getAvatarUrl("dao.maxi"), people: 41, rep: 18, ringColor: "ring-purple-400" },
    ],
  },
  {
    roman: "III",
    label: "3rd degree",
    people: 151,
    rep: 78,
    topConnectors: [
      { handle: "farcaster.w", avatarUrl: getAvatarUrl("farcaster.w"), people: 38, rep: 26, ringColor: "ring-sky-400" },
      { handle: "alpha.seek",  avatarUrl: getAvatarUrl("alpha.seek"), people: 29, rep: 19, ringColor: "ring-emerald-400" },
      { handle: "cypher.0x",   avatarUrl: getAvatarUrl("cypher.0x"), people: 22, rep: 14, ringColor: "ring-muted-foreground" },
    ],
  },
  {
    roman: "IV",
    label: "4th degree",
    people: 61,
    rep: 45,
    topConnectors: [
      { handle: "lurker.eth",  avatarUrl: getAvatarUrl("lurker.eth"), people: 14, rep: 18, ringColor: "ring-muted-foreground" },
      { handle: "ghost.sol",   avatarUrl: getAvatarUrl("ghost.sol"), people: 11, rep: 13, ringColor: "ring-muted-foreground" },
      { handle: "anon.base",   avatarUrl: getAvatarUrl("anon.base"), people: 8,  rep: 8,  ringColor: "ring-muted-foreground" },
    ],
  },
]

// Small person icon used in both the tier row and top-connector sub-rows
function PersonIcon({ className = "" }: { className?: string }) {
  return <User className={`h-3.5 w-3.5 ${className}`} strokeWidth={2} />
}

// =============================================================================
// How-it-works lightbox — pyramid explainer
// =============================================================================
function HowItWorksModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="How the social graph works"
    >
      <div
        className="relative w-full max-w-md solid-card p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="section-title text-lg text-center mb-1">HOW IT WORKS</h2>
        <p className="text-xs text-muted-foreground text-center mb-5">
          REP flows up the network to you
        </p>

        {/* Pyramid visualization */}
        <div className="relative flex justify-center mb-5">
          <svg
            viewBox="0 0 320 210"
            className="w-full max-w-xs h-auto"
            aria-hidden="true"
          >
            {/* Connector lines */}
            <g stroke="var(--primary)" strokeOpacity="0.4" strokeWidth="1.2">
              {/* Top -> L1 */}
              <line x1="160" y1="32"  x2="80"  y2="90" />
              <line x1="160" y1="32"  x2="160" y2="90" />
              <line x1="160" y1="32"  x2="240" y2="90" />
              {/* L1 -> L2 */}
              <line x1="80"  y1="100" x2="45"  y2="145" strokeOpacity="0.2" />
              <line x1="80"  y1="100" x2="115" y2="145" strokeOpacity="0.2" />
              <line x1="160" y1="100" x2="145" y2="145" strokeOpacity="0.2" />
              <line x1="160" y1="100" x2="175" y2="145" strokeOpacity="0.2" />
              <line x1="240" y1="100" x2="205" y2="145" strokeOpacity="0.2" />
              <line x1="240" y1="100" x2="275" y2="145" strokeOpacity="0.2" />
              {/* L2 -> L3 */}
              <line x1="45"  y1="155" x2="30"  y2="190" strokeOpacity="0.1" />
              <line x1="115" y1="155" x2="100" y2="190" strokeOpacity="0.1" />
              <line x1="145" y1="155" x2="130" y2="190" strokeOpacity="0.1" />
              <line x1="175" y1="155" x2="190" y2="190" strokeOpacity="0.1" />
              <line x1="205" y1="155" x2="220" y2="190" strokeOpacity="0.1" />
              <line x1="275" y1="155" x2="290" y2="190" strokeOpacity="0.1" />
            </g>

            {/* Animated REP-flow particles going UP */}
            <g fill="var(--primary)">
              <circle r="2.2" opacity="0.9">
                <animateMotion dur="1.8s" repeatCount="indefinite" path="M 80 90 L 160 32" />
              </circle>
              <circle r="2.2" opacity="0.7">
                <animateMotion dur="2.2s" repeatCount="indefinite" path="M 240 90 L 160 32" />
              </circle>
              <circle r="2" opacity="0.5">
                <animateMotion dur="2.6s" repeatCount="indefinite" path="M 160 90 L 160 32" />
              </circle>
            </g>

            {/* Level 3 dots */}
            <g fill="var(--muted-foreground)" opacity="0.35">
              {[30, 100, 130, 190, 220, 290].map((x) => (
                <circle key={`l3-${x}`} cx={x} cy="195" r="3" />
              ))}
            </g>
            {/* Level 2 dots */}
            <g fill="var(--muted-foreground)" opacity="0.6">
              {[45, 115, 145, 175, 205, 275].map((x) => (
                <circle key={`l2-${x}`} cx={x} cy="150" r="4" />
              ))}
            </g>
            {/* Level 1 avatars (circles with stroke) */}
            <g>
              {[80, 160, 240].map((x) => (
                <circle
                  key={`l1-${x}`}
                  cx={x}
                  cy="95"
                  r="10"
                  fill="var(--card)"
                  stroke="var(--primary)"
                  strokeWidth="1.8"
                />
              ))}
            </g>
            {/* You (top) */}
            <circle cx="160" cy="28" r="13" fill="var(--primary)" />
            <text
              x="160" y="32" textAnchor="middle"
              fontSize="10" fontWeight="700" fill="var(--primary-foreground)"
            >
              YOU
            </text>
          </svg>
        </div>

        {/* Reward tiers */}
        <div className="space-y-2">
          {[
            { roman: "I",   label: "Direct referrals", pct: "10%" },
            { roman: "II",  label: "2nd degree",       pct: "3%" },
            { roman: "III", label: "3rd degree",       pct: "1%" },
            { roman: "IV",  label: "4th degree",       pct: "0.5%" },
          ].map((t) => (
            <div
              key={t.roman}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 border border-border"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-primary w-5">
                  {t.roman}
                </span>
                <span className="text-xs text-foreground">{t.label}</span>
              </div>
              <span className="text-xs font-semibold text-positive font-mono">
                {t.pct} of REP
              </span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-4 leading-relaxed">
          When someone in your network earns REP, a share streams up to you.
          The deeper the connection, the smaller the share — but it compounds
          as your network grows.
        </p>
      </div>
    </div>
  )
}

// =============================================================================
// Main card
// =============================================================================
export function YourNetworkCard({
  userHandle,
  referralLink,
  tiers = defaultTiers,
}: {
  userHandle?: string
  userAvatarUrl?: string
  referralLink?: string
  tiers?: Tier[]
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    I: true,
    II: false,
    III: false,
    IV: false,
  })
  const [copied, setCopied] = useState(false)
  const [howOpen, setHowOpen] = useState(false)

  const totalConnections = tiers.reduce((sum, t) => sum + t.people, 0)
  const totalRep = tiers.reduce((sum, t) => sum + t.rep, 0)

  const link =
    referralLink || (userHandle ? `rep.xyz/r/${userHandle}` : "rep.xyz/r/you")

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${link}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleShare = async () => {
    const url = `https://${link}`
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Join REP",
          text: "Build your reputation onchain",
          url,
        })
      } catch {
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  const toggle = (roman: string) =>
    setExpanded((prev) => ({ ...prev, [roman]: !prev[roman] }))

  return (
    <>
      <div className="solid-card p-5 md:p-6 relative card-glow-top">
        {/* "How it works?" link — top right corner */}
        <button
          onClick={() => setHowOpen(true)}
          className="absolute top-4 right-4 text-[11px] text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline leading-tight text-right"
        >
          How it
          <br />
          works?
        </button>

        {/* Title */}
        <h3 className="section-title text-base md:text-lg text-center mb-6">
          SOCIAL GRAPH
        </h3>

        {/* Big stats: Total connections (left) · Total REP (right) */}
        <div className="flex items-start justify-between mb-8 px-2">
          <div>
            <p className="text-xs text-muted-foreground leading-tight">
              Total
              <br />
              connections
            </p>
            <p className="text-3xl md:text-4xl font-bold font-mono text-foreground mt-1 glow-cyan">
              {totalConnections.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground leading-tight">
              Total REP:
            </p>
            <p className="text-3xl md:text-4xl font-bold font-mono text-foreground mt-1">
              {totalRep.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tier rows */}
        <div className="divide-y divide-border border-t border-border">
          {tiers.map((tier) => {
            const isOpen = !!expanded[tier.roman]
            return (
              <div key={tier.roman}>
                <button
                  onClick={() => toggle(tier.roman)}
                  className="w-full flex items-center gap-3 py-4 hover:bg-muted/20 transition-colors -mx-5 md:-mx-6 px-5 md:px-6 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`tier-${tier.roman}-content`}
                >
                  {/* Roman numeral */}
                  <span className="font-mono text-sm md:text-base font-semibold text-foreground w-8 flex-shrink-0">
                    {tier.roman}
                  </span>

                  {/* Spacer pushes stats to the right */}
                  <div className="flex-1" />

                  {/* People count */}
                  <div className="flex items-center gap-1.5 text-sm text-foreground font-mono w-20 justify-end">
                    <span className="text-muted-foreground">+</span>
                    <PersonIcon className="text-muted-foreground" />
                    <span>{tier.people.toLocaleString()}</span>
                  </div>

                  {/* REP */}
                  <div className="text-sm font-semibold text-foreground font-mono w-24 text-right">
                    +{tier.rep.toLocaleString()} REP
                  </div>

                  {/* Chevron */}
                  <span className="text-muted-foreground flex-shrink-0 ml-2">
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </span>
                </button>

                {/* Expanded content (top connectors for tier I) */}
                {isOpen && tier.topConnectors && tier.topConnectors.length > 0 && (
                  <div
                    id={`tier-${tier.roman}-content`}
                    className="pb-4 pl-8 pr-2 animate-in fade-in slide-in-from-top-1 duration-200"
                  >
                    <p className="text-xs text-muted-foreground mb-3 mt-1">
                      Top connectors:
                    </p>
                    <div className="space-y-3">
                      {tier.topConnectors.map((c, i) => (
                        <div key={c.handle} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground font-mono w-4">
                            {i + 1}.
                          </span>
                          <div
                            className={`h-8 w-8 rounded-full overflow-hidden ring-2 ring-offset-1 ring-offset-background flex-shrink-0 ${
                              c.ringColor || "ring-primary"
                            }`}
                          >
                            {c.avatarUrl ? (
                              <img
                                src={c.avatarUrl || "/placeholder.svg"}
                                alt={c.handle}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-muted flex items-center justify-center">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground flex-1 truncate">
                            @{c.handle}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono w-20 justify-end">
                            <span>+</span>
                            <PersonIcon className="h-3 w-3" />
                            <span>{c.people}</span>
                          </div>
                          <div className="text-xs font-semibold text-muted-foreground font-mono w-24 text-right">
                            +{c.rep} REP
                          </div>
                          <div className="w-6" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Referral link footer */}
        <div className="mt-6 pt-5 border-t border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Your referral link
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-muted/30 border border-border font-mono text-xs text-foreground truncate">
              {link}
            </div>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 h-9 w-9 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 hover:border-primary/40 flex items-center justify-center transition-colors"
              aria-label="Copy referral link"
            >
              {copied ? (
                <Check className="h-4 w-4 text-positive" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            <button
              onClick={handleShare}
              className="flex-shrink-0 h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:shadow-[0_0_15px_var(--accent-glow)] flex items-center gap-1.5 transition-shadow"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* How it works modal */}
      {howOpen && <HowItWorksModal onClose={() => setHowOpen(false)} />}
    </>
  )
}
