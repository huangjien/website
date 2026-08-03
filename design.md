# Design — huangjien/website

> A locked design system for this Next.js app. Every page redesign reads this
> file before emitting code. Do not regenerate per page — extend or amend this
> file when the system needs to grow.
>
> **Status:** v0.2 — system locked, conflicts resolved 2026-08-03. Page work
> may proceed under the _Resolved decisions_ section.

## Genre

**modern-minimal** — Stripe / Linear / ElevenLabs school. Confident sans
display, clean canvas, pill CTAs, monochrome with one restrained accent.

The catalog's modern-minimal themes are **Coral** (warm-grey paper + coral
accent, the canonical pick) and **Cobalt** (cool near-white + electric cobalt
signal, the technical / API / dev-tool sibling). The rotation walks
Coral ⇄ Cobalt across the app's two faces (blog, AI).

## Macrostructure family

Pages within a family share the family's shape. They vary only in component
archetypes, not in type / colour / CTA voice / section rhythm.

| Page family          | Routes                      | Macrostructure                                                        | Variation knobs                                                                       |
| -------------------- | --------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Marketing / list** | `index.js`                  | **Marquee Hero** (modern-minimal two-column, title-left + lede-right) | Hero archetype H1 (text-led) ↔ H3 (data-led) per run; section heads S1 / S2 alternate |
| **Content**          | `about.js`                  | **Long Document**                                                     | Single column, max-measure 68 ch, optional pull-quote break                           |
| **App**              | `ai.js`, `settings.js`      | **Workbench** (split: controls / context left, primary surface right) | H4 muted app-header; F1 inline feature row; C2 outline secondary CTA                  |
| **Error**            | `error.js`, `auth/error.js` | **Stat-Led** (single message + one or two actions)                    | No hero; no nav variation; Ft2 inline footer only                                     |

**Diversification discipline.** Each run within a family picks a _different_
hero archetype and section-head archetype. State the pick out loud in the
preview block before writing code. See `.hallmark/log.json` for history.

## Theme

**Base: Coral** for marketing / content / error routes. **Override: Cobalt**
for `ai.js` (signals "this is the dev-tool face"). The two share all tokens
except paper OKLCH lightness/chroma, accent OKLCH, and accent placement.

### Coral (light)

```css
--color-paper: oklch(98.5% 0.005 80); /* warm-grey near-white */
--color-paper-2: oklch(96% 0.006 80); /* card surface */
--color-ink: oklch(20% 0.01 240); /* near-black, neutral-cool */
--color-ink-2: oklch(40% 0.008 240); /* secondary text */
--color-rule: oklch(91% 0.005 80); /* hairline borders */
--color-accent: oklch(
  60% 0.15 25
); /* warm coral — darkened from 70% for 3:1 contrast on paper (gate 40) */
--color-accent-ink: oklch(99% 0.005 25); /* text on accent */
--color-focus: oklch(60% 0.15 25); /* accent IS focus ring */
```

### Coral (dark — already the app's default via `next-themes`)

```css
--color-paper: oklch(16% 0.008 240);
--color-paper-2: oklch(20% 0.008 240);
--color-ink: oklch(96% 0.005 80);
--color-ink-2: oklch(75% 0.005 80);
--color-rule: oklch(28% 0.008 240);
--color-accent: oklch(72% 0.15 25);
--color-accent-ink: oklch(16% 0.01 240);
--color-focus: oklch(72% 0.15 25);
```

### Cobalt (light, `ai.js` only)

```css
--color-paper: oklch(99% 0.003 240);
--color-paper-2: oklch(96% 0.004 240);
--color-ink: oklch(18% 0.01 240);
--color-ink-2: oklch(42% 0.008 240);
--color-rule: oklch(90% 0.004 240);
--color-accent: oklch(58% 0.18 255); /* electric cobalt */
--color-accent-ink: oklch(99% 0.003 240);
--color-focus: oklch(58% 0.18 255);
```

### Cobalt (dark, `ai.js` only)

```css
--color-paper: oklch(14% 0.01 240);
--color-paper-2: oklch(18% 0.01 240);
--color-ink: oklch(96% 0.004 240);
--color-ink-2: oklch(72% 0.006 240);
--color-rule: oklch(26% 0.01 240);
--color-accent: oklch(68% 0.18 255);
--color-accent-ink: oklch(14% 0.01 240);
--color-focus: oklch(68% 0.18 255);
```

Accent usage: ≤ 5 % of viewport at any time. Coral appears only on (a) primary
CTA fill, (b) focus ring, (c) one accent rule / underline per page. Cobalt
expands to one signal-rail element on `ai.js` (e.g., the input border or the
send-button).

