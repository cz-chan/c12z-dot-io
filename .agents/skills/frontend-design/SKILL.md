---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces for c12z.io. Adapted to the project's retro-digital aesthetic, design tokens, and Astro + React stack.
---

This skill guides creation of new UI components and pages for **c12z.io** — a personal blog/portfolio with a retro-digital, dark-first aesthetic. All output must integrate with the existing design system without breaking visual coherence.

The tokens below are the contract of `src/styles/global.css`. **That file is the source of truth**: if the two disagree, global.css wins and this skill is what needs fixing.

## Project Context

**Stack:** Astro 7 + React 19 + MDX. Deployed on Vercel (`output: "static"`).

**There is no Tailwind.** Styling is plain CSS: design-token variables in `src/styles/global.css` plus one CSS Module per component. Never write a utility class, never add a `tailwind.config.js`.

**File conventions:**

- `.astro` by default — `.tsx` only when the component needs client-side interactivity
- A CSS Module lives **next to the component it styles**, never in a `styles/` folder (there is none)
- A CSS Module is named after its component: `go-back-in-top.module.css`, not `gbit.module.css`
- Components are `PascalCase`; `lib/`, `seo/` and CSS Modules are `kebab-case`
- A component owning more than one file gets its own kebab-case folder (`ui/toc/`, `ui/toggle-theme/`)
- Animations in React components use **Motion** (`motion/react`); `es-toolkit` for throttle/debounce
- Props are declared as `interface Props` inside the component file. Never `Astro.props as X` — it silences errors

**Path aliases — always import through the most specific one.** Never a `../../` chain across folders. Each path has `@<name>-path/*` (`@biases-path/*`, `@books-path/*`, `@behavior-path/*`, `@sources-path/*`…); cross-cutting are `@/*`, `@/lib/*`, `@/global/*`, `@/ui/*`, `@/icons/*`, `@/seo/*`, `@/mdx/*`, `@/layout/*`, `@/analytics/*`, `@/layouts/*`, `@/utils/*`, `@/assets/*`. There is no `@/paths/*` on purpose.

**Where a component goes:** in the path that uses it. It graduates to `src/components/` only once **2+ paths** need it — not before, however generic it looks.

## Design System — ALWAYS follow this

Tokens are CSS variables on `:root` (dark, default — palette **"burntpaper"**) and `[data-theme="light"]` (**"recycledpaper"**). **Never hardcode a color, size, spacing, radius or duration** — the token exists.

### Surfaces, text, accents

| Role          | Tokens                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Surfaces      | `--bg` · `--surface-1` `--surface-2` `--surface-3`                                                  |
| Borders       | `--border` `--border-2` `--border-3` · shorthand `--hairline`, `--hairline-2`                       |
| Text          | `--fg` (headers/body) · `--fg-2` (secondary) · `--fg-3` (muted)                                     |
| Accent        | `--accent` pink `#ff6e91` · `--accent-ink` (its darker pair, for text)                              |
| Second accent | `--accent-2` lime `#ccff33` — `:root` only, does not flip in light                                  |
| Selection     | `--accent-selection-bg` / `--accent-selection-fg`                                                   |
| Fixed         | `--ink-fixed` / `--paper-fixed` — do **not** flip with the theme, on purpose: they'd break contrast |
| State         | `--ok` `--warn` `--err` · `--c-wip` · `--c-goback`                                                  |

**The pink `--accent` is the identity.** The lime `--accent-2` is the second voice, used sparingly.

### Content-section colors

`--c-behavior` · `--c-bias` · `--c-mental-model` · `--c-design` · `--c-source` · `--c-essay` · `--c-library` · `--c-project` · `--c-note`

Three of them have an `-ink` twin — `--c-design-ink`, `--c-mental-model-ink`, `--c-source-ink` — because those three keep their dark-theme value in light mode (they sit on `--ink-fixed`, which never flips), and that value drops to 1.2–2.8:1 against the paper. **Use the `-ink` variant on text and thin strokes; the plain one on fills and on anything over `--ink-fixed`.** In dark mode both resolve to the same value.

Only `--c-source-ink` is wired up today; design-laws and mental-models still underline with the base token and read weak in light mode.

### Category scales

Behavior cards use a `surface` + `band` pair per category, defined in both themes:

- **Biases**: `--c-bias-category-{speed,memory,judgment,context,perception}-{surface,band}` (plus the neutral `--c-bias-soft`; `--c-bias-dark` exists but nothing uses it)
- **Mental models**: `--c-model-category-{general,science,systems,maths,economics,war,judgment}-{surface,band}`
- **Design laws**: `--c-design-category-{layout,interaction,perception}-{surface,band}`

