# c12z.io — architecture and project map

> Entry point to the documentation. Describes how the repo is organized
> and what each piece does, so a dev or an AI can get oriented without
> having to read all the code first. For the dynamic OG images system,
> see [`og-images.md`](./og-images.md) (dedicated, more detailed
> documentation).

## 1. What it is

Personal blog/portfolio of Chema Ferrandez. **Astro 7** + **React 19**
(only for interactive islands) + **TailwindCSS v4** + **MDX**, `output:
"static"`, deployed on **Vercel**.

```bash
pnpm dev      # development server
pnpm build    # astro check (type-check) + astro build
pnpm preview  # serves the production build locally
```

There is no lint or tests configured. `pnpm build` is the only quality
gate (it fails on type errors or on the Zod schemas of the collections).

**Before running `pnpm dev` for the first time**: copy `.env.template`
to `.env` and fill in the 4 vars (`GA4_MEASUREMENT_ID`, `GTM_MEASUREMENT_ID`,
`AHRFS_MEASUREMENT_ID`, `OVERTRACKING_MEASUREMENT_ID`). They're declared
as `optional: false` in the `env.schema` of `astro.config.mjs` — without
them the server won't even start. Dummy values work locally.

## 2. Organizing principle: feature-based

Each content domain lives in `src/paths/<name>/`, with this internal
shape (not every path has all 4 folders):

```
paths/<name>/
├── components/   Astro/React components for that path
├── seo/          keywords + SEO component specific to that content
├── data/ | rules/  business logic, static data, interfaces
└── styles/         CSS Modules if it needs its own styling
```

Top-level paths: `404`, `behavior`, `books`, `context`, `essays`, `home`,
`notes`, `projects`.

**Nested paths.** A path that owns child routes keeps them in its own
`paths/` folder, recursively — same folder name at every level, so there's
a single rule to remember. Today only `behavior` has children:

```
src/paths/behavior/
├── components/   ← behavior's own
├── seo/
├── data/
└── paths/        ← child paths
    ├── biases/         → /behavior/sesgos
    ├── mental-models/  → /behavior/modelos-mentales
    ├── designs/        → /behavior/diseño
    └── sources/        → /behavior/fuentes
```

**Naming**: plural when the path is a collection of items (`biases`,
`essays`, `designs`, `books`, `notes`, `projects`, `sources`,
`mental-models`); singular when it's a single page or a domain
(`behavior`, `home`, `context`, `404`).

Everything **cross-cutting** (not belonging to a single domain) lives
outside `paths/`: layouts, common UI/SEO/analytics components, global
site config, utils, shared interfaces.

## 3. `src/` tree

```
src/
├── assets/            fonts (Tamago, Cascadia, Rubik), images (404, OpenGraph, mii)
├── components/common/ see §6
├── content/            content entries (md/mdx), one folder per collection
├── content.config.ts   Zod schemas for the collections — see §5
├── paths/             one folder per route domain — see §2 and §9
├── global/               site config — see §7
├── interfaces/            TS types shared across paths
├── layouts/                MainLayout.astro, Layout404Error.astro
├── lib/og/                  OG image generation engine — see og-images.md
├── pages/                    routes — see §8
├── styles/                    global.css (design tokens), typo.css, lettering.css
└── utils/                      formatter, process-keywords, validating-date
```

## 4. Path aliases (`tsconfig.json`)