## Typography

The project already loads three faces via `next/font/google` in
`src/pages/_app.js`:

- **Geist Sans** → `--font-sans` (body, navigation, primary display)
- **Geist Mono** → `--font-mono` (code, metadata, hash chips)
- **Newsreader** → `--font-display` (serif accent — see _Conflicts_ below)

Hallmark role mapping:

| Role                        | Token            | Face       | Weight     | Tracking                 |
| --------------------------- | ---------------- | ---------- | ---------- | ------------------------ |
| Display (primary headings)  | `--font-display` | Geist Sans | 600        | `-0.025em` to `-0.035em` |
| Display outlier (hero only) | `--font-outlier` | Geist Sans | 500        | `-0.02em`                |
| Body                        | `--font-body`    | Geist Sans | 400        | normal                   |
| Mono                        | `--font-mono`    | Geist Mono | 400        | normal                   |
| Serif accent (sparing)      | `--font-serif`   | Newsreader | 400 italic | normal                   |

**Type scale anchor** (`--text-display`) — `clamp(2.5rem, 5vw + 0.5rem, 4.75rem)`.
Hero headlines cap at 50 chars; longer copy steps down one rung.

**Hero sizing brackets:** 21–50 chars use `--text-display` (4.75 rem);
51–90 chars cap at `--text-display-s` (3.5 rem); > 90 chars rewrite shorter or
cap at `--text-4xl` (2.25 rem).

## Spacing

4-pt scale. The project already has a 4-pt scale in `src/pages/globals.css`
(`--spacing-xs` … `--spacing-2xl`). Hallmark tokens alias those — no new
spacing values are introduced.

| Hallmark token | Project token   | Value            |
| -------------- | --------------- | ---------------- |
| `--space-3xs`  | `--spacing-xs`  | 0.25 rem (4 px)  |
| `--space-2xs`  | `--spacing-sm`  | 0.5 rem (8 px)   |
| `--space-xs`   | — (new)         | 0.75 rem (12 px) |
| `--space-sm`   | `--spacing-md`  | 1 rem (16 px)    |
| `--space-md`   | `--spacing-lg`  | 1.5 rem (24 px)  |
| `--space-lg`   | `--spacing-xl`  | 2 rem (32 px)    |
| `--space-xl`   | `--spacing-2xl` | 3 rem (48 px)    |
| `--space-2xl`  | — (new)         | 4.5 rem (72 px)  |
| `--space-3xl`  | — (new)         | 7 rem (112 px)   |

## Motion

Motion stance: **motion-cut**. No `framer-motion`, `motion`, or `gsap` in
`package.json`; the project relies on Tailwind keyframes + `tailwindcss-animate`.
Hallmark matches: no entrance animation on the page itself; transitions are
short, transform/opacity only.

