# c12z.io — architecture and project map

> Entry point to the documentation. Describes how the repo is organized and what
> each piece does, so a dev or an AI can get oriented without reading all the
> code first. `CLAUDE.md` / `AGENTS.md` hold the short version — the rules you
> must follow. This file holds the long version — the reasoning and the current
> state. For the OG images system see [`pages/og/og-images.md`](./pages/og/og-images.md);
> for the sources drawer,
> [`paths/sources.md`](./paths/sources.md); for the Zod schemas of the
> collections, [`content-config.md`](./content-config.md); for the `OwnThoughts`
> callout, [`components/mdx/own-thoughts.md`](./components/mdx/own-thoughts.md).

## 0. Where the agent files are

Everything an agent reads lives in `.agents/`: this documentation in
`.agents/docs/`, project skills in `.agents/skills/`. The only thing under
`.claude/` is a `skills → ../.agents/skills` symlink, because Claude Code
discovers project skills only at that path — never add a real file there.
`CLAUDE.md` and `AGENTS.md` stay at the repo root; they are read by name.

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
├── seo/          <Name>SEO.content.astro — SEO of that path's detail pages (§6)
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
graduates to `src/components/`, `src/global/` or `src/lib/` — not before.

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
├── components/        shared UI by role — see §6
├── content/           content entries (md/mdx), one folder per collection
├── content.config.ts  Zod schemas — see §5
├── paths/             one folder per domain — see §2 and §9
├── global/            site config — see §7
├── layouts/           MainLayout.astro, Layout404Error.astro
├── lib/               cross-cutting non-UI code (content-categories/, og/)
├── pages/             routes, and nothing else — see §4 and §8
├── styles/            global.css (tokens), typo.css, lettering.css
└── utils/             pluralize, validating-date
```

## 4. `src/pages/` only routes

A page file is `getStaticPaths()` + the SEO component + one component from the
path that owns the content. No markup and no data massaging — those live in
`paths/<name>/components/`.

Every page today is at or under ~30 lines. `_og-playground/` is a dev tool and is
exempt.

Each path pairs a listing component with a detail one:

| path            | listing             | detail              |
| --------------- | ------------------- | ------------------- |
| `books`         | `LibraryPage`       | `BookDetail`        |
| `projects`      | `ProjectPage`       | `ProjectDetail`     |
| `notes`         | `NotesPage`         | `NoteDetail`        |
| `biases`        | `BiasPage`          | `BiasDetail`        |
| `mental-models` | `MentalModelsPage`  | `MentalModelDetail` |
| `design-laws`   | `DesignLawsPage`    | `DesignLawDetail`   |
| `sources`       | `SourcesPage`       | `TopicPage`         |

`biases`, `mental-models` and `design-laws` are the same kind of post, so the
three detail components render through
`behavior/components/post/BehaviorPostLayout.astro`, which owns the shared markup
and stylesheet. A section only supplies what is its own: where "← Atrás" points,
and anything extra under the title — biases pass their category pill through the
`meta` slot. **Change the layout once, not three times.** The layout also
renders the "Detrás de este post" sources block (`PostSources`) for all three.

## 5. Content collections (`content.config.ts`)

**`content.config.ts` carries no comments on purpose** — every "why" behind the
schemas (the date guard, the categories, `sourceSchema`,
`behaviorContentBaseSchema`, the parked `essays` fields) lives in
[`content-config.md`](./content-config.md). Change a schema, change that doc.

`glob` loader over `**/*.{md,mdx}`. Six collections are exported:

| Collection     | Folder                          | Notes                                                                              |
| -------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `books`        | `content/books/{slug}/`         | reviews: cover, score 1-5, authors, category enum, quote, abstract                 |
| `projects`     | `content/projects/{slug}/`      | `projectUrl`, `why` (≤20 chars, meta on Home), optional `styleClass`               |
| `notes`        | `content/notes/{slug}/`         | timeline entries: `excerpt`, `category`, link-only `sources`, `illustration[]`     |
| `biases`       | `content/biases/{slug}/`        | `category`: speed / memory / perception / context / judgment                       |
| `mentalModels` | `content/mental-models/{slug}/` | `category` from fs.blog's provisional list                                         |
| `designLaws`   | `content/design-laws/{slug}/`   | `category`: visual-composition / interaction / perception                          |

Category values are English keys; the Spanish label shown in the UI sits next
to each enum in `src/lib/content-categories/`.

`essays` is **defined but left out** of the exports, kept for later. That is
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

**Dates are UTC end to end.** `parseDate` builds them with `Date.UTC`, so they
are read back with `getUTC*()` and formatted with `timeZone: "UTC"`. A local
getter on a UTC date is invisible from Madrid or Vercel (both at or east of UTC)
and shifts the day — or makes `isValidDateFormat` throw — on a machine west of
UTC. `TZ=America/New_York pnpm build` must pass.

**Markdown/MDX pipeline** (`astro.config.mjs`): `remark-math` + `rehype-katex`
(LaTeX via `$$`), and `rehype-external-links`, which rewrites every external link
to `target="_blank" rel="noopener noreferrer"` — the `mdx/link/Link.astro`
component is only for the visual style, the security behavior is automatic.

## 6. `src/components/` (shared UI)

Split by **role**, one level deep. No `common/` wrapper: this folder _is_ the
shared bucket, so the extra level said nothing.

```
components/
├── analytics/  GA4, GTMHead, GTMBody, Ahrefs, Overtracking — all via Partytown
├── layout/     Header, Footer, BottomBar
├── seo/        BaseHead, PagesSEO, ContentSEO, Error404SEO, Favicons
├── icons/      site-wide icons + social/
├── ui/         shared widgets: GoBackInTop, ToggleTheme, Toc + ProgressCircle
└── mdx/        dropped into a post by hand: Link, OwnThoughts, ImgAndCap, QuoteCard
```

Inside `layout/`, `ui/` and `mdx/`, **a component that owns more than one file
gets its own kebab-case folder**, the same way `paths/*/components/` groups
`card/`, `post/`, `wip/` and `summarize/`:

```
ui/
├── go-back-in-top/  GoBackInTop.astro + go-back-in-top.module.css
├── toc/             Toc.tsx + ProgressCircle.tsx + toc.module.css
└── toggle-theme/    ToggleTheme.astro + .module.css + toggle-theme.ts
```

`toc/` is why the rule exists: `ProgressCircle` is used only by `Toc` and shares
its stylesheet, so they are one component split across three files. Flat, they
read as three unrelated ones — and the CSS Modules sorted away from their
components anyway, because uppercase filenames sort before lowercase.

A single-file component stays flat: `mdx/QuoteCard.astro` has no stylesheet of
its own, so it needs no folder.

**A component needing client-side interactivity is `.tsx`, hydrated with
`client:load` — never `client:only`, which strips its CSS Module in production
(the full reason is in `CLAUDE.md`). Everything else is `.astro`.**

**`mdx/` exists to make a rule visible.** Those components have no importer in
any `.astro` file — the `.mdx` posts import them. Zero imports is their normal
state, not dead code. The same is true of the icons in `icons/` kept for manual
use (`Bulb`, `GoOut`, `Moon`, `Sun`). `OwnThoughts` documents its props
and its MDX usage in [`components/mdx/own-thoughts.md`](./components/mdx/own-thoughts.md).

**Shared means 2+ paths, and that is enforced.** Anything a single path uses
lives in that path, however generic it looks:

| what                                      | where                               | why                               |
| ----------------------------------------- | ----------------------------------- | --------------------------------- |
| summarize-with-AI block + its 6 LLM icons | `paths/books/components/summarize/` | only the book pages offer it      |
| `Barcode`, `Neuron`, `Prism`, `Pattern`   | `paths/behavior/icons/`             | only the behavior cards draw them |

### SEO: one component per kind of page

`components/seo/` holds the two building blocks, and every page uses exactly
one of them:

| Page                  | Component                                      | Fed by                                              |
| --------------------- | ---------------------------------------------- | --------------------------------------------------- |
| listing (`index`)     | `PagesSEO`                                     | `PAGES.<section>` in `src/global/pages-info.ts`     |
| detail (`[...id]`)    | `paths/<name>/seo/<Name>SEO.content.astro` → `ContentSEO` | the entry (or the topic, in sources)  |
| `/404`                | `Error404SEO`                                  | `SITE_404_CONFIG`                                   |

- **`PagesSEO` takes no keywords.** Pass `ogImage` from `PAGES` — omitted, it
  falls back to the generic `/og-image.webp`.
- **The per-path `<Name>SEO.content.astro`** receives the entry as a prop and
  builds everything `ContentSEO` needs: title, description, canonical, OG,
  ISO dates and `keywords` (a `string[]`, rendered as `article:tag`). The page
  only passes the entry through — `getStaticPaths()` runs in page files only, so
  a component can't fetch its own data that way.
- `BehaviorSEO` serves the three behavior sections; `SourcesSEO` builds a topic's
  keywords from its name and uses the static `PAGES.sources.ogImage`.
- `essays/seo/EssaySEO.content.astro` is an empty placeholder, like the rest of
  `essays` (§9).
- `BaseHead` (inside `MainLayout`) owns what every page shares, including the
  `robots` meta (`robotsIndex` / `robotsFollow` props, `index, follow` by
  default).

Nothing checks the *content* of the strings, so three rules: `og:image` is an
absolute URL (`new URL(path, Astro.site)`), dates go through
`convertDateToISO8601`, and OG images are `.webp`/`.png`/`.jpg` — never
`.avif`, which X, Facebook and LinkedIn don't render.

## 7. `src/global/` — site configuration

- **`site-info.ts`** — `SITE_VERSION`, `SITE_DEFAULT_CONFIG`, `SITE_404_CONFIG`
- **`pages-info.ts`** — `PAGES`, per-section SEO metadata with its OG images,
  validated at build time by a Zod schema (title ≤60, description 110-160)
- **`socialmedia-links.ts`** — `SOCIAL_LINKS`
- **`collection-keys.ts`** — `COLLECTION_KEYS`, guarded by
  `satisfies Record<CollectionKey, CollectionKey>`, so commenting a collection
  out of `content.config.ts` without updating this file fails the type-check

## 8. Routes (`src/pages/`)

| Route                                                                | What it is                                               |
| -------------------------------------------------------------------- | -------------------------------------------------------- |
| `/`                                                                  | Home — hero + latest items per collection                |
| `/biblioteca`, `/biblioteca/[...id]`                                 | books listing and detail                                 |
| `/proyectos`, `/proyectos/[...id]`                                   | projects listing and detail                              |
| `/behavior`                                                          | hub for the three behavior sections                      |
| `/behavior/sesgos`, `/behavior/modelos-mentales`, `/behavior/diseño` | listing + detail each                                    |
| `/behavior/fuentes`, `/behavior/fuentes/[...id]`                     | sources drawer — see `paths/sources.md`                  |
| `/notas`, `/notas/[...id]`                                           | notes timeline and detail                                |
| `/contexto`                                                          | about me, renders `paths/context/components/context.mdx` |
| `/ensayos`                                                           | static placeholder — feature inactive                    |
| `/404`                                                               | uses `Layout404Error` (no Header/Footer)                 |
| `/llms.txt`, `/robots.txt`                                           | text endpoints                                           |
| `/og/**/[...id].png`                                                 | OG images generated at build time                        |
| `/_og-playground`                                                    | dev tool; `_` keeps it out of the build                  |

OG routes follow the Spanish route names: `og/biblioteca`, `og/proyectos`,
`og/notas`, `og/behavior/sesgos`, `og/behavior/modelos-mentales`,
`og/behavior/diseño`. Sources topics have none — they share a static image.

## 9. Real status of each feature

| Feature                     | Status                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `home`, `books`, `projects` | complete and active                                                                      |
| `behavior` + its 4 children | complete and active                                                                      |
| `notes`                     | complete and active                                                                      |
| `context`                   | active, via direct MDX rather than a collection                                          |
| `essays`                    | **inactive**: collection left out of the exports, `/ensayos` a placeholder, its 3 components and `EssaySEO` empty files |
| `404`                       | active                                                                                   |

## 10. Design system

Tokens in `src/styles/global.css`, on `:root` (dark, default — "burntpaper") and
`[data-theme="light"]` ("recycledpaper"). The toggle swaps an attribute on
`<html>` plus `localStorage`, wrapped in `document.startViewTransition`.

- **Typography**: Tamago (pixel, headers) / Rubik (body) / Cascadia (mono)
- **Accent**: pink `--accent` (`#ff6e91`) is the identity; lime `--accent-2`
  (`#ccff33`) the sparing second voice
