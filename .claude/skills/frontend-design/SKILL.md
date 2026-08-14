---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces for c12z.io. Adapted to the project's retro-digital aesthetic, design tokens, and Astro + React stack.
---

This skill guides creation of new UI components and pages for **c12z.io** — a personal blog/portfolio with a retro-digital, dark-first aesthetic. All output must integrate with the existing design system without breaking visual coherence.

## Project Context

**Stack:** Astro 6 + React 19 + TailwindCSS v4 (Vite plugin) + MDX. Deployed on Vercel (static output).

**File conventions:**

- Use `.astro` components by default — only `.tsx` when interactivity is required
- Feature-scoped styles go in `src/paths/<name>/styles/*.module.css`
- Tailwind utilities for layout/spacing; CSS Modules for component-level styles
- Animations in React components use the **Motion** library (`motion/react`)
- Path aliases: `@/*` → `src/*`, `@/common/*` → `src/components/common/*`, `@/ui/*` → `src/components/ui/*`, `@/paths/*` → `src/paths/*`

## Design System — ALWAYS follow this

All tokens are CSS variables in `src/styles/global.css`. **Never hardcode colors.**

### Palette

**Dark mode (default):**

- `--color-bg` `#111` | `--color-surface` `#1a1a1a` | `--color-surface-alt` `#2e2e2e`
- `--color-border` `#242424`
- Text: `--color-text-header` `#fcf8f1` | `--color-text` `#dfdbd5` | `--color-text-relaxed` `#9d9b98`
- Accents: `--color-primary` `#ff2f92` (hot pink) | `--color-secondary` `#904fe7` (purple)

**Light mode:**

- `--color-bg` `#f5f2ee` | `--color-surface` `#eae6e1` | `--color-surface-alt` `#cfcac3`
- Text: `--color-text-header` `#0c0c0b` | `--color-text` `#1f1e1d` | `--color-text-relaxed` `#595856`

**Content-type accent colors (dark / light):**
| Section | Dark | Light |
|---------|------|-------|
| Behavior | `#e22ef6` | `#80008e` |
| Essays | `#33ffe8` | `#016c60` |
| Library | `#ffa424` | `#a15e00` |
| Projects | `#ff3838` | `#2e5100` |

**Bias category colors:** Speed `#e03d3d` · Memory `#af76ff` · Judgment `#4c9dff` · Context `#9ed841` · Perception `#f2ce57`

### Typography

| Role              | Font                   | Tailwind class               |
| ----------------- | ---------------------- | ---------------------------- |
| Headers / display | **Tamago** (pixel art) | `font-pixel tracking-widest` |
| Body              | **Rubik** (300–700)    | `font-rubik`                 |
| Code              | **Cascadia**           | `font-mono`                  |

### Recurring visual motifs

- Left/bottom border with `rounded-bl` on list items
- Hot-pink underline decoration on links (`decoration-primary`)
- WIP sections: red-border box + 🚧 badge using `border-error`
- Muted uppercase labels with `tracking-widest` before section titles

## Design Thinking for this project

Before generating any component:

1. **Aesthetic anchor** — stay within the retro-digital, dark-first direction. The pixel font + hot-pink is the identity. Don't dilute it.
2. **Component role** — is it informational, navigational, or interactive? Match the complexity of the implementation to the role.
3. **Motion** — one well-orchestrated entrance animation beats scattered micro-interactions. Use `animation-delay` for staggered reveals.
4. **Spatial composition** — generous negative space, asymmetry where appropriate, grid-breaking accents with the pink/purple.

## What NOT to do

- Don't import new fonts — use Tamago, Rubik, Cascadia (already loaded globally)
- Don't use generic color names like `gray-500` directly — map to CSS variables
- Don't create a `tailwind.config.js` — the project uses CSS variable-based theming
- Don't use `.tsx` for purely presentational components
- Don't add `console.log` or debug artifacts
