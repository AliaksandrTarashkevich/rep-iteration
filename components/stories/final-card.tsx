"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Sparkles, Twitter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  USER,
  X_DATA,
  W_DATA,
  CLOSING_DATA,
  SHARE_TEXT,
} from "@/lib/mock-stories"

const ACCENT = "#8CD5FE"

const KEYFRAMES = `
  @keyframes finalCardFlicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
`

type RowKind = "text" | "avatars"

interface RowText {
  kind: "text"
  label: string
  value: string
  highlight?: boolean
}

interface RowAvatars {
  kind: "avatars"
  label: string
  avatars: Array<{ handle: string; avatarUrl?: string }>
}

type Row = RowText | RowAvatars

export const finalCardShareText = SHARE_TEXT.summary(USER.handle)

/**
 * Adaptive Final Card — handoff RepCard layout (rows of label/value pairs)
 * with our story values + a 3D-tilted holographic chrome. Each row reveals
 * progressively, then share buttons fade in below the (un-tilted) card.
 */
export function FinalCard({
  hasX,
  hasWallet,
  skippedX,
  skippedWallet,
  onClaim,
  onConnectX,
  onConnectWallet,
}: {
  hasX: boolean
  hasWallet: boolean
  skippedX?: boolean
  skippedWallet?: boolean
  onClaim: () => void
  onConnectX?: () => void
  onConnectWallet?: () => void
}) {
  const cardType = computeCardType(hasX, hasWallet)
  const rows = buildRows(hasX, hasWallet)
  const isIncomplete = !hasX || !hasWallet

  // Progressive reveal — animate revealPct from 0 to 100 over ~8s so each
  // row gets ~900ms of breathing room. Slower pacing lets the user actually
  // read each stat as it lights up.
  const [revealPct, setRevealPct] = useState(0)
  const [showShare, setShowShare] = useState(false)

  useEffect(() => {
    let raf: number
    const start = performance.now()
    const dur = 8000
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      // Linear progress so each row's threshold is reached at equal intervals.
      setRevealPct(p * 100)
      if (p < 1) raf = requestAnimationFrame(tick)
      else setTimeout(() => setShowShare(true), 350)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="relative w-full max-w-xl">
      <style>{KEYFRAMES}</style>

      {/* 3D-tilted card. The perspective parent gives the rotation depth;
          the inner card carries the actual surface + content. */}
      <div style={{ perspective: "1400px" }}>
        <div
          className="relative p-9"
          style={{
            borderRadius: 28,
            border: "1px solid rgba(140,213,254,0.42)",
            background:
              "linear-gradient(135deg, rgba(140,213,254,0.08), rgba(140,213,254,0.02)), linear-gradient(180deg, #0a0e15, #050810)",
            boxShadow:
              "0 0 90px rgba(140,213,254,0.2), 0 40px 100px rgba(0,0,0,0.7), inset 0 0 50px rgba(140,213,254,0.05)",
            transform: "rotateX(12deg) rotateY(-9deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Corner ticks */}
          {[
            { top: 8, left: 8 },
            { top: 8, right: 8 },
            { bottom: 8, left: 8 },
            { bottom: 8, right: 8 },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 14,
                height: 14,
                ...pos,
                borderTop:
                  pos.top !== undefined ? "1px solid rgba(140,213,254,0.5)" : "none",
                borderBottom:
                  pos.bottom !== undefined ? "1px solid rgba(140,213,254,0.5)" : "none",
                borderLeft:
                  pos.left !== undefined ? "1px solid rgba(140,213,254,0.5)" : "none",
                borderRight:
                  pos.right !== undefined ? "1px solid rgba(140,213,254,0.5)" : "none",
              }}
            />
          ))}

          {/* Title strip */}
          <div
            className="font-mono text-[12px] uppercase"
            style={{
              letterSpacing: "0.32em",
              color: ACCENT,
              animation: "finalCardFlicker 2s linear infinite",
            }}
          >
            REP / SIGNATURE CARD
          </div>
          <div
            className="mb-7 mt-3"
            style={{ height: 1, background: "rgba(140,213,254,0.25)" }}
          />

          {/* Rows */}
          <div className="flex flex-col gap-5">
            {rows.map((row, i) => {
              const threshold = ((i + 1) / rows.length) * 100
              const visible =
                revealPct >= threshold - (100 / rows.length) * 0.2
              return (
                <RowItem
                  key={`${row.label}-${i}`}
                  row={row}
                  visible={visible}
                />
              )
            })}
          </div>

          {/* Footer */}
          <div
            className="mt-7 flex items-center justify-between pt-5"
            style={{ borderTop: "1px solid rgba(140,213,254,0.18)" }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
              {cardType.toUpperCase()}
              {isIncomplete && " · PARTIAL"}
            </span>
            <span className="font-mono text-[11px] tracking-[0.22em] text-accent/70">
              REP.XYZ
            </span>
          </div>
        </div>
      </div>

      {/* Share controls — outside the tilt so they read flat */}
      <div
        className={`mt-5 flex flex-col gap-2 transition-opacity duration-500 ${
          showShare ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="border-accent/40 bg-background/30 hover:bg-accent/10"
            onClick={() => {
              const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(finalCardShareText)}`
              window.open(intent, "_blank", "noopener,noreferrer")
            }}
          >
            <Twitter className="mr-2 h-4 w-4 text-accent" />
            Share to X
          </Button>
          <Button
            variant="outline"
            className="border-accent/40 bg-background/30 hover:bg-accent/10"
            onClick={() => {
              /* mock save image */
            }}
          >
            <Download className="mr-2 h-4 w-4 text-positive" />
            Save Image
          </Button>
        </div>

        {skippedX && onConnectX && (
          <button
            onClick={onConnectX}
            className="w-full rounded-lg border border-dashed border-amber-500/50 bg-amber-500/10 p-3 text-center transition-colors hover:bg-amber-500/20"
          >
            <span className="text-sm font-medium text-amber-400">
              Connect X for full stories · +35 REP
            </span>
          </button>
        )}
        {skippedWallet && onConnectWallet && (
          <button
            onClick={onConnectWallet}
            className="w-full rounded-lg border border-dashed border-amber-500/50 bg-amber-500/10 p-3 text-center transition-colors hover:bg-amber-500/20"
          >
            <span className="text-sm font-medium text-amber-400">
              Connect Wallet for onchain stories · +35 REP
            </span>
          </button>
        )}

        <Button
          onClick={onClaim}
          className="h-12 w-full bg-accent text-base font-semibold text-background hover:bg-accent/90"
          style={{
            boxShadow:
              "0 0 24px rgba(140,213,254,0.45), 0 6px 24px rgba(0,0,0,0.5)",
          }}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Seal Your Reputation
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Row renderer
// ---------------------------------------------------------------------------

function RowItem({ row, visible }: { row: Row; visible: boolean }) {
  const baseStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(10px)",
    transition: "all 700ms cubic-bezier(0.2, 0.8, 0.2, 1)",
  } as const

  if (row.kind === "avatars") {
    return (
      <div
        className="flex items-center justify-between gap-3"
        style={baseStyle}
      >
        <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-ink-faint">
          {row.label}
        </span>
        <div className="flex items-center -space-x-2.5">
          {row.avatars.map((a) => (
            <div
              key={a.handle}
              className="relative h-10 w-10 overflow-hidden rounded-full"
              style={{
                boxShadow:
                  "0 0 0 2px #0a0e15, 0 0 0 3px rgba(140,213,254,0.5)",
              }}
              title={`@${a.handle}`}
            >
              {a.avatarUrl ? (
                <Image
                  src={a.avatarUrl}
                  alt={a.handle}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-accent/20 font-mono text-[10px] text-accent">
                  {a.handle.slice(0, 3).toUpperCase()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex items-baseline justify-between gap-3"
      style={baseStyle}
    >
      <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-ink-faint">
        {row.label}
      </span>
      <span
        className={`num ${row.highlight ? "text-2xl" : "text-xl"}`}
        style={{
          color: row.highlight ? ACCENT : "var(--ink)",
          textShadow: row.highlight
            ? "0 0 22px rgba(140,213,254,0.5), 0 0 8px rgba(140,213,254,0.3)"
            : "none",
        }}
      >
        {row.value}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Row builder + composition helpers
// ---------------------------------------------------------------------------

function computeCardType(hasX: boolean, hasWallet: boolean) {
  if (hasX && hasWallet) return "Full REP Card"
  if (hasX) return "Social REP Card"
  if (hasWallet) return "Onchain REP Card"
  return "REP Card"
}

// v2.2: renamed from computeIdentityBadge. Tier 5 ("Verified Human") replaced
// with "Triple Signal" (claim-free) and now uses inline triplet check (was
// CLOSING_DATA.antiSybil.count which was removed with C1).
function computeSignatureBadge(hasX: boolean, hasWallet: boolean) {
  if (hasX && X_DATA.tribes[0].percentage >= 40) {
    return `Top 5% ${X_DATA.tribes[0].name}-leaning`
  }
  if (hasWallet && W_DATA.pnl.total <= -25000) {
    return "Battle-scarred Degen"
  }
  if (hasWallet && W_DATA.walletAge.years >= 4) {
    return `${W_DATA.walletAge.years}-year veteran`
  }
  if (
    hasX &&
    hasWallet &&
    X_DATA.accountAge.yearsOnX >= 4 &&
    W_DATA.walletAge.years >= 3 &&
    X_DATA.smartFollowers.total >= 50
  ) {
    return "Triple Signal"
  }
  return "Early Adopter"
}

/**
 * Pick the strongest single signal across all stories. Priority is the
 * rarity / shareworthiness of the stat — Mindshare is rarer than Smart
 * Followers count, a multi-year X OG is rarer than a 1-year account, etc.
 */
function computeTopSignal(
  hasX: boolean,
  hasWallet: boolean,
): { label: string; value: string } | null {
  // 1. Mindshare leader (very rare, very specific)
  if (hasX && X_DATA.mindshare.percentile <= 5) {
    return {
      label: "TOP SIGNAL",
      value: `Top ${X_DATA.mindshare.percentile}% ${X_DATA.mindshare.category}`,
    }
  }
  // 2. Best Trade > $20k (specific dollar flex)
  if (hasWallet && W_DATA.bestTrade.pnl >= 20000) {
    return {
      label: "TOP SIGNAL",
      value: `+$${(W_DATA.bestTrade.pnl / 1000).toFixed(1)}k on $${W_DATA.bestTrade.ticker}`,
    }
  }
  // 3. X OG (≥7 years on X)
  if (hasX && X_DATA.accountAge.yearsOnX >= 7) {
    return {
      label: "TOP SIGNAL",
      value: `${X_DATA.accountAge.ogTier} · ${X_DATA.accountAge.yearsOnX}y`,
    }
  }
  // 4. Diamond hands ≥ 3 years
  if (hasWallet && W_DATA.diamondHands.days >= 365 * 3) {
    return {
      label: "TOP SIGNAL",
      value: `${W_DATA.diamondHands.tier} · ${W_DATA.diamondHands.token}`,
    }
  }
  // 5. Wallet OG (≥4 years onchain)
  if (hasWallet && W_DATA.walletAge.years >= 4) {
    return {
      label: "TOP SIGNAL",
      value: `${W_DATA.walletAge.ogTier}`,
    }
  }
  // 6. High momentum
  if (hasX && X_DATA.momentum.growth30d >= 100) {
    return {
      label: "TOP SIGNAL",
      value: `+${X_DATA.momentum.growth30d} influence / 30d`,
    }
  }
  return null
}

/**
 * Compose the row list adaptively based on what's connected. Mirrors the
 * handoff RepCard data shape: ordered rows of label/value text with one
 * avatars row inserted where it makes most sense.
 */
function buildRows(hasX: boolean, hasWallet: boolean): Row[] {
  const rows: Row[] = []

  rows.push({ kind: "text", label: "HANDLE", value: `@${USER.handle}` })

  rows.push({
    kind: "text",
    label: "REP",
    value: CLOSING_DATA.rank.repScore.toLocaleString(),
    highlight: true,
  })

  rows.push({
    kind: "text",
    label: "RANK",
    value: CLOSING_DATA.rank.percentile,
  })

  // The strongest signal from the stories — headline flex
  const top = computeTopSignal(hasX, hasWallet)
  if (top) {
    rows.push({ kind: "text", label: top.label, value: top.value, highlight: true })
  }

  if (hasX) {
    rows.push({
      kind: "text",
      label: "INFLUENCE",
      value: X_DATA.smartFollowers.total.toLocaleString(),
    })
  }

  if (hasWallet) {
    rows.push({
      kind: "text",
      label: "WALLET AGE",
      value: `${W_DATA.walletAge.years} yrs`,
    })

    const pnl = W_DATA.pnl.total
    rows.push({
      kind: "text",
      label: "PNL",
      value:
        pnl >= 0
          ? `+$${(pnl / 1000).toFixed(1)}k`
          : `-$${(Math.abs(pnl) / 1000).toFixed(1)}k`,
    })
  }

  if (hasX) {
    rows.push({
      kind: "avatars",
      label: "INNER CIRCLE",
      avatars: X_DATA.notableFollowers.slice(0, 3).map((f) => ({
        handle: f.handle,
        avatarUrl: f.avatarUrl,
      })),
    })
  } else if (hasWallet) {
    rows.push({
      kind: "avatars",
      label: "ANCHORS",
      avatars: W_DATA.ecosystem.protocols.slice(0, 3).map((p) => ({
        handle: p,
        avatarUrl: undefined,
      })),
    })
  }

  rows.push({
    kind: "text",
    label: "SIGNATURE",
    value: computeSignatureBadge(hasX, hasWallet),
  })

  return rows
}