- Easings: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)` — alias existing `tailwind.config.js` values.
- Durations: `--dur-short: 180ms`, `--dur-base: 220ms`, `--dur-long: 320ms`.
- Reveal pattern: none (page is composed, not revealed). Acceptable: 200 ms opacity crossfade on route transition.
- Reduced-motion: collapse to ≤ 150 ms opacity crossfade; no spatial motion.

## Microinteractions stance

- **Silent success** over celebratory toasts. The existing `ToastProvider` may
  emit a single short toast for error / network-failure only.
- Hover delay: 800 ms (tooltips). Focus delay: 0 ms.
- Buttons: filled primary (accent fill, accent-ink text, full pill, 12 px
  vertical padding). Secondary: outline (1 px rule, ink text, full pill).
- No overshoot / bounce easings. Gate 12 strictly applies.
- All interactive components ship the **8 states**:
  `default · hover · :focus-visible · :active · disabled · loading · error · success`.

## CTA voice

- **Primary CTA** — filled, full pill, accent fill, accent-ink label, 12 / 22
  padding, `--text-sm` (0.875 rem), weight 500.
- **Secondary CTA** — outline, full pill, 1 px ink rule, ink label, identical
  padding + size.
- **Tertiary action** — text-only with a hairline underline, ink-2 colour,
  0 px padding.
- **Disabled** — 50 % opacity, `cursor: not-allowed`, no hover lift.

## Per-page allowances

| Page family                         | Enrichment                                                  | Section count     | Section heads           | Hero                                | Footer                 | Nav                         |
| ----------------------------------- | ----------------------------------------------------------- | ----------------- | ----------------------- | ----------------------------------- | ---------------------- | --------------------------- |
| Marketing / list (`index.js`)       | E1 clipped-edge demo (Tier-A CSS art) allowed; default none | 3–5               | S1 + S2 alternating     | H1 text-led (default) ↔ H3 data-led | Ft2 inline single line | N5 floating pill            |
| Content (`about.js`)                | none — typography only                                      | 1 (single column) | implicit section breaks | none                                | Ft2 inline             | N5 floating pill            |
| App (`ai.js`, `settings.js`)        | none — function carries the page                            | 1 (split surface) | H4 muted app-header     | none                                | Ft2 inline             | N13 inline ⌘K-pill          |
| Error (`error.js`, `auth/error.js`) | none                                                        | 1                 | none                    | H5 stat-led single message          | Ft2 inline             | hidden, single ⌘K-pill only |

## What pages MUST share

- The wordmark and its placement.
- The `--font-display` (Geist Sans 600, tight tracking) for primary headings.
- The accent colour and its ≤ 5 % placement rule.
- The CTA voice (filled pill primary, outline pill secondary, both same height).
- The section-heading rhythm: `eyebrow · display heading · lede paragraph`,
  stacked vertically, never hanging-header two-column.
- The footer (Ft2 inline) and the navigation default (N5 floating pill).
- The 8-state discipline on every interactive element.
- The 58-gate slop test on every emit.

## What pages MAY differ on

- Macrostructure within the page-type family.
- Hero archetype (within the family's allowance).
- Accent hue (Coral on most routes; Cobalt on `ai.js`).
- Section count (3–5 on marketing; 1 on content / app / error).
- Component archetypes (cards, tabs, toasts) within the cookbook's allowed
  list for the genre.

## Resolved decisions (locked 2026-08-03)

Three pre-flight conflicts surfaced in v0.1. The user approved all three
draft proposals; the resolutions are now locked.

### C1 · Newsreader role → `--font-serif` (sparing accents)

- Newsreader stays loaded via `next/font` (no removal cost).
- Primary display face: **Geist Sans 600** (token: `--font-display`).
- Newsreader: **outlier role only** (token: `--font-serif`). Used in
  sparing places — italic accent words inside running body, pull-quote
  captions, em-dash ledes. Never on `<h1>` / `<h2>` / display headings.
- Result: a "modern-minimal with editorial accents" hybrid. The genre
  pick stays modern-minimal; the genre rule "sans top-to-bottom" is
  upheld for primary display, with one explicit accent surface for the
  serif outlier.

### C2 · HSL preserved + OKLCH parallel layer in `tokens.css`

- HSL variables (`hsl(var(--background))`, `hsl(var(--primary))`, etc.)
  in `tailwind.config.js` **stay** — no migration.
- New file `tokens.css` at the project root declares the full OKLCH
  palette + spacing + radius + duration + easing tokens, with a `.dark`
  override block that works with the existing `next-themes` switch.
- Components migrating to Hallmark reference OKLCH tokens
  (`var(--color-paper)`, `var(--color-accent)`) directly. Components
  still on shadcn-style continue to use HSL. Parallel layers, no
  forced migration.

### C3 · Pilot = `index.js` as-is, H1 hero, no new sections

- Pilot page: **`src/pages/index.js`**.
- Content: the existing `IssueList` over GitHub data — kept as-is.
- New typography: one H1 text-led hero **above** the issue list. No
  additional sections (no Features grid, no Pricing, no Testimonials).
- The 3–5-section marketing macrostructure (Marquee Hero → Logos →
  Features → CTA → Footer) is **reserved for new marketing surfaces**
  and does **not** retrofit onto the existing blog index. This
  protects content + product from accidental change.
- Future `index.js` work (after pilot lands) may add a lede paragraph
  if the user wants — out of scope for the pilot.

## Exports

### tokens.css (canonical)

Lives at `tokens.css` at the project root. Every Hallmark-emitted page
imports this. Existing `src/pages/globals.css` stays as the entry-point;
tokens.css sits _alongside_ it and is imported via the existing `@import`
chain. Never clobbers existing rules.

```css
:root {
  /* theme + scale — see Theme and Spacing sections above */
  --color-paper: oklch(98.5% 0.005 80);
  --color-paper-2: oklch(96% 0.006 80);
  --color-ink: oklch(20% 0.01 240);
  --color-ink-2: oklch(40% 0.008 240);
  --color-rule: oklch(91% 0.005 80);
  --color-accent: oklch(
    60% 0.15 25
  ); /* darkened from 70% for 3:1 contrast (gate 40) */
  --color-accent-ink: oklch(99% 0.005 25);
  --color-focus: oklch(60% 0.15 25);

  --font-display: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
  --font-body: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-mono), ui-monospace, SFMono-Regular, monospace;
  --font-serif: var(--font-display), ui-serif, Georgia, serif;

  --space-3xs: 0.25rem;
  --space-2xs: 0.5rem;
  --space-xs: 0.75rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 4.5rem;
  --space-3xl: 7rem;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1.125rem;
  --text-lg: 1.375rem;
  --text-xl: 1.75rem;
  --text-2xl: 2.25rem;
  --text-display: clamp(2.5rem, 5vw + 0.5rem, 4.75rem);

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --dur-short: 180ms;
  --dur-base: 220ms;
  --dur-long: 320ms;

  --radius-card: 12px;
  --radius-pill: 999px;
  --radius-input: 10px;
}