- **Per content type**: `--c-behavior`, `--c-bias`, `--c-mental-model`,
  `--c-design`, `--c-source`, `--c-essay`, `--c-library`, `--c-project`, `--c-note`
- **Per category**: bias categories and book categories have their own scales
- Recurring motif: left/bottom border on list items. WIP: red-bordered box with a
  🚧 badge (`--c-wip`)

`html` font-size is `--t-body` (14px), so `1rem` = 14px. Never hardcode a color,
size or spacing — the token exists. The full token inventory lives in the
`frontend-design` skill (`.agents/skills/frontend-design/`).

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

Cross-cutting, one per folder: `@/ui/*`, `@/icons/*`, `@/seo/*`, `@/mdx/*`,
`@/layout/*`, `@/analytics/*` (the six that collapse `src/components/`), plus
`@/lib/*`, `@/global/*`, `@/layouts/*`, `@/utils/*`, `@/assets/*`, `@/styles/*`.

**There is no `@/*` catch-all.** That is what enforces the rule: `@/components/...`
and `@/paths/...` don't resolve, so a skipped alias fails the type-check instead
of slipping through. A new top-level folder under `src/` needs its own alias.

**Always the most specific one, `.mdx` included.** The post files were the last
place still carrying `../../../components/...` chains.

## 12. Types

