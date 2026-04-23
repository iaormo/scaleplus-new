# ScalePlus — Design System

**Version 1.0 · 2026-04-23**
Unified design language for ScalePlus corporate, product, and web surfaces.

This system fuses the existing **ScalePlus Blackout + Purple Liquid** aesthetic (dark, cinematic, motion-forward) with **Apple Liquid Glass** (translucent material, specular edges, contextual depth). The result is a system that feels both cinematic and tactile: deep blacks as the stage, purple as the signature, glass as the connective tissue.

---

## 1. Design Principles

1. **Blackout first.** The canvas is near-black. Content glows, never shouts.
2. **Purple is a light source, not a fill.** Use it as an accent, a glow, a gradient — rarely as a flat surface.
3. **Every surface is a lens.** Cards, panels, and navigation refract what is behind them. No flat opaque panels unless the content demands it (forms, tables).
4. **Motion conveys depth.** Springy, damped, reactive to the cursor and scroll — never decorative for its own sake.
5. **Type sets the hierarchy; gradients and glow accent it.** Heavy weights, tight tracking, generous breathing room.
6. **Concentric geometry.** Nested radii step down (20 → 12 → 8). Spacing follows a 4px rhythm.
7. **Reduce motion and material when the user or device asks.** Every effect has a graceful fallback.

---

## 2. Brand Foundation

### 2.1 Logo
- File: `logo.png` (dark-mode primary). SVG favicon at `favicon.svg`.
- Minimum clear space: 1× the mark on all sides.
- Minimum display size: 24px height (web), 12mm (print).
- Never recolor. Do not place on surfaces lighter than `#1a1a1a` without the pill-lock container.

### 2.2 Voice & Tone
- Confident, specific, operator-grade. No hype clichés.
- Sentence case for UI, Title Case for marketing headlines.
- Numbers over adjectives ("40% faster onboarding" > "much faster onboarding").

---

## 3. Color System

### 3.1 Core Tokens (CSS custom properties)

```css
:root {
  /* Surfaces */
  --bg-primary:        #050505;   /* canvas */
  --bg-secondary:      #0a0a0a;   /* section break */
  --bg-card:           #0d0d0d;   /* default card */
  --bg-card-hover:     #111111;   /* card hover */
  --bg-elevated:       #161616;   /* modal, popover */

  /* Borders */
  --border-subtle:     rgba(255, 255, 255, 0.06);
  --border-strong:     rgba(255, 255, 255, 0.12);
  --border-hover:      rgba(168, 85, 247, 0.4);

  /* Text */
  --text-primary:      #f5f5f5;
  --text-secondary:    #888888;
  --text-muted:        #555555;
  --text-inverse:      #050505;

  /* Brand — Purple */
  --purple:            #a855f7;
  --purple-light:      #c084fc;
  --purple-dark:       #7c3aed;
  --purple-pink:       #e879f9;   /* gradient accent only */
  --purple-glow:       rgba(168, 85, 247, 0.15);
  --purple-glow-strong:rgba(168, 85, 247, 0.35);

  /* Semantic */
  --success:           #22c55e;
  --warning:           #f59e0b;
  --danger:            #ef4444;
  --info:              #3b82f6;
}
```

### 3.2 Niche Accent Palette
Used for vertical-specific views (industry switchers, case studies). One accent per niche — never mix in the same view.

| Niche          | Hex       | Token              |
|----------------|-----------|--------------------|
| Beauty         | `#db7093` | `--accent-beauty`  |
| Wellness       | `#22c55e` | `--accent-wellness`|
| Construction   | `#f59e0b` | `--accent-constr`  |
| E-commerce     | `#a855f7` | `--accent-ecom`    |
| Real Estate    | `#3b82f6` | `--accent-realestate` |
| Manufacturing  | `#ef4444` | `--accent-mfg`     |

### 3.3 Gradients