.dark {
  /* dark Coral values — see Theme section */
  --color-paper: oklch(16% 0.008 240);
  --color-paper-2: oklch(20% 0.008 240);
  --color-ink: oklch(96% 0.005 80);
  --color-ink-2: oklch(75% 0.005 80);
  --color-rule: oklch(28% 0.008 240);
  --color-accent: oklch(72% 0.15 25);
  --color-accent-ink: oklch(16% 0.01 240);
  --color-focus: oklch(72% 0.15 25);
}
```

### Tailwind `@theme` (project is v3 — use `theme.extend`)

```js
// tailwind.config.js — additions under theme.extend
colors: {
  paper:      "var(--color-paper)",
  "paper-2":  "var(--color-paper-2)",
  ink:        "var(--color-ink)",
  "ink-2":    "var(--color-ink-2)",
  rule:       "var(--color-rule)",
  accent: {
    DEFAULT: "var(--color-accent)",
    ink:     "var(--color-accent-ink)",
  },
  focus:      "var(--color-focus)",
},
fontFamily: {
  display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
  body:    ["var(--font-body)",    "ui-sans-serif", "system-ui", "sans-serif"],
  mono:    ["var(--font-mono)",    "ui-monospace",  "monospace"],
  serif:   ["var(--font-serif)",   "ui-serif",      "Georgia", "serif"],
},
```

### DTCG `tokens.json` (optional — only if a future consumer needs it)

```json
{
  "color": {
    "paper": { "$value": "oklch(98.5% 0.005 80)", "$type": "color" },
    "ink": { "$value": "oklch(20% 0.01 240)", "$type": "color" },
    "accent": { "$value": "oklch(60% 0.15 25)", "$type": "color" }
  }
}
```

### shadcn/ui CSS variables (parallel, HSL — preserved as-is)

The existing `hsl(var(--background))` etc. stay. Hallmark does not consume
them. Components migrated to Hallmark use the OKLCH tokens; components still
on shadcn-style continue to use the HSL variables. Single source of truth is
**not** a goal here — parallel layers reduce migration risk.

## Stamp signature

Every page that follows this system stamps the top of its CSS / `<style>`:

```css
/* Hallmark · genre: modern-minimal · macrostructure: <name> · theme: <coral|cobalt>
 * nav: <N#> · footer: <Ft#> · stamp: v0.2
 */
```

`.hallmark/log.json` records the pick at the project root for diversification
on subsequent runs.

---

## Pre-flight findings (frozen)

- **Font stack:** Geist Sans + Geist Mono + Newsreader via `next/font/google` (`src/pages/_app.js` L8–L11).
- **Palette:** shadcn-style HSL CSS variables in `tailwind.config.js`; no existing OKLCH.
- **Tokens:** `src/pages/globals.css` already declares 4-pt spacing, font size, radius, and duration tokens — Hallmark aliases rather than replaces.
- **Motion:** no `framer-motion` / `motion` / `gsap`; `tailwindcss-animate` + CSS keyframes. Motion-cut.
- **Spacing:** 4-pt scale (`--spacing-xs` … `--spacing-2xl`).
- **Framework:** Next.js Pages Router, React 19, Tailwind v3 (JIT), `next-themes` (default `dark`), `next-auth`, `react-i18next` (14 locales), Serwist PWA.
- **Theming:** `next-themes` toggles `.dark` class on `<html>`. Hallmark `.dark { ... }` block in `tokens.css` works with the existing switch.

**Hallmark will preserve:** the HSL shadcn variables, the existing 4-pt spacing tokens, all three next/font faces, the `next-themes` integration, all 14 locales, every existing route, every existing component, the existing Jest / Lighthouse / i18n-parity / perf-budgets CI.

**Hallmark will introduce:** the `design.md` system, `tokens.css` (OKLCH parallel layer), `.hallmark/log.json` (diversification memory), Hallmark stamps on emitted CSS, 58-gate slop test on every emit.
