"use client"

import { useState } from "react"
import { Check, Copy, Share2 } from "lucide-react"
import { PageShell } from "@/components/ui/page-shell"
import {
  Tile,
  Pill,
  Num,
  MonoCap,
} from "@/components/ui/primitives"

interface Tier {
  rank: string
  label: string
  count: number
  pct: number
  hint?: string
}

const TIERS: Tier[] = [
  { rank: "1st", label: "Direct", count: 244, pct: 95 },
  { rank: "2nd", label: "Friends of friends", count: 345, pct: 70 },
  { rank: "3rd", label: "3 hops", count: 21, pct: 12 },
  { rank: "4th", label: "Viral", count: 5678, pct: 100, hint: "compounding" },
]

const TOTAL_INVITES = 6288
const WEEKLY_DELTA = 124
const REP_EARNED = 412
const INVITE_CODE = "id0-G7XK"

export default function NetworkPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(INVITE_CODE).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <PageShell
      kicker="The compounding machine"
      title={
        <>
          Referral <em>network</em>.
        </>
      }
      subtitle="Every invite compounds your REP when they earn. The graph grows; every tier pays back up the chain."
    >
      {/* TOTAL + YOUR CUT 2-up grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Tile className="!p-6">
          <MonoCap size="sm">TOTAL</MonoCap>
          <div className="mt-3 flex items-baseline gap-2">
            <Num className="text-[56px] leading-none tracking-[-0.02em] text-ink md:text-[64px]">
              {TOTAL_INVITES.toLocaleString().replace(/,/g, " ")}
            </Num>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <Num className="text-[14px] text-ok">+{WEEKLY_DELTA}</Num>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              this week
            </span>
          </div>
        </Tile>

        <Tile className="!p-6">
          <MonoCap size="sm">YOUR CUT</MonoCap>
          <div className="mt-3 flex items-baseline gap-2">
            <Num className="text-[56px] leading-none tracking-[-0.02em] text-accent md:text-[64px]">
              +{REP_EARNED}
            </Num>
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            REP earned
          </div>
        </Tile>
      </div>

      {/* BY TIER */}
      <div className="mb-4">
        <MonoCap>BY TIER</MonoCap>
      </div>

      <Tile className="!p-6 mb-8">
        <div className="space-y-6">
          {TIERS.map((t) => (
            <div key={t.rank}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-[16px] font-medium text-ink">{t.rank}</span>
                  <span className="text-[14px] text-ink-mute">{t.label}</span>
                </div>
                <Num className="text-[16px] text-ink">
                  {t.count.toLocaleString()}
                </Num>
              </div>
              <div className="h-[2px] w-full overflow-hidden rounded bg-line">
                <div
                  className="h-full bg-accent transition-all"
                  style={{
                    width: `${t.pct}%`,
                    boxShadow: "0 0 8px rgba(140,213,254,0.4)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Tile>

      {/* YOUR CODE */}
      <Tile className="!p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <MonoCap size="sm">YOUR CODE</MonoCap>
            <div className="mt-2 font-mono text-[24px] font-medium tracking-[0.02em] text-ink md:text-[28px]">
              {INVITE_CODE}
            </div>
            <div className="mt-1 text-[13px] text-ink-mute">
              Share this code. Every tier pays back up the chain when they
              earn REP.
            </div>
          </div>

          <div className="flex flex-shrink-0 flex-col items-end gap-2 md:flex-row md:items-center">
            <Pill size="sm" variant="ghost" onClick={handleCopy}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </Pill>
            <Pill size="sm" variant="accent">
              <Share2 size={12} />
              Share
            </Pill>
          </div>
        </div>
      </Tile>

      <div className="mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-faint">
        The compounding machine. Every invite grows the graph; every earn tier
        pays back up the chain.
      </div>
    </PageShell>
  )
}