```css
--grad-brand:  linear-gradient(90deg, #c084fc, #a855f7, #e879f9, #7c3aed, #c084fc);
--grad-text:   linear-gradient(135deg, var(--text-primary) 30%, var(--purple));
--grad-aurora: radial-gradient(ellipse 80% 50% at 20% 40%, rgba(168,85,247,.06), transparent),
               radial-gradient(ellipse 60% 40% at 80% 60%, rgba(124,58,237,.04), transparent),
               radial-gradient(ellipse 100% 60% at 50% 100%, rgba(168,85,247,.03), transparent);
--grad-glow:   radial-gradient(circle, var(--purple-glow-strong), transparent 70%);
```

### 3.4 Contrast Rules
- Body text on `--bg-primary`: `--text-primary` (16.8:1 ✓ AAA).
- Secondary text: `--text-secondary` on `--bg-primary` = 4.6:1 (AA for body, AAA for large).
- `--text-muted` is for ≥14px regular or ≥12px bold only — never for critical content.
- Purple (`#a855f7`) on black = 5.2:1 ✓ AA for text ≥16px. For fine type, use `--purple-light`.

---

## 4. Typography

### 4.1 Families

```css
--font-main: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', Menlo, monospace;
--font-display: 'Inter', sans-serif;  /* weight 900 + tight tracking */
```

Load Inter (400, 500, 600, 700, 800, 900) and JetBrains Mono (400, 500, 700).

### 4.2 Scale

| Token          | Size (clamp)                 | Weight | Tracking | Use                         |
|----------------|------------------------------|--------|----------|-----------------------------|
| `--fs-display` | `clamp(2.2rem, 5vw, 3.8rem)` | 900    | -2px     | Hero headline               |
| `--fs-h1`      | `clamp(2rem, 4.5vw, 3.2rem)` | 900    | -1.5px   | Section hero                |
| `--fs-h2`      | `clamp(1.75rem, 3.5vw, 2.5rem)` | 800 | -1px     | Section title               |
| `--fs-h3`      | `1.5rem`                     | 700    | -0.5px   | Card title                  |
| `--fs-h4`      | `1.125rem`                   | 700    | 0        | Subsection                  |
| `--fs-body`    | `1rem`                       | 400    | 0        | Default body (line-height 1.6) |
| `--fs-lead`    | `1.05rem`                    | 400    | 0        | Hero subtitle (line-height 1.75) |
| `--fs-sm`      | `0.9375rem`                  | 500    | 0        | Button, nav CTA             |
| `--fs-xs`      | `0.8125rem`                  | 500    | 0.3px    | Labels, nav links           |
| `--fs-mono`    | `0.875rem`                   | 500    | 0        | Code, numbers, eyebrows     |

### 4.3 Display Treatments

**Gradient headline** (hero, mid-section punch):
```css
.text-gradient {
  background: var(--grad-brand);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientFlow 4s ease-in-out infinite;
  filter: drop-shadow(0 0 30px rgba(168, 85, 247, 0.3));
}
```

**Glitch text** — reserve for brand moments, max once per page. See `.glitch-text` in `style.css:420`.

**Eyebrow** — mono, muted, uppercase-ish:
```css
.eyebrow { font-family: var(--font-mono); font-size: 0.8125rem; color: var(--purple); letter-spacing: 2px; }
```

### 4.4 Rules
- Never use more than two weights in a single block.
- Never center paragraphs > 3 lines.
- Line length: 60–75ch for prose.
- Numbers in metrics always `--font-mono` for tabular alignment.

---

## 5. Spacing, Sizing, Radii

### 5.1 Spacing scale (4px base)

```css
--space-0:  0;
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  24px;
--space-6:  32px;
--space-7:  48px;
--space-8:  64px;
--space-9:  96px;
--space-10: 120px;  /* section padding */
```

Section rhythm: `padding: var(--space-10) 0;` on desktop, `var(--space-8) 0;` mobile.
Container: `max-width: 1200px; padding: 0 24px;`.

### 5.2 Radii (concentric)