**Content categories** are a flat scale shared by `books` and `notes`, defined in both themes: `--c-category-{health,product,culture,psychology,economics,creativity,philosophy,business}` (the shared eight) plus `--c-category-{random,relationship,society,sport,programming}` (notes only). They mirror `src/lib/content-categories/` one to one — a value added there needs its token here.

The category pill (`book.module.css .bookCategory`) paints itself through a local `--c`: the pill and its dot are styled once, and each `&.<category>` class only sets `--c: var(--c-category-<name>)`. Follow that shape rather than repeating `background-color`/`color` per category.

### Typography

| Role                       | Font                          | Token        |
| -------------------------- | ----------------------------- | ------------ |
| Display / headings / links | **Tamago** (pixel art)        | `--ff-pixel` |
| Body                       | **Rubik** (300–700 + italics) | `--ff-rubik` |
| Code                       | **Cascadia**                  | `--ff-mono`  |

`global.css` already sets `--ff-pixel` on `h1`–`h6` **and on `a`**, and `--ff-rubik` on the body. Don't restate that.

Scale — each size has its line-height twin: `--t-display`/`--lh-display`, `--t-intro` (intro title only), `--t-h1`…`--t-h6`, `--t-body`, `--t-mili`, `--t-micro`, `--t-nano`.
Tracking: `--tracking-wide` · `--tracking-wider` · `--tracking-eyebrow` (uppercase labels) · `--tracking-widest`.

**`html` font-size is `--t-body` (14px), so `1rem` = 14px.** Reason through every rem value with that in mind.

### Spacing, sizing, motion

- **Spacing**, 4pt scale: `--sp-0` … `--sp-18` (`--sp-4` = 16px)
- **Widths**: `--wdth` (1px hairline), `--wdth-0` … `--wdth-17`, `--wdth-pill`
- **Breakpoints**: `--screen-xs` `-sm` `-md` `-n` `-lg` `-xl` `-2xl`. `body` is capped at `--screen-n`, `main` at `--screen-md`
- **Layout**: `--maxw-prose`
- **Radii**: `--r-xs` `--r-sm` `--r-md` `--r-lg` `--r-pill`
- **Elevation**: `--shadow-2` — borders carry almost all the hierarchy here, shadows are rare
- **Motion**: `--ease` (`cubic-bezier(.2,.8,.2,1)`) with `--t-fast` 120ms / `--t-base` 200ms / `--t-slow` 400ms. Every transition uses these — no `ease-in-out`, no invented durations
- **Full height**: `--viewport-full` then `--viewport-full-new` (dvh) as the override

### Recurring visual motifs

- Left / bottom border on list items — the signature of the site's lists
- Entrance: the global `.au` class (`fadeUp`, 0.5s `--ease`), staggered with `animation-delay`
- Eyebrows: muted uppercase labels in `--fg-3` with `--tracking-eyebrow`
- WIP sections: red-bordered box + 🚧 badge using `--c-wip`
- The paper texture (`body::before` / `::after`, fixed grain + flecks) sits at `z-index: -1`. Don't give a component a solid full-bleed background that covers it without reason

## Design Thinking for this project

Before generating any component:

1. **Aesthetic anchor** — retro-digital, dark-first, content-focused. The pixel font on pink over near-black is the identity. Generous space, minimal chrome, no decorative fluff. Don't dilute it.
2. **Component role** — informational, navigational or interactive? Match the implementation's complexity to the role. Most things here are `.astro` and static.
3. **Motion** — one well-orchestrated entrance beats scattered micro-interactions. Respect `prefers-reduced-motion`.
4. **Spatial composition** — generous negative space, asymmetry where it earns it, grid-breaking accents in pink or lime.
5. **Both themes, always** — anything you write on `:root` must be checked under `[data-theme="light"]`. That is what the `-ink` twins exist for.

## What NOT to do

- Don't use Tailwind utilities or create a `tailwind.config.js` — the project has no Tailwind
- Don't hardcode a color, size, spacing, radius or duration — map it to a token; add a new token to `global.css` only when nothing fits
- Don't import new fonts — Tamago, Rubik and Cascadia are already loaded globally
- Don't create a `styles/` folder — the CSS Module goes next to its component
- Don't put a component in `src/components/` until a second path needs it
- Don't reach for `.tsx` for purely presentational components
- Don't write a relative `../../` import when an alias exists
- Don't leave `console.log` or debug artifacts
