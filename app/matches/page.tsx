"use client"

import { useState } from "react"
import { Award, MapPin, ShoppingBag, Users } from "lucide-react"
import { PageShell } from "@/components/ui/page-shell"
import {
  GlassTile,
  Pill,
  Num,
} from "@/components/ui/primitives"
import { AvatarIdenticon } from "@/components/ui/avatar-identicon"

type MatchKind = "people" | "places" | "experts" | "merchants"

interface Match {
  id: string
  kind: MatchKind
  name: string
  seed: string
  role: string
  rep: number
  meta: string
}

const KIND_ICON: Record<MatchKind, React.ComponentType<{ size?: number }>> = {
  people: Users,
  places: MapPin,
  experts: Award,
  merchants: ShoppingBag,
}

const FILTERS: { id: MatchKind; label: string }[] = [
  { id: "people", label: "People" },
  { id: "places", label: "Places" },
  { id: "experts", label: "Experts" },
  { id: "merchants", label: "Merchants" },
]

const matches: Match[] = [
  // People
  {
    id: "p1",
    kind: "people",
    name: "@shrey.eth",
    seed: "shrey",
    role: "Co-founder · infra",
    rep: 87,
    meta: "4 mutual trusted · ex-Tempo",
  },
  {
    id: "p2",
    kind: "people",
    name: "@noor_k",
    seed: "noor",
    role: "AI Researcher · London",
    rep: 73,
    meta: "Endorsed by @vitalik · 1,284 trusts",
  },
  {
    id: "p3",
    kind: "people",
    name: "@patio11",
    seed: "patio",
    role: "Writer · payments",
    rep: 91,
    meta: "12 mutual · top 0.4% taste overlap",
  },
  // Places
  {
    id: "pl1",
    kind: "places",
    name: "Kō Omakase",
    seed: "ko",
    role: "Restaurant · 12 blocks",
    rep: 94,
    meta: "8 friends · 4.7 REP-weighted",
  },
  {
    id: "pl2",
    kind: "places",
    name: "Frontier Tower",
    seed: "frontier",
    role: "Coworking · SoMa",
    rep: 82,
    meta: "6 mutuals working there now",
  },
  // Experts
  {
    id: "e1",
    kind: "experts",
    name: "Dr. Lee",
    seed: "drlee",
    role: "Expert · ZK circuits",
    rep: 81,
    meta: "3 endorse · cited by @vitalik",
  },
  {
    id: "e2",
    kind: "experts",
    name: "Maria S.",
    seed: "maria",
    role: "Expert · trust graphs",
    rep: 76,
    meta: "Top 1% AI domain · 412 attestations",
  },
  // Merchants
  {
    id: "m1",
    kind: "merchants",
    name: "Nord Atelier",
    seed: "nord",
    role: "Merchant · top 2%",
    rep: 84,
    meta: "12.4k verified orders · 0.4% disputes",
  },
  {
    id: "m2",
    kind: "merchants",
    name: "Boca do Vento",
    seed: "boca",
    role: "Merchant · Lisbon",
    rep: 79,
    meta: "Window table held · verified-diner",
  },
]

export default function MatchesPage() {
  const [filter, setFilter] = useState<MatchKind>("people")
  const visible = matches.filter((m) => m.kind === filter)
  const FilterIcon = KIND_ICON[filter]

  return (
    <PageShell
      kicker="Trust matchmaking"
      title={
        <>
          Your <em>matches</em>.
        </>
      }
      subtitle="Trust-based matching across people, places, experts, merchants. Cross-context REP as the routing layer — ranked by REP overlap, not ads."
    >
      {/* Filter pills */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Pill
            key={f.id}
            size="sm"
            variant={filter === f.id ? "accent" : "ghost"}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Pill>
        ))}
      </div>

      {/* Match cards — simple stacked tile pattern, M7 reference */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visible.map((m) => {
          const Icon = KIND_ICON[m.kind]
          return (
            <GlassTile key={m.id} variant="muted" interactive className="!p-5">
              <div className="flex items-start gap-4">
                {/* Avatar / icon — identicon for people, square icon for others */}
                {m.kind === "people" ? (
                  <AvatarIdenticon seed={m.seed} size={56} />
                ) : (
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[14px] border border-line bg-card-bg-2 text-ink-mute">
                    <Icon size={20} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate text-[18px] font-medium text-ink">
                      {m.name}
                    </h3>
                    <div className="flex items-baseline gap-1 flex-shrink-0">
                      <Num className="text-[24px] leading-none tracking-[-0.01em] text-accent">
                        {m.rep}
                      </Num>
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                        REP
                      </span>
                    </div>
                  </div>
                  <div className="mt-0.5 text-[14px] text-ink-mute">
                    {m.role}
                  </div>
                  <div className="mt-2 text-[12px] text-ink-faint">
                    {m.meta}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Pill size="sm" variant="ghost">
                      Intro
                    </Pill>
                    <Pill size="sm" variant="ghost">
                      Pass
                    </Pill>
                  </div>
                </div>
              </div>
            </GlassTile>
          )
        })}
      </div>

      {visible.length === 0 && (
        <GlassTile variant="muted" className="!p-12 text-center">
          <FilterIcon size={32} />
          <div className="mt-4 text-[18px] text-ink-mute">
            No {filter} matches yet — keep growing your REP.
          </div>
        </GlassTile>
      )}
    </PageShell>
  )
}