```css
--radius-xs: 6px;   /* chip, dot */
--radius-sm: 8px;   /* icon container, input */
--radius:    12px;  /* button, small card */
--radius-lg: 20px;  /* card, modal */
--radius-xl: 28px;  /* hero panel */
--radius-pill: 9999px;
```

When nesting, child radius = parent − gap. Example: card `20px` with 12px padding → inner element `8px`.

### 5.3 Touch targets
- Minimum 44×44px on mobile. Applies to `.btn`, `a`, `button`, FAQ triggers.

---

## 6. Liquid Glass — Material System

Four tiers, layered from deepest to closest to the viewer. Pick by context, not by taste.

### 6.1 Material Tokens

```css
:root {
  /* Blur strengths */
  --blur-xs: 6px;
  --blur-sm: 10px;
  --blur-md: 20px;
  --blur-lg: 32px;

  /* Saturation boost (Apple-style vibrancy) */
  --sat-boost: saturate(180%);

  /* Specular edge (top highlight on glass) */
  --edge-light: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  --edge-light-strong: inset 0 1px 0 rgba(255, 255, 255, 0.14);

  /* Inner refraction (bottom shadow inside glass) */
  --edge-depth: inset 0 -1px 0 rgba(0, 0, 0, 0.4);
}
```

### 6.2 Material Recipes

**Glass · Regular** — default panel, cards, modals.
```css
.glass-regular {
  background: rgba(13, 13, 13, 0.6);
  backdrop-filter: blur(var(--blur-md)) var(--sat-boost);
  -webkit-backdrop-filter: blur(var(--blur-md)) var(--sat-boost);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--edge-light), 0 8px 32px rgba(0, 0, 0, 0.4);
  border-radius: var(--radius-lg);
}
```

**Glass · Clear** — floating UI over rich backgrounds (over hero, video, image).
```css
.glass-clear {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(var(--blur-lg)) var(--sat-boost);
  -webkit-backdrop-filter: blur(var(--blur-lg)) var(--sat-boost);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: var(--edge-light-strong), var(--edge-depth), 0 12px 40px rgba(0, 0, 0, 0.5);
}
```

**Glass · Tinted** — purple-washed panel for brand moments.
```css
.glass-tinted {
  background:
    linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(168, 85, 247, 0.04)),
    rgba(13, 13, 13, 0.5);
  backdrop-filter: blur(var(--blur-md)) var(--sat-boost);
  border: 1px solid rgba(168, 85, 247, 0.2);
  box-shadow:
    var(--edge-light),
    0 0 40px rgba(168, 85, 247, 0.1),
    0 8px 32px rgba(0, 0, 0, 0.4);
}
```

**Glass · Nav** — floating navbar (extends existing `.navbar.scrolled`).
```css
.glass-nav {
  background: rgba(5, 5, 5, 0.7);
  backdrop-filter: blur(24px) var(--sat-boost);
  -webkit-backdrop-filter: blur(24px) var(--sat-boost);
  border-bottom: 1px solid var(--border-subtle);
  box-shadow: var(--edge-light);
}
```

### 6.3 Liquid Card (mouse-reactive)

The signature component — keeps existing `.liquid-card` (style.css:701) and layers glass beneath.

```css
.liquid-card {
  position: relative;
  overflow: hidden;
  background: rgba(13, 13, 13, 0.6);
  backdrop-filter: blur(var(--blur-md)) var(--sat-boost);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--edge-light);
  transition: var(--transition);
}
.liquid-card::before {
  content: '';
  position: absolute;
  top: var(--mouse-y, 50%);
  left: var(--mouse-x, 50%);
  width: 0; height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, var(--purple-glow-strong), transparent 70%);
  transform: translate(-50%, -50%);
  transition: width .5s ease, height .5s ease;
  pointer-events: none;
  z-index: 0;
}
.liquid-card:hover::before { width: 400px; height: 400px; }
.liquid-card:hover { border-color: var(--border-hover); }
.liquid-card > * { position: relative; z-index: 2; }

@media (hover: none) { .liquid-card:hover::before { width: 0; height: 0; } }
@media (prefers-reduced-motion: reduce) {
  .liquid-card::before { transition: none; }
}
```

