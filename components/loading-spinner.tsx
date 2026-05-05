"use client"

export function LoadingSpinner({ size = 80 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer ring - slowest */}
      <div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin"
        style={{ animationDuration: "3s" }}
      />
      {/* Middle ring - medium speed */}
      <div
        className="absolute rounded-full border-2 border-transparent border-t-accent animate-spin"
        style={{
          inset: size * 0.15,
          animationDuration: "2s",
          animationDirection: "reverse",
        }}
      />
      {/* Inner ring - fastest */}
      <div
        className="absolute rounded-full border-2 border-transparent border-t-accent animate-spin"
        style={{
          inset: size * 0.3,
          animationDuration: "1s",
        }}
      />
    </div>
  )
}
