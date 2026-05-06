# Rep — Code handoff

Two ready-to-paste pieces:

1. **`RepCard.jsx`** — the 3D-tilted "Identity Card" from variant 03 of the loader
2. **`StoryBg.jsx`** — the topographic background with drifting onchain glyphs (variant C2)

Both are self-contained React components. Drop them into your project and import.

---

## Prerequisites (one-time)

### A. Fonts
Load these (e.g. via `next/font` or a `<link>` in your root layout):

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:ital,wght@0,400;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
```

### B. CSS variables (globals.css)
You almost certainly already have these — your `globals.css` showed them. Make sure these tokens exist:

```css
:root {
  --ink: #ffffff;
  --ink-mute: rgba(255,255,255,0.68);
  --ink-faint: rgba(255,255,255,0.50);
  --line: rgba(255,255,255,0.08);
  --accent: #8CD5FE;
  --ff-ui: 'Space Grotesk', system-ui, sans-serif;
  --ff-mono: 'JetBrains Mono', ui-monospace, monospace;
  --ff-serif: 'Fraunces', Georgia, serif;
}

.num {
  font-family: var(--ff-mono);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}
```

---

## Files

- `RepCard.jsx` — Identity card. Props: `data` (the rows), `revealPct` (0–100; controls progressive line reveal), `wordmark` (ReactNode shown bottom-right; pass your own `<Wordmark />` or any component).
- `StoryBg.jsx` — Topographic background with drifting onchain glyphs. Use as a wrapper around any story content.

See each file for usage examples at the top.