### 6.4 When NOT to use glass
- Dense data tables, long forms, legal/privacy content → use solid `--bg-card`.
- Print / PDF / OG images → flatten to solid colors.
- Browsers without `backdrop-filter` support → graceful fallback to `rgba(13,13,13,0.92)`.

```css
@supports not (backdrop-filter: blur(10px)) {
  .glass-regular, .glass-clear, .glass-tinted, .liquid-card {
    background: rgba(13, 13, 13, 0.95);
  }
}
```

---

## 7. Elevation & Shadow

| Level | Use                    | Shadow                                                                  |
|-------|------------------------|-------------------------------------------------------------------------|
| 0     | Flat on canvas         | none                                                                    |
| 1     | Card at rest           | `0 4px 16px rgba(0,0,0,0.3)`                                            |
| 2     | Card hover             | `0 20px 60px rgba(0,0,0,0.4)`                                           |
| 3     | Floating panel         | `0 12px 40px rgba(0,0,0,0.5), var(--edge-light)`                        |
| 4     | Modal / popover        | `0 24px 80px rgba(0,0,0,0.6), var(--edge-light-strong)`                 |
| Glow  | Brand CTA              | `0 0 20px rgba(168,85,247,.6), 0 0 50px rgba(168,85,247,.3), 0 0 80px rgba(168,85,247,.1)` |

Every glass surface gets `--edge-light` as its top-edge specular. Stacking shadows with glow is reserved for `.btn-primary` hover and hero CTA.

---

## 8. Motion

### 8.1 Easings

```css
--ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);       /* default UI */
--ease-in-out:     cubic-bezier(0.65, 0, 0.35, 1);       /* transitions */
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);    /* playful, CTAs */
```

### 8.2 Durations

| Token        | ms   | Use                    |
|--------------|------|------------------------|
| `--dur-fast` | 150  | Hover states, toggles  |
| `--dur-med`  | 300  | Button, card border    |
| `--dur-slow` | 400  | Panels, modals, layout |
| `--dur-epic` | 800  | Hero entrance          |

Default: `transition: all var(--dur-slow) var(--ease-out-expo);`

### 8.3 Signature animations
- **heroFadeUp** — 30px → 0, opacity 0 → 1, 800ms.
- **gradientFlow** — 4s infinite, brand gradient pans 200% across text.
- **orbFloat** — 6s ease-in-out, Y ±20px.
- **flyIcon** — 18–25s linear, left-to-right, random delay per icon.
- **scanlineDrift** — optional, subtle, off by default; respects reduced motion.

### 8.4 Reduced motion
All decorative animations MUST be gated:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .flying-icon, .hero-orb, .scanline-overlay, .glitch-text::before, .glitch-text::after { display: none; }
}
```

---

## 9. Background Effects (Atmosphere Layer)

The ScalePlus signature. Layer order, bottom to top:

1. `--bg-primary` canvas.
2. **Hero grid** — 50px linear-gradient grid, 3% alpha, masked to ellipse center.
3. **Aurora** — three radial ellipses, 3–6% alpha, slow drift (~12s).
4. **Orbs** — 300–500px blurred purple radials, 6s float.
5. **Flying icons** — 6 rotating purple-stroke SVGs, 18–25s linear fly.
6. **Particle canvas** — sparse, `position: fixed`, pointer-events none.
7. **Cursor glow** — 600px radial, follows pointer, 7% alpha.
8. **Scanline overlay** — 2px repeating lines, 3% black; disable on mobile.

Only the **hero** uses all eight. Mid-page sections pick 2–3. Footer: canvas only.

---

## 10. Components

### 10.1 Buttons

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: var(--radius);
  font: 600 var(--fs-sm)/1 var(--font-main);
  min-height: 44px;
  border: none;
  cursor: pointer;
  transition: all var(--dur-med) var(--ease-out-expo);
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: var(--purple);
  color: #fff;
  box-shadow: 0 0 15px rgba(168,85,247,.4), 0 0 30px rgba(168,85,247,.15);
}
.btn-primary:hover {
  background: var(--purple-dark);
  transform: translateY(-1px);
  box-shadow: 0 0 20px rgba(168,85,247,.6), 0 0 50px rgba(168,85,247,.3), 0 0 80px rgba(168,85,247,.1);
}

.btn-ghost {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-strong);
}
.btn-ghost:hover { border-color: var(--border-hover); background: rgba(168,85,247,.05); }

.btn-glass {   /* Liquid Glass variant */
  background: rgba(255,255,255,.06);
  backdrop-filter: blur(var(--blur-sm)) var(--sat-boost);
  border: 1px solid rgba(255,255,255,.1);
  color: var(--text-primary);
  box-shadow: var(--edge-light);
}
.btn-glass:hover {
  background: rgba(168,85,247,.12);
  border-color: rgba(168,85,247,.4);
}

.btn-pill  { border-radius: var(--radius-pill); padding: 10px 24px; }
.btn-full  { width: 100%; justify-content: center; }
```

