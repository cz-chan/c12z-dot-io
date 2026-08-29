# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

The standard Astro scripts are in `package.json` (`pnpm dev` / `build` /
`preview`); `pnpm build` type-checks with `astro check` first. No test or lint
commands are configured.

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

Everything an agent needs is under one folder — `.agents/docs/` for long-form
documentation and `.agents/skills/` for project skills. The only thing `.claude/`
holds is a `skills → ../.agents/skills` symlink, which exists because Claude Code
only discovers project skills at `.claude/skills/`. **Never add a real file under
`.claude/`** — write it in `.agents/` and let the link do the work. `CLAUDE.md`
and `AGENTS.md` stay at the repo root: they are read by name, not by folder.

## Architecture

**No Tailwind** — styling is plain CSS: design-token CSS variables in `src/styles/global.css` plus CSS Modules per component.

Longer-form docs live in `.agents/docs/` (`start-here.md`, `paths/`, `lib/`, `pages/`).

### Key structural patterns

**Path-based organization** — `src/paths/<name>/` encapsulates all domain logic.

Each path holds:

- `components/` — Astro/React components specific to that path
- `seo/` — keywords and metadata for that path
- `lib/` — everything that isn't UI: static data, derivations/queries, and the types they share. One folder, not two — what changes together lives together.
- `icons/` — icons used only by this path
- `scripts/` — client-side JS loaded by the path's components (only where there is any)

There is no `styles/` folder: a CSS Module lives next to the component it styles.

Something lives in the path that uses it. Once **2+ paths** need it, it graduates to `src/components/common/`, `src/global/`, or `src/lib/` — not before.

**Types follow the same rule — there is no `src/interfaces/` folder.** A type lives in the file that owns it: component props as `interface Props` inside the `.astro`/`.tsx` itself (never `Astro.props as X` — that silences errors), data shapes next to the data they describe. Only a type with 2+ consumers graduates to `src/lib/` (e.g. `PageKeywords` in `src/lib/keywords.ts`). Don't suffix names with `Interface`.

**Nested paths** — a path that owns child routes puts them in its own `paths/` folder, recursively. Today only `behavior` has them (`biases`, `mental-models`, `design-laws`, `sources`).

Folder names are plural when the path is a collection of items (`biases`, `essays`, `design-laws`, `books`, `notes`, `projects`, `sources`, `mental-models`) and singular when it's a single page or a domain (`behavior`, `home`, `context`, `404`).

**Content Collections** — `src/content/` holds markdown/MDX validated by Zod schemas in `src/content.config.ts`. An `essays` collection is defined but left out of the exports. **`content.config.ts` carries no comments** — the reasoning behind every schema lives in `.agents/docs/content-config.md`; change a schema, change that doc.

A collection is named after **the item** it holds, never after the page that shows it — `books`, not `library`. The page keeps the other name: the `books` collection is rendered by `LibraryPage` at `/biblioteca`.

**Sources are frontmatter, not a collection** — posts embed a `sources` array (`sourceSchema`: title, type enum, author, url…) in their own frontmatter. Adding a source type takes TWO steps, both in `src/lib/content-categories/sources.categories.ts`: `SOURCE_CATEGORIES` AND its label in `SOURCES_CATEGORY_LABELS` (build fails if you forget the second — intended). See `.agents/docs/paths/sources.md`.

**Shared UI** — `src/components/` is split by role, one level deep: `layout/`, `seo/`, `analytics/`, `icons/`, `ui/`, `mdx/`.

**Inside `layout/`, `ui/` and `mdx/`, a component owning more than one file gets
its own kebab-case folder** — the same rule `paths/*/components/` already follows
with `card/`, `post/`, `wip/` and `summarize/`. `ui/toc/` is the point of the
rule: `ProgressCircle` is used only by `Toc` and shares its stylesheet, so they
are one component in three files, not three loose ones. A single-file component
stays flat (`mdx/QuoteCard.astro`).

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

### Path aliases

Every path has its own `@<name>-path/*` alias — **always import through it**, never through a relative `../../` chain or a raw `src/paths/...` path. There is no generic `@/paths/*` alias on purpose: adding a path means adding its alias. The full table lives in `tsconfig.json` under `compilerOptions.paths`.

**There is no `@/*` catch-all either.** Every alias is declared explicitly, in
three groups: the `@<name>-path/*` domains, the six that collapse
`src/components/` (`@/ui`, `@/icons`, `@/seo`, `@/mdx`, `@/layout`,
`@/analytics`), and the rest of `src/` (`@/lib`, `@/global`, `@/layouts`,
`@/utils`, `@/assets`, `@/styles`). Dropping the catch-all is what makes the
previous rule enforced rather than merely documented: `@/paths/...` and
`@/components/...` no longer resolve, so TypeScript fails the build instead of
quietly letting the shortcut through. Adding a top-level folder under `src/`
means adding its alias.

**Always import through an alias**, in `.mdx` files too — they were the last
place still carrying `../../../components/...` chains.

**Shared means 2+ paths, and it is enforced.** Something used by a single path
belongs in that path, even if it feels generic: the summarize-with-AI block lives
in `paths/books/`, and `Barcode`/`Neuron`/`Prism`/`Pattern` in
`paths/behavior/icons/`, because nothing else uses them.

### Content collection schemas

The schemas themselves are in `src/content.config.ts`, their reasoning in
`.agents/docs/content-config.md`. What neither file makes obvious:

- `biases`, `mentalModels` and `designLaws` share `behaviorContentBaseSchema`. Each needs a `contentCount` unique **within its own collection** — the number feeds the card code (`DSG-001`), and `get-behavior-entries.ts` throws at build time on a duplicate. The three collections number independently.
- `backlog: z.enum(["wip", "upload"])` gates unpublished entries

### Markdown pipeline

`astro.config.mjs` wires a custom `unified` processor — write math with `$$`
(`remark-math` + `rehype-katex`); external links get `target="_blank"` and
`noopener noreferrer` automatically, so don't add them by hand.

### Environment variables

See `.env.template` (validated via `envField` in `astro.config.mjs`).
`GA4_MEASUREMENT_ID` and `GTM_MEASUREMENT_ID` are deliberately unused — cookie
concerns.

## Design System

Dark-first, retro-digital, content-focused personal site. Lime accent on near-black backgrounds. Generous spacing, minimal chrome, no decorative fluff.

All design tokens live in `src/styles/global.css` as plain CSS variables on `:root` (dark, default — palette "burntpaper") and `[data-theme="light"]` (light — "recycledpaper"). **That file is the source of truth.** The full token inventory and how to build with it live in the `frontend-design` skill (`.agents/skills/frontend-design/`) — invoke it when building or reshaping UI.

### UI conventions when building new components

- Use existing CSS variables — never hardcode colors, sizes, or spacing
- Styles go in a CSS Module (`*.module.css`) next to the component it styles
- React components (`.tsx`) only when interactivity is needed; prefer `.astro` otherwise
- Motion library (`motion/react`) is available for animations in React components
- Left/bottom borders as a recurring visual motif for list items
- WIP sections get a red-border box with a 🚧 badge (`--c-wip`)
