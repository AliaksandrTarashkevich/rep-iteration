"use client"

import { useState } from "react"
import { Info } from "lucide-react"

// ============================================================================
// CONNECTION GRAPH
// Small SVG visualization that renders each account as a node. Connected
// accounts are bright primary-colored nodes; unconnected are dashed grey
// and labeled with their REP bonus. Used on the profile in the "Connect
// more accounts" section as a quick visual summary.
// ============================================================================

export interface GraphNode {
  id: string
  label: string
  connected: boolean
  /** REP earned by connecting this source — shown on unconnected nodes */
  repBonus: number
}

const DEFAULT_NODES: GraphNode[] = [
  { id: "twitter",   label: "X",         connected: true,  repBonus: 35 },
  { id: "evm",       label: "EVM",       connected: true,  repBonus: 35 },
  { id: "solana",    label: "Solana",    connected: true,  repBonus: 35 },
  { id: "telegram",  label: "Telegram",  connected: true,  repBonus: 35 },
  { id: "farcaster", label: "Farcaster", connected: false, repBonus: 35 },
  { id: "github",    label: "GitHub",    connected: false, repBonus: 30 },
  { id: "email",     label: "Email",     connected: false, repBonus: 30 },
]

/**
 * Lays out nodes evenly around the perimeter of an ellipse so connections
 * naturally fan out. The first node goes to the top; the rest rotate
 * clockwise. Radius + cx/cy are tuned for the 280×180 viewBox below.
 */
function getNodePosition(index: number, total: number, cx: number, cy: number, rx: number, ry: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2
  return {
    x: cx + Math.cos(angle) * rx,
    y: cy + Math.sin(angle) * ry,
  }
}

export function ConnectionGraph({
  nodes = DEFAULT_NODES,
  qualityScore = 72,
}: {
  nodes?: GraphNode[]
  qualityScore?: number
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const width = 320
  const height = 200
  const cx = width / 2
  const cy = height / 2
  const rx = 110
  const ry = 65

  const connectedCount = nodes.filter((n) => n.connected).length
  const totalCount = nodes.length

  // Position each node around the ellipse
  const positioned = nodes.map((node, i) => ({
    ...node,
    ...getNodePosition(i, nodes.length, cx, cy, rx, ry),
  }))

  return (
    <div className="rounded-xl bg-background/40 border border-border p-4 mb-4">
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-48"
          aria-label="Your identity connection graph"
        >
          {/* Lines from each node to every other node. Connected↔connected
              lines are solid mint; any line touching an unconnected node is
              dashed grey to suggest "potential" connection. */}
          {positioned.map((a, i) =>
            positioned.slice(i + 1).map((b) => {
              const bothConnected = a.connected && b.connected
              return (
                <line
                  key={`${a.id}-${b.id}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={bothConnected ? "var(--primary)" : "var(--border)"}
                  strokeWidth={bothConnected ? 1 : 0.5}
                  strokeDasharray={bothConnected ? "0" : "3 3"}
                  strokeOpacity={bothConnected ? 0.35 : 0.25}
                />
              )
            })
          )}

          {/* Nodes */}
          {positioned.map((node) => (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: node.connected ? "default" : "pointer" }}
            >
              {/* Glow halo for connected */}
              {node.connected && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={12}
                  fill="var(--primary)"
                  opacity={0.15}
                />
              )}
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={6}
                fill={node.connected ? "var(--primary)" : "var(--muted)"}
                stroke={node.connected ? "var(--primary)" : "var(--muted-foreground)"}
                strokeWidth={node.connected ? 0 : 1}
                strokeDasharray={node.connected ? "0" : "2 2"}
              />
              {/* Label */}
              <text
                x={node.x}
                y={node.y + 20}
                textAnchor="middle"
                fontSize="9"
                fontWeight="500"
                fill={node.connected ? "var(--foreground)" : "var(--muted-foreground)"}
                className="pointer-events-none"
              >
                {node.label}
              </text>
              {/* REP bonus label for unconnected */}
              {!node.connected && (
                <text
                  x={node.x}
                  y={node.y - 12}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="600"
                  fill="var(--primary)"
                  className="pointer-events-none"
                >
                  +{node.repBonus}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Hovered node tooltip */}
        {hoveredId && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-card border border-border text-[10px] text-foreground pointer-events-none">
            {nodes.find((n) => n.id === hoveredId)?.connected
              ? "Connected"
              : `Connect for +${nodes.find((n) => n.id === hoveredId)?.repBonus} REP`}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Your graph:{" "}
          <span className="text-foreground font-medium">
            {connectedCount} of {totalCount} connections
          </span>
          <span className="mx-1.5 text-border">·</span>
          <span className="text-primary font-medium">quality {qualityScore}/100</span>
        </p>
        <div className="relative">
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="About quality score"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
          {showTooltip && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowTooltip(false)}
              />
              <div className="absolute right-0 mt-1.5 w-60 p-3 rounded-xl bg-card border border-border shadow-lg z-20">
                <p className="text-[11px] text-foreground leading-relaxed">
                  Quality is based on the reputation of people in your network.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
