# c12z.io — architecture and project map

> Entry point to the documentation. Describes how the repo is organized and what
> each piece does, so a dev or an AI can get oriented without reading all the
> code first. `CLAUDE.md` / `AGENTS.md` hold the short version — the rules you
> must follow. This file holds the long version — the reasoning and the current
> state. For the OG images system see [`pages/og/og-images.md`](./pages/og/og-images.md)
> and [`lib/og/og-render.md`](./lib/og/og-render.md); for the sources drawer,
> [`paths/sources.md`](./paths/sources.md).

## 1. What it is

Personal blog/portfolio of Chema Ferrandez. **Astro 7** + **React 19** (only for
interactive islands) + **MDX**, `output: "static"`, deployed on **Vercel**.

```bash
pnpm dev      # development server
pnpm build    # astro check (type-check) + astro build
pnpm preview  # serves the production build locally
```

**There is no Tailwind.** Styling is plain CSS: design tokens as CSS variables in
`src/styles/global.css`, plus one CSS Module per component.

No lint or tests are configured. `pnpm build` is the only quality gate — it fails
on type errors and on the Zod schemas of the collections. Clean up after it,
since the artifacts are never kept:

```bash
rm -rf dist && rm -rf .vercel/* && mkdir -p .vercel
```

**Before the first `pnpm dev`**: copy `.env.template` to `.env` and fill the 4
vars. They are `optional: false` in `astro.config.mjs`, so the server won't start
without them. Dummy values work locally.

## 2. Organizing principle: one folder per domain

Each content domain lives in `src/paths/<name>/`:

```
paths/<name>/
├── components/   Astro/React components for that path
├── seo/          keywords + SEO component for that content
├── lib/          everything that isn't UI: data, queries, and their types
├── icons/        icons only this path uses
└── scripts/      client-side JS, where there is any
```

There is **no `styles/` folder**: a CSS Module lives next to the component it
styles.

Top-level paths: `404`, `behavior`, `books`, `context`, `essays`, `home`,
`notes`, `projects`.

**Nested paths.** A path that owns child routes keeps them in its own `paths/`
folder, recursively — one rule at every level. Today only `behavior` has them:

```
src/paths/behavior/
├── components/
│   ├── card/     the card shared by the three sections
│   ├── post/     BehaviorPostLayout — the shared detail page
│   └── wip/
├── seo/
├── lib/
└── paths/
    ├── biases/        → /behavior/sesgos
    ├── mental-models/ → /behavior/modelos-mentales
    ├── design-laws/   → /behavior/diseño
    └── sources/       → /behavior/fuentes
```

**Naming.** Something lives in the path that uses it; once 2+ paths need it, it
graduates to `src/components/common/`, `src/global/` or `src/lib/` — not before.

A folder is named after **the item** it holds, in English, plural when it is a
collection (`biases`, `books`, `design-laws`, `mental-models`, `notes`,
`projects`, `sources`, `essays`) and singular when it is one page or a domain
(`behavior`, `home`, `context`, `404`).

**The item and the place can have different names, on purpose.** The `books`
collection holds books; the page that lists them is the Library, so it is
`LibraryPage` and lives at `/biblioteca`. Both names are right, each for its own
thing. Routes and user-facing copy are in Spanish; everything internal is in
English.

## 3. `src/` tree

```
src/
├── assets/            fonts (Tamago, Cascadia, Rubik), images
├── components/common/ cross-cutting UI — see §6
├── content/           content entries (md/mdx), one folder per collection
├── content.config.ts  Zod schemas — see §5
├── paths/             one folder per domain — see §2 and §9
├── global/            site config — see §7
├── layouts/           MainLayout.astro, Layout404Error.astro
├── lib/               cross-cutting non-UI code (keywords.ts, og/)
├── pages/             routes, and nothing else — see §4 and §8
├── styles/            global.css (tokens), typo.css, lettering.css
└── utils/             pluralize, process-keywords, validating-date
```

## 4. `src/pages/` only routes

A page file is `getStaticPaths()` + the SEO component + one component from the
path that owns the content. No markup and no data massaging — those live in
`paths/<name>/components/`.

Every page today is at or under ~30 lines. `_og-playground/` is a dev tool and is
exempt.

Each path pairs a listing component with a detail one:

| path       | listing       | detail           |
| ---------- | ------------- | ---------------- |
| `books`    | `LibraryPage` | `BookDetail`     |
| `projects` | `ProjectPage` | `ProjectDetail`  |
| `biases`   | `BiasPage`    | `BiasDetail`     |

`biases`, `mental-models` and `design-laws` are the same kind of post, so the
three detail components render through
`behavior/components/post/BehaviorPostLayout.astro`, which owns the shared markup
and stylesheet. A section only supplies what is its own: where "← Atrás" points,
and anything extra under the title — biases pass their category pill through the
`meta` slot. **Change the layout once, not three times.**

