/**
 * Dynamic OG image route for story shares.
 *
 * Consumed by:
 *   - `/share/[type]/[handle]` via `openGraph.images` in generateMetadata
 *   - Directly by any client debug link
 *
 * Query params:
 *   - `type`     (required) story type, e.g. "smart-followers"
 *   - `handle`   (optional) user handle, default "tradoor"
 *   - `value`    (optional) overrides hero number
 *   - `heroLabel`(optional) overrides hero sub-label
 *   - `tagline`  (optional) overrides quote
 *   - `sub`      (optional, repeatable) "VALUE|LABEL" pairs; overrides
 *                sub-stats if >=1 provided.
 *   - `avatar`   (optional) absolute URL to the avatar image
 *   - `w`,`h`    (optional) render size — defaults 1200x630 (Twitter card);
 *                pass w=1080&h=1080 for square.
 *
 * Uses `next/og` (edge runtime) + Satori, so we stick to the supported
 * CSS subset: flexbox only, explicit `display: "flex"` on every parent
 * with multiple children, and `backgroundClip: "text"` + transparent
 * color for gradient text.
 */

import { ImageResponse } from "next/og"
import {
  STORY_SHARE_INFO,
  type StoryShareInfo,
  type StoryType,
  isStoryType,
} from "@/lib/story-share"

export const runtime = "edge"

// Palette (must match the app's visual language: minimal black + cyan accent).
const BG = "#010101"
const SILVER = "#ffffff"
const SILVER_DIM = "rgba(255, 255, 255, 0.68)"
const MINT = "#8CD5FE"
const MINT_SOFT = "rgba(140, 213, 254, 0.18)"
const LINE = "rgba(255, 255, 255, 0.08)"

function parseSubStats(params: URLSearchParams): StoryShareInfo["subStats"] | null {
  const raw = params.getAll("sub")
  if (raw.length === 0) return null
  return raw
    .map(p => {
      const [value, label] = p.split("|")
      if (!value || !label) return null
      return { value, label }
    })
    .filter((x): x is { value: string; label: string } => x !== null)
    .slice(0, 3)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const params = url.searchParams

  const rawType = params.get("type") ?? ""
  const fallback: StoryType = isStoryType(rawType) ? rawType : "smart-followers"
  const info = STORY_SHARE_INFO[fallback]

  const handle = params.get("handle") ?? "tradoor"
  const value = params.get("value") ?? info.value
  const heroLabel = params.get("heroLabel") ?? info.heroLabel
  const label = params.get("label") ?? info.label
  const tagline = params.get("tagline") ?? info.tagline
  const subStats = parseSubStats(params) ?? info.subStats
  const avatar = params.get("avatar") // absolute URL if provided

  const w = Number(params.get("w")) || 1200
  const h = Number(params.get("h")) || 630
  const isSquare = Math.abs(w - h) < 60

  // The hero number adapts a bit for square cards.
  const heroFontSize = isSquare ? 200 : 220

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: BG,
          position: "relative",
          padding: isSquare ? 64 : 72,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Subtle radial mint glow behind the hero number. Positioned
            absolutely; uses a radial gradient on a large blurred div. */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: w * 0.7,
            height: h * 0.7,
            backgroundImage:
              "radial-gradient(circle, rgba(0, 210, 190, 0.18) 0%, rgba(0, 140, 130, 0.08) 35%, rgba(10, 10, 10, 0) 70%)",
            display: "flex",
          }}
        />

        {/* Header row: avatar + handle (left), label (right) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt=""
                width={56}
                height={56}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  objectFit: "cover",
                  border: `1px solid ${LINE}`,
                }}
              />
            ) : (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  backgroundImage:
                    "linear-gradient(135deg, #2a2e3a 0%, #12141a 100%)",
                  border: `1px solid ${LINE}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: SILVER_DIM,
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {handle.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div
              style={{
                color: SILVER,
                fontSize: 28,
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              @{handle}
            </div>
          </div>

          <div
            style={{
              color: MINT,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              padding: "8px 14px",
              border: `1px solid ${MINT_SOFT}`,
              borderRadius: 999,
              display: "flex",
            }}
          >
            {label}
          </div>
        </div>

        {/* Center: hero stat + hero label */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: heroFontSize,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              // Silver gradient via backgroundClip: text.
              backgroundImage:
                "linear-gradient(180deg, #f7f9fc 0%, #d4d8e2 40%, #8b91a1 70%, #e8ebf2 100%)",
              backgroundClip: "text",
              color: "transparent",
              display: "flex",
            }}
          >
            {value}
          </div>
          <div
            style={{
              color: SILVER_DIM,
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginTop: 8,
            }}
          >
            {heroLabel}
          </div>
        </div>

        {/* Sub-stats row — compact pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            marginTop: 8,
            marginBottom: 32,
            zIndex: 1,
          }}
        >
          {subStats.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 999,
                border: `1px solid ${LINE}`,
                backgroundColor: "rgba(255, 255, 255, 0.02)",
              }}
            >
              <span style={{ color: SILVER, fontSize: 24, fontWeight: 600 }}>
                {s.value}
              </span>
              <span style={{ color: SILVER_DIM, fontSize: 18, fontWeight: 400 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div
          style={{
            color: SILVER,
            fontSize: 28,
            fontStyle: "italic",
            fontWeight: 500,
            textAlign: "center",
            borderLeft: `3px solid ${MINT}`,
            paddingLeft: 16,
            maxWidth: "88%",
            alignSelf: "center",
            display: "flex",
            zIndex: 1,
          }}
        >
          "{tagline}"
        </div>

        {/* Bottom watermark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 32,
            gap: 10,
            opacity: 0.5,
            zIndex: 1,
          }}
        >
          <div
            style={{
              color: SILVER_DIM,
              fontSize: 16,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            Verified by REP
          </div>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              backgroundColor: MINT,
              display: "flex",
            }}
          />
          <div
            style={{
              color: SILVER_DIM,
              fontSize: 16,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            r3p.xyz
          </div>
        </div>
      </div>
    ),
    {
      width: w,
      height: h,
    },
  )
}