### 10.2 Navbar
- Transparent at top, glass at scroll (adds `.scrolled`).
- 64px height at rest, 56px scrolled.
- Logo left, links center-right (gap 28px), CTA pill far right.
- Mobile: hamburger → slide-in glass drawer.

### 10.3 Cards
- Default: `.liquid-card` with 32px padding, `--radius-lg`.
- Hover: border → `--border-hover`, translateY(-4px), shadow level 2.
- Stats card: mono number 1.75rem weight 800 purple, 0.8rem muted label.

### 10.4 Pricing Cards
- Featured card: `.glass-tinted` + gradient top border, 1.02× scale at rest.
- Feature list: `✓` in purple-glow circle, 14px text.

### 10.5 Forms
- Input: solid `--bg-card`, 1px `--border-subtle`, 12px radius, 14px padding, focus → `--border-hover` + 0 0 0 3px `--purple-glow`.
- Labels: 13px `--text-secondary`, 6px above input.
- Helper text: 12px `--text-muted`.

### 10.6 Modal / Sheet
- Backdrop: `rgba(0,0,0,0.6)` + `backdrop-filter: blur(8px)`.
- Panel: `.glass-regular` at elevation 4, `--radius-xl`, max-width 560px.
- Entrance: scale 0.96 → 1, opacity 0 → 1, 300ms `--ease-spring`.

### 10.7 Badges / Tags
```css
.badge { padding: 4px 10px; border-radius: var(--radius-pill); font: 500 .75rem var(--font-mono); }
.badge-purple { background: rgba(168,85,247,.12); color: var(--purple-light); border: 1px solid rgba(168,85,247,.25); }
.badge-success{ background: rgba(34,197,94,.1);  color: var(--success); }
```

### 10.8 Footer
- Solid `--bg-primary`, 1px top border `--border-subtle`.
- 4-column grid on desktop, stacked on mobile.
- Links: `--text-secondary`, hover `--text-primary`.

---

## 11. Iconography & Imagery

### 11.1 Icons
- **Lucide** or **Heroicons outline** at 1.5px stroke.
- 20px (inline), 24px (standalone), 32px (feature), 48px (hero).
- Color: `currentColor`. Never multi-color.
- Feature icons sit in a 48px square `rgba(168,85,247,.1)` background, `--radius` corners.

### 11.2 Imagery
- Screenshots: dark UI only. Border radius `--radius`. 1px `--border-subtle` frame.
- Photography: muted, moody, low-key lit. Never stock business handshakes.
- Product mockups: tilt −6° max, drop shadow level 3, subtle purple glow beneath.

### 11.3 OG / Share images
- 1200×630, solid `#0a0a0a`, logo top-left, title 72px weight 900, gradient underline. Keep flat — no glass (rendering fallback).

---

## 12. Layout & Responsive

### 12.1 Breakpoints

```css
--bp-sm: 480px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1200px;
--bp-xxl: 1440px;
```