`notes` is the exception: its detail markup still lives in
`pages/notas/[...id].astro`, because the collection is empty and the move could
not be verified against rendered output.

## 5. Content collections (`content.config.ts`)

`glob` loader over `**/*.{md,mdx}`. Six collections are exported:

| Collection     | Folder                        | Notes                                                                        |
| -------------- | ----------------------------- | ---------------------------------------------------------------------------- |
| `books`        | `content/books/{slug}/`       | reviews: cover, score 1-5, authors, category enum, quote, abstract           |
| `projects`     | `content/projects/{slug}/`    | `projectUrl`, `why` (≤20 chars, meta on Home), optional `styleClass`         |
| `notes`        | `content/notes/{slug}/`       | folder exists but holds **0 entries** — the build warns and `/notas` renders empty |
| `biases`       | `content/biases/{slug}/`      | `category`: velocidad / memoria / percepción / contexto / juicio             |
| `mentalModels` | `content/mental-models/{slug}/` | `category` from fs.blog's provisional list                                 |
| `designLaws`   | `content/design-laws/{slug}/` | `category`: composición visual / interacción / percepción                    |

`essays` is **defined but commented out** of the exports, kept for later. That is
why `astro check` reports `'essayCollection' is declared but its value is never
read` — expected, not a bug.

**The three behavior collections share `behaviorContentBaseSchema`** (title,
englishTitle, question, contentCount, cover, dates, keywords, sources). Only
`category` is per collection, since each has its own enum.

`contentCount` must be unique **within its own collection** — the number feeds
the card code shown on each card (`DSG-001`), and `get-behavior-entries.ts`
throws at build time naming the two colliding entries. The three collections
number independently: biases 1..n, mental models 1..n, design laws 1..n.

`backlog: "wip" | "upload"` is the site-wide draft switch: it decides whether a
card is clickable or shown as not available yet.

Dates are `DD/MM/YYYY`, validated by `src/utils/validating-date.ts`. A post
cannot be edited before it was published — enforced with `.refine()` after the
object, since it needs two fields at once.

**Markdown/MDX pipeline** (`astro.config.mjs`): `remark-math` + `rehype-katex`
(LaTeX via `$$`), and `rehype-external-links`, which rewrites every external link
to `target="_blank" rel="noopener noreferrer"` — the `ui/content/Link.astro`
component is only for the visual style, the security behavior is automatic.

## 6. `src/components/common/` (cross-cutting)

```
common/
├── analytics/   Google (GA4, GTM), Ahrefs, Overtracking — all via Partytown
├── layout/      Header (Logo + ToggleTheme), Footer
├── navigation/  BottomBar.tsx (React) — scroll-to-top + go up one level
├── seo/         BaseHead, PagesSEO (listings), ContentSEO (entries), Favicons
└── ui/
    ├── buttons/   GoBackInTop, SummarizeLLMs
    ├── content/   ImgAndCap, Link, OwnThoughts, QuoteCard, SummarizeSection
    ├── darkmode/  ToggleTheme — data-theme + localStorage + startViewTransition
    ├── icons/     Logo, content icons, ai/ (LLM logos), social/
    └── toc/       Toc.tsx + ProgressCircle.tsx (motion/react)
```

**A component needing client-side interactivity is `.tsx` with `client:only`;
everything else is `.astro`.**

**Icons with no importer are not dead code.** `YingYang`, `Bulb`, `GoOut`,
`Moon`, `Sun`, `LensIcon` and `QuoteCard` are a library to drop into a post by
hand. Zero imports is their normal state.

## 7. `src/global/` — site configuration

- **`site-info.ts`** — `SITE_VERSION`, `SITE_DEFAULT_CONFIG`, `SITE_404_CONFIG`
- **`pages-info.ts`** — `PAGES`, per-section SEO metadata with its OG images,
  validated at build time by a Zod schema (title ≤60, description 110-160)
- **`socialmedia-links.ts`** — `SOCIAL_LINKS`
- **`collection-keys.ts`** — `COLLECTION_KEYS`, guarded by
  `satisfies Record<CollectionKey, CollectionKey>`, so commenting a collection
  out of `content.config.ts` without updating this file fails the type-check

## 8. Routes (`src/pages/`)

| Route                                                    | What it is                                        |
| -------------------------------------------------------- | ------------------------------------------------- |
| `/`                                                      | Home — hero + latest items per collection         |
| `/biblioteca`, `/biblioteca/[...id]`                     | books listing and detail                          |
| `/proyectos`, `/proyectos/[...id]`                       | projects listing and detail                       |
| `/behavior`                                              | hub for the three behavior sections               |
| `/behavior/sesgos`, `/behavior/modelos-mentales`, `/behavior/diseño` | listing + detail each         |
| `/behavior/fuentes`, `/behavior/fuentes/[...id]`         | sources drawer — see `paths/sources.md`           |
| `/notas`, `/notas/[...id]`                               | timeline — collection empty today                 |
| `/contexto`                                              | about me, renders `paths/context/components/context.mdx` |
| `/ensayos`                                               | static placeholder — feature inactive             |
| `/404`                                                   | uses `Layout404Error` (no Header/Footer)          |
| `/llms.txt`, `/robots.txt`                               | text endpoints                                    |
| `/og/**/[...id].png`                                     | OG images generated at build time                 |
| `/_og-playground`                                        | dev tool; `_` keeps it out of the build           |

