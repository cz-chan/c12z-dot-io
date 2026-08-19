# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Astro dev server
pnpm build        # Type-check (astro check) then build
pnpm preview      # Preview production build locally
```

No test or lint commands are configured.

**After every `pnpm build`, clean up the output** — the build is only ever run to type-check, never to keep its artifacts:

```bash
rm -rf dist && rm -rf .vercel/* && mkdir -p .vercel
```

`dist/` goes away entirely; `.vercel/` is emptied but the folder itself stays.

## Architecture

Personal blog/portfolio site built with **Astro 7** + **React 19** + **MDX**, deployed to Vercel (static output). **No Tailwind** — styling is plain CSS: design-token CSS variables in `src/styles/global.css` plus CSS Modules per component.

Longer-form docs live in `.docs/` (`start-here.md`, `paths/`, `lib/`, `pages/`).

### Key structural patterns

**Path-based organization** — `src/paths/<name>/` encapsulates all domain logic. Top-level paths: `404`, `behavior`, `books`, `context`, `essays`, `home`, `notes`, `projects`.

Each path holds:

- `components/` — Astro/React components specific to that path
- `seo/` — keywords and metadata for that path
- `lib/` — everything that isn't UI: static data, derivations/queries, and the types they share. One folder, not two — what changes together lives together.
- `icons/` — icons used only by this path
- `scripts/` — client-side JS loaded by the path's components (only where there is any)
- `styles/` — CSS Modules scoped to the path (some paths keep the module next to the component instead)

Something lives in the path that uses it. Once **2+ paths** need it, it graduates to `src/components/common/`, `src/global/`, or `src/lib/` — not before.

**Types follow the same rule — there is no `src/interfaces/` folder.** A type lives in the file that owns it: component props as `interface Props` inside the `.astro`/`.tsx` itself (never `Astro.props as X` — that silences errors), data shapes next to the data they describe. Only a type with 2+ consumers graduates to `src/lib/` (e.g. `PageKeywords` in `src/lib/keywords.ts`). Don't suffix names with `Interface`.

**Nested paths** — a path that owns child routes puts them in its own `paths/` folder, recursively. Today only `behavior` has them:

```
src/paths/behavior/
├── components/   ← behavior's own
├── seo/
├── lib/
└── paths/        ← child paths
    ├── biases/         → /behavior/sesgos
    ├── mental-models/  → /behavior/modelos-mentales
    ├── designs/        → /behavior/diseño
    └── sources/        → /behavior/fuentes
```

Folder names are plural when the path is a collection of items (`biases`, `essays`, `designs`, `books`, `notes`, `projects`, `sources`, `mental-models`) and singular when it's a single page or a domain (`behavior`, `home`, `context`, `404`).

**Content Collections** — `src/content/` holds markdown/MDX validated by Zod schemas in `src/content.config.ts`. Registered collections: `bias`, `library` (book reviews), `projects`, `notes`, `mentalModels`, `designLaws`. An `essay` collection is defined but commented out of the exports.

**Sources are frontmatter, not a collection** — posts embed a `sources` array (`sourceSchema`: title, type enum, author, url…) in their own frontmatter. Adding a source type takes TWO steps: the `z.enum` in `content.config.ts` AND `TYPE_LABELS` in `behavior/paths/sources/lib/source-types.ts` (build fails if you forget the second — intended). See `.docs/paths/sources.md`.

**Shared globals** — `src/global/`: `site-info.ts`, `header-links.ts`, `pages-info.ts`, `socialmedia-links.ts`.

**Common UI** — `src/components/common/`: `layout`, `navigation`, `seo`, `analytics`, `ui` (buttons, icons, toc…).

**OG images** — `src/lib/og/` renders social images with `@vercel/og` + `sharp` at build time.

### Path aliases (tsconfig.json)

Every path has its own `@<name>-path/*` alias — **always import through it**, never through a relative `../../` chain or a raw `src/paths/...` path. There is no generic `@/paths/*` alias on purpose: adding a path means adding its alias.

```
@biases-path/*        → src/paths/behavior/paths/biases/*
@mental-models-path/* → src/paths/behavior/paths/mental-models/*
@designs-path/*       → src/paths/behavior/paths/designs/*
@sources-path/*       → src/paths/behavior/paths/sources/*
@behavior-path/*      → src/paths/behavior/*
@projects-path/*      → src/paths/projects/*
@essays-path/*        → src/paths/essays/*
@books-path/*         → src/paths/books/*
@notes-path/*         → src/paths/notes/*
@context-path/*       → src/paths/context/*
@home-path/*          → src/paths/home/*
@error-path/*         → src/paths/404/*
```

Cross-cutting aliases:

```
@/*           → src/*
@/lib/*       → src/lib/*
@/global/*    → src/global/*
@/ui/*        → src/components/ui/*
@/common/*    → src/components/common/*
@/icons/*     → src/components/common/ui/icons/*
@/seo/*       → src/components/common/seo/*
@/analytics/* → src/components/common/analytics/*
@layouts/*    → src/layouts/*
@utils/*      → src/utils/*
@/assets/*    → src/assets/*
```

### Content collection schemas

- **library** — book reviews; covers, score, authors, Amazon links, `category` enum (`health`, `product`, `culture`, `psychology`, `economics`, `creativity`, `philosophy`, `other`)
- **bias** — cognitive biases; `category` enum: `velocidad`, `memoria`, `percepción`, `contexto`, `juicio`
- **projects**, **notes**, **mentalModels** — see `src/content.config.ts`
- `backlog: z.enum(["wip", "upload"])` gates unpublished entries

### Markdown pipeline

`astro.config.mjs` wires a custom `unified` processor: `remark-math` + `rehype-katex` (math via `$$`), `rehype-external-links` (`target="_blank"`, `noopener noreferrer`).

### Environment variables

See `.env.template` (validated via `envField` in `astro.config.mjs`):

- `GA4_MEASUREMENT_ID`, `GTM_MEASUREMENT_ID` (currently unused — cookie concerns)
- `AHRFS_MEASUREMENT_ID`
- `OVERTRACKING_MEASUREMENT_ID`

### Deployment

- Vercel adapter (`@astrojs/vercel`), static output mode
- `vercel.json` disables trailing slashes

## Design System

All design tokens live in `src/styles/global.css` as plain CSS variables on `:root` (dark, default — palette "burntpaper") and `[data-theme="light"]` (light — "recycledpaper"). Color notes in `src/styles/global.css.md`.

### Aesthetic direction

Dark-first, retro-digital, content-focused personal site. Lime accent on near-black backgrounds. Generous spacing, minimal chrome, no decorative fluff.

### Typography

| Role              | Font                         | Var          |
| ----------------- | ---------------------------- | ------------ |
| Display / headers | **Tamago** (pixel art)       | `--ff-pixel` |
| Body              | **Rubik** (300–700 + italic) | `--ff-rubik` |
| Code              | **Cascadia**                 | `--ff-mono`  |

Type scale (`--t-*`/`--lh-*`), tracking (`--tracking-*`), 4pt spacing (`--sp-*`), widths (`--wdth-*`), radii (`--r-*`), motion (`--ease`, `--t-fast/base/slow`) are all tokenized — use them, don't invent values. Note: `html` font-size is `--t-body` (14px), so `1rem` = 14px.

### Color tokens (see global.css for exact values)

- Surfaces: `--bg`, `--surface-1..3`, `--border`, `--border-2/3`
- Text: `--fg`, `--fg-2`, `--fg-3`, `--fg-inverse`
- Accents: `--accent` (lime `#a2ce12`), `--accent-ink`, `--accent-2` (purple `#904fe7`)
- Content sections: `--c-behavior`, `--c-bias`, `--c-mental-model`, `--c-source`, `--c-essay`, `--c-library`, `--c-project`, `--c-note`
- Bias categories: `--c-bias-category-{speed,memory,judgment,context,perception}`
- Book categories: `--c-book-{health,product,culture,psychology,economics,creativity,philosophy,other}`
- Utility: `--c-goback`, `--c-wip`, `--ok`, `--warn`, `--err`

### UI conventions when building new components

- Use existing CSS variables — never hardcode colors, sizes, or spacing
- Styles go in CSS Modules (`*.module.css`) next to the component or in the path's `styles/` folder
- React components (`.tsx`) only when interactivity is needed; prefer `.astro` otherwise
- Motion library (`motion/react`) is available for animations in React components
- Left/bottom borders as a recurring visual motif for list items
- WIP sections get a red-border box with a 🚧 badge (`--c-wip`)
