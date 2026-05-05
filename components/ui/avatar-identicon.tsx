// Deterministic identicon-style avatar (conic gradient from seed).
// Distinct from the shadcn Avatar primitive — used when no real user image exists.
export function AvatarIdenticon({
  seed = "id0",
  size = 40,
  ring = false,
  ringColor = "var(--accent)",
}: {
  seed?: string
  size?: number
  ring?: boolean
  ringColor?: string
}) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff
  const hue1 = h % 360
  const hue2 = (hue1 + 60 + ((h >> 4) % 120)) % 360
  const initial =
    seed.replace(/[^a-z0-9]/gi, "").slice(0, 1).toUpperCase() || "?"
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(from ${
          h % 360
        }deg, hsl(${hue1} 55% 50%), hsl(${hue2} 60% 45%), hsl(${hue1} 55% 50%))`,
        color: "#fff",
        fontWeight: 600,
        fontSize: size * 0.42,
        boxShadow: ring
          ? `0 0 0 2px ${ringColor}, 0 0 0 4px var(--bg)`
          : "none",
        flexShrink: 0,
      }}
    >
      <span className="relative z-10 opacity-90">{initial}</span>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.25), transparent 60%)",
        }}
      />
    </div>
  )
}