OG routes follow the Spanish route names: `og/biblioteca`, `og/proyectos`,
`og/notas`, `og/behavior/sesgos`.

## 9. Real status of each feature

| Feature                     | Status                                                          |
| --------------------------- | --------------------------------------------------------------- |
| `home`, `books`, `projects` | complete and active                                             |
| `behavior` + its 4 children | complete and active                                             |
| `notes`                     | **code complete, no content**. Adding `.mdx` files is all it needs |
| `context`                   | active, via direct MDX rather than a collection                 |
| `essays`                    | **inactive**: collection commented out, `/ensayos` a placeholder, its 3 components empty |
| `404`                       | active                                                          |

## 10. Design system

Tokens in `src/styles/global.css`, on `:root` (dark, default — "burntpaper") and
`[data-theme="light"]` ("recycledpaper"). The toggle swaps an attribute on
`<html>` plus `localStorage`, wrapped in `document.startViewTransition`.

- **Typography**: Tamago (pixel, headers) / Rubik (body) / Cascadia (mono)
- **Accent**: lime `#a2ce12`, secondary purple `#904fe7`
- **Per content type**: `--c-behavior`, `--c-bias`, `--c-mental-model`,
  `--c-source`, `--c-essay`, `--c-library`, `--c-project`, `--c-note`
- **Per category**: bias categories and book categories have their own scales
- Recurring motif: left/bottom border on list items. WIP: red-bordered box with a
  🚧 badge (`--c-wip`)

`html` font-size is `--t-body` (14px), so `1rem` = 14px. Never hardcode a color,
size or spacing — the token exists.

## 11. Path aliases

One alias per path, always used — never a relative `../../` chain across folders,
never a raw `src/paths/...`. There is deliberately **no generic `@/paths/*`**:
creating a path means creating its alias, which keeps `tsconfig.json` an accurate
map of the site.

```
@biases-path/*        @mental-models-path/*  @design-laws-path/*
@sources-path/*       @behavior-path/*       @projects-path/*
@essays-path/*        @books-path/*          @notes-path/*
@context-path/*       @home-path/*           @error-path/*
```

Cross-cutting: `@/*`, `@/lib/*`, `@/global/*`, `@/common/*`, `@/icons/*`,
`@/seo/*`, `@/analytics/*`, `@layouts/*`, `@utils/*`, `@/assets/*`.

**Always the most specific one.** `@/icons/Logo.astro`, not
`@/common/ui/icons/Logo.astro`. A `@/components/...` or `@/paths/...` import
means an alias was skipped, or that one is missing.

## 12. Types

There is no `src/interfaces/` folder and no `*.interface.ts` file. A type lives
in the file that owns it: component props as `interface Props` inside the
`.astro`/`.tsx` (never `Astro.props as X` — that silences errors), data shapes
next to the data they describe. Only a type with 2+ consumers graduates to
`src/lib/`, like `PageKeywords` in `src/lib/keywords.ts`. Don't suffix names with
`Interface`.

## 13. File naming

- `lib/`, `seo/`, CSS Modules → `kebab-case`
- Components (`.astro`, `.tsx`) → `PascalCase`
- A CSS Module is named after its component: `go-back-in-top.module.css`, not
  `gbit.module.css`. No abbreviations.

## 14. Libraries to reuse before adding a new one

- **`motion`** — animations in React components
- **`es-toolkit`** — lodash-style utilities (throttle in `Toc.tsx`)
- **`@vercel/og` + `sharp`** — the whole OG images pipeline
- **`@lucide/astro`** — icon set, alongside the custom SVGs in `ui/icons/`
- **`@astrojs/partytown`** — every analytics script loads through it

There is no fetching or state library: the site is 100% static.

## 15. Where to look

- **Add content** → an `.mdx` in the matching `src/content/` folder. Card, SEO and
  OG image work on their own once the Zod schema is met.
- **Change how a behavior post looks** → `behavior/components/post/`, once for
  all three sections.
- **SEO/meta** → `components/common/seo/` (shared) or `paths/<name>/seo/`.
- **OG images** → `src/lib/og/` + `src/pages/og/`, and read `og-images.md` first.
- **The sources drawer** → `paths/behavior/paths/sources/`, and `paths/sources.md`.
- **Theming/colors** → `src/styles/global.css`.