**One alias per path** — always import a path's files through its alias,
never with a relative `../../` chain. There is deliberately **no generic
`@/paths/*` alias**: creating a path means creating its alias, which keeps
the list in `tsconfig.json` an accurate map of the site.

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
@/common/*    → src/components/common/*
@/icons/*     → src/components/common/ui/icons/*
@/seo/*       → src/components/common/seo/*
@/analytics/* → src/components/common/analytics/*
@layouts/*    → src/layouts/*
@utils/*      → src/utils/*
@interfaces/* → src/interfaces/*
@/assets/*    → src/assets/*
```

`@/ui/*` is declared but points to `components/ui`, which doesn't exist —
don't use it.

## 5. Content collections (`content.config.ts`)

`glob` loader over `**/*.{md,mdx}`. **3** collections are exported:
`library`, `projects`, `bias`. `essay` is **defined but commented out**
(not exported) — see status in §9.

| Collection | Physical folder                                                                | Key fields                                                                                                                                                                                                                          | Real entries today                                                             |
| ---------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `library`  | `content/library/{slug}/`                                                      | `title`, `cover`, `abstract`, `backlog: "wip"\|"upload"`, `category` (health/product/culture/psychology/economics/creativity/philosophy/other), `score` (1-5), `authors`, `publishDate`/`lastTimeEdited` (`DD/MM/YYYY`), `keywords` | 4 (show-your-work, steal-like-an-artist, the-cold-start-problem, the-mom-test) |
| `projects` | `content/project/{slug}/` (⚠️ singular on disk, plural as the collection name) | `projectTitle`, `projectDescription`, `projectUrl`, `cover`, `why` (≤20 chars, used as meta on Home), `styleClass?`                                                                                                                 | 1 (la-vida-moderna-es)                                                         |
| `bias`     | `content/bias/{slug}/`                                                         | `biasName`, `biasQuestion`, `category[]` (velocidad/memoria/percepción/contexto/juicio), `relatedLinks?`                                                                                                                            | **0** — feature complete, no content yet                                       |

`backlog: "wip"` vs `"upload"` controls, across all cards, whether the
entry is clickable or shown as "not available yet" — it's the site's
general "publish as draft" mechanism.

Every collection with `publishDate`/`lastTimeEdited` validates the
`DD/MM/YYYY` format with `isValidDateFormat` (`src/utils/validating-date.ts`).

⚠️ In `library`, the optional `.transform` of `lastTimeEdited` receives `ctx`
as if it were the value of `publishDate` — smells like a copy-paste bug from
the `.refine` in `bias` (which does use `ctx` correctly). It doesn't affect
anything today because the field is optional and the 4 current entries don't
force that path, but review it before relying on that transform.

**Markdown/MDX pipeline** (`astro.config.mjs`): `remark-math` +
`rehype-katex` — you can write LaTeX in any `.mdx` and it renders as a
formula (KaTeX CSS loaded from a CDN in `BaseHead`). Every external link
in the content is automatically rewritten to
`target="_blank" rel="noopener noreferrer"` via `rehype-external-links`
— the `ui/content/Link.astro` component is only for the visual style,
it isn't needed for the security behavior.

## 6. `src/components/common/` (cross-cutting, not tied to a feature)

```
common/
├── analytics/   Google (GA4, GTM head/body), Ahrefs, Overtracking
│                → all load is:inline via Partytown, they don't block the main thread
├── layout/      Header (only Logo + ToggleTheme), Footer
│                headerMenus/ (NavbarDesktopMenu, NavbarMobileMenu, NavLinks)
│                ⚠️ headerMenus/* is dead code: Header.astro doesn't import them
├── navigation/  BottomBar.tsx (React, client:only) — scroll-to-top + "go up one level"
├── seo/         BaseHead (shared head, theme script, favicons, analytics),
│                PagesSEO (listings), ContentSEO (individual content),
│                Favicons, 404/Error404SEO
└── ui/
    ├── buttons/   GoBackInTop, SummarizeLLMs (opens ChatGPT/Claude/Grok/Perplexity
    │              with a prefilled prompt to summarize the page)
    ├── content/   ImgAndCap, Link (external), OwnThoughts (callout for MDX),
    │              QuoteCard, SummarizeSection (groups 4 SummarizeLLMs)
    ├── darkmode/  ToggleTheme (toggles data-theme + localStorage + startViewTransition)
    ├── icons/     Logo, content icons (Bulb, UnclearThought),
    │              ai/ (LLM logos), social/ (SocialBlock, SocialLink)
    │              ⚠️ Moon/Sun/YingYang/GoOut.astro: unused, dead code
    └── toc/       toc.tsx (React, floating table of contents with motion/react
                   + IntersectionObserver), progressCircle.tsx (progress circle)
                   ⚠️ old.TableOfContent.tsx: legacy version, unused — the 3 dynamic
                   pages already use toc.tsx
```

**Implicit rule**: if a component needs client-side interactivity
(scroll, state, animation), it's a `.tsx` React component with
`client:only="react"` or similar; everything else is `.astro`.

## 7. `src/global/` — site configuration

- **`site-info.ts`** — `SITE_VERSION`, `SITE_DEFAULT_CONFIG` (title,
  description, url, author, lang `es-ES`), `SITE_404_CONFIG`.
- **`header-links.ts`** — `HEADER_LINKS[]` (ensayos/biblioteca/behavior).
  ⚠️ uses Tailwind classes (`cz-neon-*`) that don't match the content CSS
  vars (`--c-essay`, `--c-library`, `--c-behavior`) in `global.css` —
  review if header navigation is picked up again.
- **`pages-info.ts`** — `PAGE_INFO_SCHEMA` (Zod, validates title 50-60
  chars and description 110-160 at build time) + `PAGES`, SEO metadata per
  section with its fixed OG images.
- **`socialmedia-links.ts`** — `SOCIAL_LINKS` (github, x, linkedin,
  substack, goodreads).

## 8. Routes (`src/pages/`)

| Route                                                       | What it is                                                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/`                                                         | Home — hero + `ShowSortContent` (latest 4 items of each published collection)                  |
| `/biblioteca`, `/biblioteca/[...id]`                        | listing and book detail page                                                                   |
| `/proyectos`, `/proyectos/[...id]`                          | listing and project detail page                                                                |
| `/behavior`, `/behavior/sesgos`, `/behavior/sesgos/[...id]` | listing and cognitive bias detail page                                                         |
| `/contexto`                                                 | "about me", renders `paths/context/context.mdx` directly                                       |
| `/ensayos`                                                  | static placeholder — `essay` feature inactive (§9)                                             |
| `/404`                                                      | uses `Layout404Error` (no Header/Footer/BottomBar)                                             |
| `/llms.txt`                                                 | plain text endpoint — describes the site for LLMs/AI crawlers                                  |
| `/robots.txt`                                               | generates `Sitemap:` pointing to `sitemap-index.xml`                                           |
| `/og/{biblioteca,proyectos,behavior/sesgos}/[...id].png`    | OG images generated at build time — see `og-images.md`                                         |
| `/_og-playground`                                           | dev tool for tuning the OG images layout; the `_` prefix excludes it from the production build |

The dynamic pages (`[...id].astro`) all follow the same pattern:
`getStaticPaths()` over the collection → layout + TOC (`toc.tsx`) +
the feature's `*SEO.content.astro` component.

## 9. Real status of each feature (important before touching code)

| Feature                  | Status                                                                                                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home`                   | complete and active                                                                                                                                                                                                                                                 |
| `books` (biblioteca)     | complete and active, 4 entries                                                                                                                                                                                                                                      |
| `projects`               | complete and active, 1 entry                                                                                                                                                                                                                                        |
| `biases` (behavior/sesgos) | **code complete, no content**. If you're going to add a bias, the feature already supports everything (card, SEO, dynamic OG); all that's missing is creating the `.mdx` in `content/bias/`                                                                         |
| `essays`                 | **ghost**: schema commented out in `content.config.ts`, no content folder, its 3 components (`EssayPage/Card/Header.astro`) are empty, `/ensayos` is a static placeholder. Before "fixing a bug" in essay, confirm whether the plan is to implement it from scratch |
| `context`                | active, but via direct MDX (`context.mdx`), not via a content collection — `Context.astro` is empty and unused                                                                                                                                                      |
| `404`                    | active                                                                                                                                                                                                                                                              |

Empty files / files with no consumers detected (don't assume they do
something if they show up in a `grep`): `PsychologyHeader.astro`,
`BiasTLDR.astro`, `BookAuthor.astro`, `Context.astro`, the 3 in `essays/`,
and `paths/projects/lib/projectsData.ts` (replaced by the `projects`
content collection, with a typo `PROJETCS_DATA` if it's ever touched again).

## 10. Design system

Tokens in `src/styles/global.css` under `@theme` (Tailwind v4 reads them
straight from there — **there's no `tailwind.config.js`**). Dark theme by
default, toggled with `[data-theme="light"]` via an attribute on `<html>` +
`localStorage`, with `document.startViewTransition` both for the toggle
and for page-to-page navigation.

- **Typography**: Tamago (pixel, `font-pixel`, headers) / Rubik (body)
  / Cascadia (mono, code).
- **Brand accent**: pink `#ff2f92` (dark) on dark backgrounds.
- **Color per content type**: each collection has its own dark/light pair
  (`--c-behavior`, `--c-essay`, `--c-library`, `--c-project`).
- **Color per category**: cognitive biases and books each have their own
  per-category color scale (see CLAUDE.md for the hex values).
- Recurring visual motif: left/bottom border (`rounded-bl`) on list
  items. WIP sections: box with a red border + 🚧 badge
  (`border-error`).

Don't hardcode new colors — always use the existing CSS vars.

## 11. `src/utils/` and `src/interfaces/`

- `formatter.ts` — `Formatter.formatDate()` / `.formatDateToISO()` (Intl `es-ES`).
- `process-keywords.ts` — normalizes and deduplicates keywords for SEO.
- `validating-date.ts` — validates/converts the `DD/MM/YYYY` dates used in the frontmatter.
- `interfaces/` — types shared across paths (`PageKeywords`,
  `SocialLinksInterface`, `SiteDefaultConfigInterface`, etc.); if a type
  is used from 2+ paths, it goes here instead of being duplicated.

## 12. Key libraries to reuse (before adding a new one)

- **`motion`** (Framer Motion v12) — animations in React components
  (`toc.tsx`, `progressCircle.tsx`).
- **`es-toolkit`** — lodash-style utilities (throttle in `toc.tsx`).
- **`@vercel/og` + `sharp`** — the whole OG images pipeline (§`og-images.md`).
- **`@lucide/astro`** — icon set (in addition to the custom SVGs in `ui/icons/`).
- **`@astrojs/partytown`** — all analytics load with `type="text/partytown"`,
  any new tracking script should follow the same pattern.

There's no fetching/state library (no React Query, Zustand, etc.) —
the site is 100% static, it isn't needed.

## 13. Where to look depending on the task

- **Add content** (book/project/bias) → create an `.mdx` in the folder of
  the matching collection under `src/content/`; everything else (card,
  SEO, OG image) already works on its own as long as the Zod schema is met.
- **Touch SEO/meta tags** → `components/common/seo/` (shared) or
  `paths/<name>/seo/` (specific to that path).
- **Touch OG images** → `src/lib/og/` + `src/pages/og/` — see
  `og-images.md` before changing anything, it has the reasoning behind
  each decision.
- **Touch the sources drawer** (`/behavior/fuentes`, the folders, the
  viewer) → `src/paths/behavior/paths/sources/` (alias `@sources-path`) —
  see [`paths/sources.md`](./paths/sources.md): it explains where the
  data comes from (it lives in the frontmatter of each bias/model, not in
  its own collection) and why the CSS is written the way it is.
- **Touch header navigation** → the code exists (`headerMenus/`) but it's
  disconnected; confirm with the user whether the goal is to reactivate it
  or whether `Header.astro` (only Logo+Toggle) is intentional before
  assuming it's a bug.
- **Touch theming/colors** → `src/styles/global.css`, the `@theme` section
  and `[data-theme="light"]`.
