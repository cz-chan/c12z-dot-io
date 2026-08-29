# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## This file and AGENTS.md are the same file

`CLAUDE.md` and `AGENTS.md` must stay byte-identical **except for their first
three lines** (the `#` heading and the sentence naming the audience). Everything
from `## Commands` onwards is shared content.

**Editing one without the other is a bug.** Whenever you change either file,
apply the exact same change to the other in the same commit, then verify:

```bash
diff <(tail -n +4 CLAUDE.md) <(tail -n +4 AGENTS.md) && echo "in sync"
```

That command must print `in sync` before you commit. If they have already
drifted, reconcile them first — do not layer a new edit on top of a divergence.

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

**Never leave a server you started still running.** `pnpm dev` and `pnpm preview`
both bind port 4321. If you start one to check something, stop it when you are
done — before reporting back, not later. A stray server holds the port, so the
next run silently attaches to a stale build and you end up verifying yesterday's
code.

```bash
pnpm exec astro dev stop          # for pnpm dev
lsof -nP -iTCP:4321 -sTCP:LISTEN  # confirm nothing is left listening
```

`astro dev stop` only knows about the dev server. `pnpm preview` runs as
`node .../astro.mjs preview`, so it survives a `pkill -f "astro preview"` — kill
it by the PID that `lsof` reports, then check the port again. Whoever started
the server closes it; leave the port as you found it.

## Agent files live in `.agents/`

Everything an agent needs is under one folder — there is no `.claude/` content
of its own:

```
.agents/
├── docs/     long-form documentation (start-here.md, paths/, lib/, pages/)
└── skills/   project skills (frontend-design)
.claude/
└── skills → ../.agents/skills   symlink, the only thing .claude/ holds
```

The symlink exists because Claude Code only discovers project skills at
`.claude/skills/`. **Never add a real file under `.claude/`** — write it in
`.agents/` and let the link do the work. `CLAUDE.md` and `AGENTS.md` stay at the
repo root: they are read by name, not by folder.

## Architecture

Personal blog/portfolio site built with **Astro 7** + **React 19** + **MDX**, deployed to Vercel (static output). **No Tailwind** — styling is plain CSS: design-token CSS variables in `src/styles/global.css` plus CSS Modules per component.

Longer-form docs live in `.agents/docs/` (`start-here.md`, `paths/`, `lib/`, `pages/`).

### Key structural patterns

**Path-based organization** — `src/paths/<name>/` encapsulates all domain logic. Top-level paths: `404`, `behavior`, `books`, `context`, `essays`, `home`, `notes`, `projects`.

Each path holds:

- `components/` — Astro/React components specific to that path
- `seo/` — keywords and metadata for that path
- `lib/` — everything that isn't UI: static data, derivations/queries, and the types they share. One folder, not two — what changes together lives together.
- `icons/` — icons used only by this path
- `scripts/` — client-side JS loaded by the path's components (only where there is any)

There is no `styles/` folder: a CSS Module lives next to the component it styles.

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
    ├── design-laws/    → /behavior/diseño
    └── sources/        → /behavior/fuentes
