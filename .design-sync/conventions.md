# c12z.io — how to build with this design system

**This is a CSS design system, not a React component library.** c12z.io is an Astro site; its
UI is written in `.astro` files that cannot be compiled into a React bundle, so there is no
`_ds_bundle.js` and nothing to import from `window.*`. What you get is the complete visual
language: fonts, colour tokens, type scale, spacing scale, reset, and prose styling.

Build with plain HTML/JSX elements and style them **only** with this system's CSS variables.

## Setup

Nothing to wrap — no provider, no theme context. Load `styles.css` and the tokens are live on
`:root`. It is the single entry point; everything else arrives through its `@import` closure
(`fonts/fonts.css`, `tokens/*.css`, `base/*.css`).

Dark is the default palette (**burntpaper**). Switch to light (**recycledpaper**) by putting
`data-theme="light"` on `<html>` — that's the only theme switch; there is no `data-theme="dark"`
value in the CSS, dark is what `:root` already is.

```html
<html data-theme="light">
```

**`1rem = 14px` here.** `base/reset.css` sets `html, body { font-size: var(--t-body) }` and `--t-body`
is `0.875rem`. Every `rem` value in the tokens is already calibrated to that — use the tokens and
it works out; hand-write `1.5rem` expecting 24px and it will be 21px.

## The styling idiom: `var(--token)`, never literals

No utility classes, no styled props. Write real CSS (CSS Modules on the site itself) and reach
for a variable for every colour, size, space, radius, and duration.

| Family | Examples | For |
|---|---|---|
| Surfaces | `--bg`, `--surface-1`, `--surface-2`, `--surface-3` | backgrounds, stacked from page to card |
| Borders | `--border`, `--border-2`, `--border-3`, `--hairline`, `--hairline-2` | the last two are complete `border` shorthands |
| Text | `--fg`, `--fg-2`, `--fg-3`, `--fg-inverse` | primary / secondary / muted / on-accent |
| Accents | `--accent` (lime `#a2ce12`), `--accent-ink`, `--accent-2` (purple) | `--accent-ink` is the darker lime for text on light surfaces |
| Content sections | `--c-behavior`, `--c-bias`, `--c-mental-model`, `--c-source`, `--c-essay`, `--c-library`, `--c-project`, `--c-note` | one hue per content type; use it for that section's accents |
| Bias categories | `--c-bias-category-speed`, `-memory`, `-judgment`, `-context`, `-perception` | plus `--c-bias-soft` / `--c-bias-dark` neutrals |
| Book categories | `--c-book-health`, `-product`, `-culture`, `-psychology`, `-economics`, `-creativity`, `-philosophy`, `-other` | |
| State | `--ok`, `--warn`, `--err`, `--c-wip`, `--c-goback` | `--c-wip` is the red for 🚧 work-in-progress boxes |
| Type family | `--ff-pixel` (Tamago), `--ff-rubik` (Rubik), `--ff-mono` (Cascadia) | display/headings · body · code |
| Type size | `--t-display`, `--t-intro`, `--t-h1`…`--t-h6`, `--t-body`, `--t-mili`, `--t-micro`, `--t-nano` | each pairs with a `--lh-*` of the same suffix |
| Tracking | `--tracking-wide`, `--tracking-wider`, `--tracking-eyebrow`, `--tracking-widest` | `--tracking-eyebrow` for uppercase labels |
| Spacing | `--sp-0`, `--sp-05`, `--sp-1` … `--sp-18` | 4pt scale |
| Widths | `--wdth-0` … `--wdth-17`, `--wdth-pill` | component sizing, avatars, cards |
| Breakpoints | `--screen-xs`, `-sm`, `-md`, `-n`, `-lg`, `-xl`, `-2xl` | `--screen-n` (56rem) is the site's own content width |
| Radii | `--r-xs`, `--r-sm`, `--r-md`, `--r-lg`, `--r-pill` | |
| Elevation | `--shadow-1`, `--shadow-2`, `--inset-top` | used sparingly — borders carry most of the hierarchy |
| Motion | `--ease`, `--t-fast`, `--t-base`, `--t-slow` | |
| Layout | `--maxw`, `--maxw-prose`, `--maxw-hero`, `--header-h` | |

Only three classes exist globally: **`.lettering`** (prose wrapper — see below), **`.au`**
(fade-up entrance animation), and the KaTeX classes from the math pipeline. Everything else you
name yourself.

## Long-form content

Wrap rendered markdown in `.lettering` and write plain semantic HTML inside it — headings,
paragraphs, lists, blockquotes, tables, `pre`/`code`, `figure` are all styled by
`base/prose.css`. External links (`href^="https"`) automatically get a trailing ↗ marker.

`base/elements.css` applies the same rules **unscoped** to bare elements, mirroring the site,
so a stray `<p>` outside `.lettering` still picks up prose spacing.

## Page shell

`base/page-shell.css` holds the site's own body geometry — a centred `--screen-n` (896px) column
with `main` inside it. It is **deliberately not imported** by `styles.css`, so designs are free
to be full-bleed or wider. `@import` it yourself only when reproducing a real c12z.io page.

## Aesthetic

Dark-first, retro-digital, content-focused. Lime on near-black. Generous spacing, minimal chrome,
no decorative fluff. Recurring motifs: **left or bottom borders** as the list-item divider
(`border-left: 0.125rem solid var(--border-2)`) rather than boxes; pixel-font headings against
Rubik body text; a fixed paper-grain texture behind everything (`tokens/texture.css`, already
applied to `body::before`/`::after`).

## Example

```jsx
// A content-section card. Real CSS, tokens only, borders over boxes.
<article style={{
  borderLeft: "0.125rem solid var(--c-bias)",
  background: "var(--surface-1)",
  padding: "var(--sp-4)",
  borderRadius: "var(--r-sm)",
  transition: "background var(--t-base) var(--ease)",
}}>
  <span style={{
    fontFamily: "var(--ff-mono)",
    fontSize: "var(--t-nano)",
    letterSpacing: "var(--tracking-eyebrow)",
    textTransform: "uppercase",
    color: "var(--c-bias-category-memory)",
  }}>memoria</span>
  <h3 style={{ fontFamily: "var(--ff-pixel)", fontSize: "var(--t-h3)", marginBlock: "var(--sp-1)" }}>
    Sesgo de disponibilidad
  </h3>
  <p style={{ color: "var(--fg-2)", fontSize: "var(--t-mili)" }}>
    Juzgamos la probabilidad por la facilidad con la que recordamos un ejemplo.
  </p>
</article>
```

## Where the truth lives

Read the real files before styling — they are short and authoritative: `styles.css` and its
imports (`tokens/colors.css`, `tokens/typography.css`, `tokens/layout.css`, `tokens/texture.css`,
`base/reset.css`, `base/prose.css`, `base/elements.css`). The four cards under
`components/Foundations/` render every token visually.

**UI copy is Spanish; code, class names and identifiers are English.**
