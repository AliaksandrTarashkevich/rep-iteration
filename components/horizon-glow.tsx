/**
 * HorizonGlow — ambient half-circle glow rendered behind page content.
 *
 * Mirrors Figma `back_img` (REP-Prod node 21631-2233):
 *   width: 4368, height: 4368, border-radius: 784,
 *   fill #67E7E9 1%, drop-shadow #009FFF blur 214 spread 120,
 *   container opacity 30%.
 *
 * The literal 4368×4368 size puts the rounded corners far past the
 * viewport, so we scale the element to 1600×2400 — that lets the 784px
 * corner radius actually be visible at the viewport edges, producing
 * the visible arc (peak in middle, dipping at sides) seen in the
 * Figma reference. Position is fixed so the glow stays anchored as
 * the user scrolls; pointer-events disabled so it never intercepts
 * clicks; mix-blend-mode screen so it lights up the dark page.
 *
 * Place this once at the root of `<AppShell>` so it bleeds behind
 * every authenticated page (profile, leaderboard, chats, etc.).
 */
export function HorizonGlow() {
  return (
    // Wrapper anchors the glow to the MAIN content column (right of the
    // sidebar on desktop). On mobile the sidebar is hidden, so wrapper
    // spans full viewport. The inner circle is then centered inside the
    // wrapper — putting its peak over the actual content area, not the
    // sidebar.
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-0 right-0 md:left-[240px] -z-0 overflow-hidden"
    >
      <div
        className="absolute"
        style={{
          top: "40%",
          left: "50%",
          transform: "translateX(-50%)",
          // Width is relative to wrapper (main column) on desktop, full
          // viewport on mobile. 120% gives the gentle dome curvature.
          width: "120%",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          background: "rgba(103, 231, 233, 0.02)",
          boxShadow: "0 0 214px 120px rgba(0, 159, 255, 0.55)",
          opacity: 0.4,
          mixBlendMode: "screen",
        }}
      />
    </div>
  )
}