There is no `src/interfaces/` folder and no `*.interface.ts` file. A type lives
in the file that owns it: component props as `interface Props` inside the
`.astro`/`.tsx` (never `Astro.props as X` — that silences errors), data shapes
next to the data they describe. Only a type with 2+ consumers graduates to
`src/lib/`. Don't suffix names with `Interface`.

## 13. File naming

- `lib/`, `seo/`, CSS Modules → `kebab-case`
- Components (`.astro`, `.tsx`) → `PascalCase`
- A CSS Module is named after its component: `go-back-in-top.module.css`, not
  `gbit.module.css`. No abbreviations.

## 14. Libraries to reuse before adding a new one

- **`motion`** — animations in React components
- **`es-toolkit`** — lodash-style utilities (throttle in `Toc.tsx`)
- **`@vercel/og` + `sharp`** — the whole OG images pipeline
- **`@lucide/astro`** — icon set (used in `ProjectDetail`), alongside the custom
  SVGs in `components/icons/` and each path's `icons/`
- **`@astrojs/partytown`** — every analytics script loads through it

There is no fetching or state library: the site is 100% static.

## 15. Where to look

- **Add content** → an `.mdx` in the matching `src/content/` folder. Card, SEO and
  OG image work on their own once the Zod schema is met.
- **Change how a behavior post looks** → `behavior/components/post/`, once for
  all three sections.
- **SEO/meta** → `components/seo/` (shared) or `paths/<name>/seo/` — §6.
- **Dates** → `src/utils/validating-date.ts`, UTC only — §5.
- **OG images** → `src/lib/og/` + `src/pages/og/`, and read `og-images.md` first.
- **The sources drawer** → `paths/behavior/paths/sources/`, and `paths/sources.md`.
- **Theming/colors** → `src/styles/global.css`.