### 12.2 Grid
- 12-column, 24px gutter, 1200px max.
- Sections: 120px vertical padding desktop, 80px tablet, 60px mobile.
- Hero: `min-height: 100vh` desktop; auto + `padding: 90px 16px 40px` on small.

### 12.3 Responsive material
- Disable `backdrop-filter` on screens < 768px where perf is tight — fallback to solid 0.92α.
- Kill scanlines, flying icons, hero rings below 768px.
- `liquid-card::before` reset to `--mouse-x/y: 50%` (no trail on touch).

---

## 13. Accessibility

- Color is never the only signal. Pair with icon, label, or weight.
- Focus ring (global):

```css
:focus-visible {
  outline: 2px solid var(--purple-light);
  outline-offset: 3px;
  border-radius: inherit;
}
```

- All interactive elements: 44×44px minimum on touch.
- Respect `prefers-reduced-motion` (§8.4), `prefers-reduced-transparency` (fallback to solid), `prefers-color-scheme` (we're dark-only; light theme is out of scope).
- Headings in order. No skipped levels.
- `aria-label` on icon-only buttons. `role="status"` on live metrics.

---

## 14. Z-Index Layers

```css
--z-base:     1;   /* particle canvas, atmosphere */
--z-cursor:   2;   /* cursor glow */
--z-content:  3;   /* sections */
--z-sticky:  100;  /* sticky elements */
--z-nav:    1000;  /* navbar */
--z-modal:  2000;  /* modal, sheet */
--z-toast:  3000;  /* toast, tooltip */
--z-overlay:9998;  /* scanlines, noise */
```

---

## 15. File & Class Conventions

- CSS: BEM-lite — `.block`, `.block-element`, `.block--modifier`. Prefix variants with the base.
- Existing prefixes to keep: `.hero-*`, `.nav-*`, `.btn-*`, `.liquid-*`, `.glass-*`, `.fc-*` (flow chart), `.afc-*` (about float card).
- Tokens in `:root` of `style.css`. Never hard-code colors in components — reference the token.
- Niche overrides live in `[data-niche="..."]` selectors; never duplicate component CSS.

---

## 16. Corporate / Print Deliverables

Used for decks, one-pagers, proposals, investor materials.

- **Keynote/PPTX master**: `#050505` slide background, Inter 900 title (54pt), Inter 400 body (18pt), gradient underline on title line only.
- **Charts**: purple primary (`#a855f7`), muted grid (`rgba(255,255,255,0.06)`), mono axis labels.
- **PDF/print**: flatten glass to solid `#0d0d0d`, keep purple as single-ink accent. Ensure 300dpi logo.
- **Email signature**: logo 120×32, Inter 400, links `--purple-light`, never gradient text (Outlook breaks).
- **Letterhead / invoices**: white page for legal clarity. Single purple hairline at top (`#a855f7`, 2pt), logo top-left, Inter 10pt body.

---

## 17. Do / Don't

| Do                                                          | Don't                                                   |
|-------------------------------------------------------------|---------------------------------------------------------|
| Layer glass over atmospheric backgrounds                    | Stack glass on glass on glass (max 2 tiers)             |
| Use purple as glow, gradient, or 1-line accent              | Fill large areas with flat purple                       |
| Keep motion snappy (300–400ms) and easing `ease-out-expo`   | Linear transitions, or springs over 600ms for UI        |
| Provide solid fallbacks for every glass surface             | Ship glass without `@supports` and reduced-transparency |
| Pair color signals with icons/labels                        | Rely on red/green alone for state                       |
| Use mono for numbers and eyebrows                           | Use mono for body text                                  |
| Respect niche accents — one per view                        | Mix two niche accents in a single card                  |

---

## 18. Versioning

- **1.0 · 2026-04-23** — Initial unified system. Merges existing Blackout+Purple palette with Apple Liquid Glass material tiers. Locked tokens, material recipes, component primitives, corporate extensions.

Future changes land via PR with a migration note in this section. Tokens are the contract — components can evolve, tokens only expand.