```

Folder names are plural when the path is a collection of items (`biases`, `essays`, `design-laws`, `books`, `notes`, `projects`, `sources`, `mental-models`) and singular when it's a single page or a domain (`behavior`, `home`, `context`, `404`).

**Content Collections** — `src/content/` holds markdown/MDX validated by Zod schemas in `src/content.config.ts`. Registered collections: `biases`, `books` (book reviews), `projects`, `notes`, `mentalModels`, `designLaws`. An `essays` collection is defined but left out of the exports. **`content.config.ts` carries no comments** — the reasoning behind every schema lives in `.agents/docs/content-config.md`; change a schema, change that doc.

A collection is named after **the item** it holds, never after the page that shows it — `books`, not `library`. The page keeps the other name: the `books` collection is rendered by `LibraryPage` at `/biblioteca`.

**Sources are frontmatter, not a collection** — posts embed a `sources` array (`sourceSchema`: title, type enum, author, url…) in their own frontmatter. Adding a source type takes TWO steps, both in `src/lib/content-categories/sources.categories.ts`: `SOURCE_CATEGORIES` AND its label in `SOURCES_CATEGORY_LABELS` (build fails if you forget the second — intended). See `.agents/docs/paths/sources.md`.

**Shared globals** — `src/global/`: `site-info.ts`, `pages-info.ts`, `socialmedia-links.ts`, `collection-keys.ts`.

**Shared UI** — `src/components/`, split by role, one level deep:

- `layout/` — Header, Footer, BottomBar
- `seo/` — BaseHead, PagesSEO, ContentSEO, Error404SEO, Favicons
- `analytics/` — GA4, GTM, Ahrefs, Overtracking
- `icons/` — site-wide icons + `social/`
- `ui/` — shared widgets: GoBackInTop, ToggleTheme, Toc
- `mdx/` — components you drop into a post by hand: Link, OwnThoughts, ImgAndCap, QuoteCard

**Inside `layout/`, `ui/` and `mdx/`, a component owning more than one file gets
its own kebab-case folder** — the same rule `paths/*/components/` already follows
with `card/`, `post/`, `wip/` and `summarize/`:

```
ui/toc/            Toc.tsx + ProgressCircle.tsx + toc.module.css
ui/toggle-theme/   ToggleTheme.astro + .module.css + toggle-theme.ts
```

`ui/toc/` is the point of the rule: `ProgressCircle` is used only by `Toc` and
shares its stylesheet, so they are one component in three files, not three loose
ones. A single-file component stays flat (`mdx/QuoteCard.astro`).

`mdx/` is why those have no importer in `.astro` files: the `.mdx` import them.
That is their normal state, not dead code.

**OG images** — `src/lib/og/` renders social images with `@vercel/og` + `sharp` at build time.

**Icons with no importer are not dead code.** `YingYang`, `Bulb`, `GoOut`,
`Moon`, `Sun` and `LensIcon` are a library to drop into a post by hand, so having
zero imports is their normal state. Don't delete them as unused. The same goes
for everything in `components/mdx/`.

### `src/pages/` only routes

A page file is `getStaticPaths()` plus the SEO component plus one component from
the path that owns the content. No markup, no data massaging — those belong in
`paths/<name>/components/`. Every page today is at or under ~30 lines, and new
ones should stay there (`_og-playground/` is a dev tool and is exempt).

Each path pairs a listing component with a detail one: `LibraryPage` +
`BookDetail`, `ProjectPage` + `ProjectDetail`, `BiasPage` + `BiasDetail`.

Biases, mental models and design laws are the same kind of post, so their detail
pages all render through `behavior/components/post/BehaviorPostLayout.astro`,
which owns the shared markup and stylesheet. A section only adds what is its
own — biases pass their category pill through the `meta` slot. Change the layout
once, not three times.

### File naming

- `lib/`, `seo/` and CSS Modules: `kebab-case.ts` / `kebab-case.module.css`
- Components (`.astro`, `.tsx`): `PascalCase`
- A CSS Module is named after the component it styles — `go-back-in-top.module.css`,
  not `gbit.module.css`. No abbreviations.

### Path aliases (tsconfig.json)

Every path has its own `@<name>-path/*` alias — **always import through it**, never through a relative `../../` chain or a raw `src/paths/...` path. There is no generic `@/paths/*` alias on purpose: adding a path means adding its alias.

```
@biases-path/*        → src/paths/behavior/paths/biases/*
@mental-models-path/* → src/paths/behavior/paths/mental-models/*
@design-laws-path/*   → src/paths/behavior/paths/design-laws/*
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
@/icons/*     → src/components/icons/*
@/seo/*       → src/components/seo/*
@/mdx/*       → src/components/mdx/*
@/layout/*    → src/components/layout/*
@/analytics/* → src/components/analytics/*
@layouts/*    → src/layouts/*
@utils/*      → src/utils/*
@/assets/*    → src/assets/*
```

**Always import through an alias**, in `.mdx` files too — they were the last
place still carrying `../../../components/...` chains. A `@/components/...` or
`@/paths/...` import means an alias was skipped, or that one is missing.

**Shared means 2+ paths, and it is enforced.** Something used by a single path
belongs in that path, even if it feels generic: the summarize-with-AI block lives
in `paths/books/`, and `Barcode`/`Neuron`/`Prism`/`Pattern` in
`paths/behavior/icons/`, because nothing else uses them.

### Content collection schemas

- **books** — book reviews; covers, score, authors, Amazon links, `category` enum: `SHARED_CATEGORIES` in `src/lib/content-categories/`
- **biases** — cognitive biases; `category` enum: `velocidad`, `memoria`, `percepción`, `contexto`, `juicio`
- **projects**, **notes**, **mentalModels**, **designLaws** — see `src/content.config.ts`
- `biases`, `mentalModels` and `designLaws` share `behaviorContentBaseSchema`. Each needs a `contentCount` unique **within its own collection** — the number feeds the card code (`DSG-001`), and `get-behavior-entries.ts` throws at build time on a duplicate. The three collections number independently.
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

All design tokens live in `src/styles/global.css` as plain CSS variables on `:root` (dark, default — palette "burntpaper") and `[data-theme="light"]` (light — "recycledpaper").

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
- Content categories (books + notes): `--c-category-{health,product,culture,psychology,economics,creativity,philosophy,business}` + notes-only `{random,relationship,society,sport}`
- Utility: `--c-goback`, `--c-wip`, `--ok`, `--warn`, `--err`

### UI conventions when building new components

- Use existing CSS variables — never hardcode colors, sizes, or spacing
- Styles go in a CSS Module (`*.module.css`) next to the component it styles
- React components (`.tsx`) only when interactivity is needed; prefer `.astro` otherwise
- Motion library (`motion/react`) is available for animations in React components
- Left/bottom borders as a recurring visual motif for list items
- WIP sections get a red-border box with a 🚧 badge (`--c-wip`)
