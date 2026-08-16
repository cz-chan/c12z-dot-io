# `sources` feature — the sources drawer

> How the **/behavior/fuentes** section works: where the data comes from,
> what each file does, why the CSS is written the way it is and what to
> touch to change each thing without breaking the rest.
>
> General context for the repo: [`start-here.md`](../start-here.md).
>
> The feature's files carry their own header explaining **what each one is
> and why it exists**. This document covers what doesn't fit in a file:
> how they fit together and what decisions lie behind them.

---

## 1. What it is and what it is NOT

The drawer shows **the sources you consult to write each bias and each
mental model**: books, videos, articles, quotes...

The most important design decision, and the one that explains everything
else:

> **`sources` has no content of its own.** There is no `sources`
> collection, nor a `src/content/sources/` folder. Sources live in the
> **frontmatter of the post itself** (the bias or the mental model), in a
> `sources` array. The feature only **reads and paints** them.

Why: if sources lived in their own collection you'd have two places to
keep in sync (the post and its sources) and duplicated content. This way,
writing a source is adding 4 lines to the `.mdx` you're already writing.

Practical consequence: **to add a source you don't touch anything in this
feature**, only the `.mdx` of the bias/model (§3).

---

## 2. The three views

| Route                             | What it shows                                                                                      | Root component      |
| --------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------- |
| `/behavior/fuentes`               | **One folder per topic** (a bias or a model). Dense grid + filter panel. Designed for ~140 topics. | `SourcesPage.astro` |
| `/behavior/fuentes/<slug>`        | The sources **of one topic**, each one a **sheet** with a folded corner, barely overlapping.       | `TopicPage.astro`   |
| `/behavior/modelos-mentales/<id>` | **"Behind this post"** block at the end of the post, with its sources stacked like folders.        | `PostSources.astro` |

All three share the same **viewer** (`SourceFiles.astro`: the enlarged
folder or sheet, with a slider).

The granularity of each view — important not to mix up:

- In the **drawer**, 1 folder = **1 topic** (with N sources inside).
- On the **topic page** and in **"Behind this post"**, 1 piece = **1 source**.

⚠️ **Real status of "Behind this post"**: it's active in
`src/pages/behavior/modelos-mentales/[...id].astro` and **commented out** in
`src/pages/behavior/sesgos/[...id].astro` (lines 20 and 79). If you want it
in biases too, just uncomment both: the component already returns `null`
when the post has no sources.

### Folder vs. sheet

The same piece (`.folder`) has two silhouettes, and the choice is
semantic, not decorative:

- **Folder** (tab at the top left) → when the piece **contains** things:
  a topic in the drawer, or the stack of sources of a post.
- **Sheet** (folded top-right corner, with ruled lines) → when you're
  already **inside** a folder: a topic's page. Inside a folder there are
  files, not more folders.

It's toggled with the `file` prop of `SourceStack` / `SourceFiles`, which
adds the classes `.file` / `.sheetFile`. They are **modifiers**: they only
override the silhouette (`--folder-clip`) and reposition the type label;
box, stack, hover and viewer are the same.

---

## 3. Where the data comes from

### 3.1 The schema (`src/content.config.ts`)

There's a shared `sourceSchema`, added as a `sources` field to the `bias`
and `mentalModels` collections:

```ts
const sourceSchema = z.object({
  title:   z.string().max(300),   // in a `cita`, the title IS the quoted fragment
  type:    z.enum(["libro","articulo","paper","video","podcast","charla","web","cita"]),
  author:  z.string().optional(),
  url:     z.string().optional(),
  date:    z.string().refine(isValidDateFormat).optional(),  // DD/MM/YYYY
  excerpt: z.string().max(300).optional(),
});

// inside biasCollection and mentalModelsCollection:
sources: z.array(sourceSchema).default([]),
```

`default([])` means a post **without** `sources` is valid: it doesn't
appear in the drawer and doesn't get the "Behind this post" block.

⚠️ `url` is `z.string()`, **not** `z.string().url()`: it isn't validated as
a well-formed URL. A `url: "foo"` passes the build and generates a broken
link. If it ever becomes annoying, that's the place to tighten it.

### 3.2 Adding a source = editing the post's `.mdx`

```yaml
# src/content/bias/anclaje.mdx
---
biasName: "Sesgo de anclaje"
backlog: "wip" # ← wip = "estudiando" in the drawer; upload = "publicado"
# ...rest of the bias frontmatter...
sources:
  - title: "Thinking, Fast and Slow"
    type: "libro"
    author: "Daniel Kahneman"
    url: "https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow"
    date: "02/06/2026"
    excerpt: "Capítulo 11 (Anchors): el experimento de la ruleta trucada."
  - title: "Any number that you are asked to consider… will induce an anchoring effect."
    type: "cita" # ← in a quote, the `title` is the quoted fragment
    author: "Daniel Kahneman"
---
```

⚠️ **`backlog` is what drives the state.** `wip` → the topic shows up as
`estudiando` (accent dot "●"); `upload` → `publicado` and the link to the
post appears. There is no separate `status` field.

### 3.3 Adding a new source type (e.g. `newsletter`)

You have to touch **two** places, in this order:

1. `src/content.config.ts` → add it to the `z.enum` of `sourceSchema`.
2. `src/paths/behavior/paths/sources/data/source-types.ts` → add its label to
   `TYPE_LABELS` (what you read on the folder's tab).

If you forget step 2, TypeScript fails on `pnpm build` (the `Record` stops
being exhaustive) — that's an intentional safety net, not a bug.

The filter buttons **don't** need touching: `TopicPage` computes the types
that actually exist in that topic and only paints those.

---

## 4. Feature tree

```
src/paths/behavior/paths/sources/
├── components/
│   ├── SourcesPage.astro        /behavior/fuentes — header + panel + topic grid
│   ├── TerminalSearch.astro       the filter panel styled like a terminal (<details>)
│   ├── TopicFolder.astro          1 folder = 1 TOPIC (the drawer one)
│   ├── TopicPage.astro            /behavior/fuentes/<slug> — header + toggles + stack
│   ├── SourceStack.astro          the STACK: 1 piece = 1 SOURCE (adaptive overlap)
│   ├── PostSources.astro          "Behind this post" block (wraps SourceStack)
│   ├── SourceFiles.astro         THE VIEWER: <dialog> with one sheet per source
│   ├── FolderDialogScript.astro   loads the viewer script (once per page)
│   └── sources.module.css       ALL of the feature's styling
├── scripts/                     the feature's only JS (~200 lines in total)
│   ├── folder-dialog.ts           open/close/navigate the viewer
│   ├── sources-filters.ts         search box + topic-type toggles (drawer)
│   └── topic-filters.ts           source-type toggles (topic page)
├── data/
│   ├── get-topics.ts            builds the "topics" by reading bias + mentalModels + designLaws
│   ├── source-types.ts          `Source` type + `TYPE_LABELS`
│   └── count-source-types.ts    the per-type tally of the topic header
└── seo/
    ├── SourcesSEO.content.astro static OG shared by all views
    └── sources.keywords.ts
```

Note: **there is no `styles/` folder** — the CSS Module lives next to the
components (`components/sources.module.css`), unlike what the general
convention in `start-here.md` suggests.

Routes that consume it:

```
src/pages/behavior/fuentes/
├── index.astro      → SourcesPage
└── [...id].astro    → TopicPage (getStaticPaths over getTopics())
```

Dates are NOT parsed here: `parseDate` in `src/utils/validating-date.ts` is
the only place that turns "DD/MM/YYYY" into a `Date`, and both `get-topics.ts`
and `behavior/paths/mental-models/components/MentalModelsPage.astro` sort with it.
`new Date()` must never be used on a frontmatter date — it reads them as
MM/DD/YYYY.

---

## 5. `get-topics.ts` — the single source of truth

A **Topic** is "a bias or a mental model that has sources". The
`getTopics()` function builds them and **both the grid and
`getStaticPaths`** use it — that's why the slug and the order always match.

```ts
interface Topic {
	id: string; // "sesgo-anclaje" — id of the <dialog> in the HTML
	slug: string; // "anclaje" — the URL /behavior/fuentes/anclaje
	kind: "sesgo" | "modelo";
	name: string; // biasName or modelName
	href?: string; // to the post, only if it's published
	state: "estudiando" | "publicado"; // derived from backlog (wip/upload)
	date: string;
	sources: Source[];
}
```

Three things it does that are worth knowing:

1. **Filters out** those without sources (`sources.length > 0`), so the
   drawer doesn't fill up with empty folders.
2. **Sorts**: first what's `estudiando` (the drawer is the work desk),
   then by descending date.
3. **Breaks slug ties**: if one day a bias and a model had the same id,
   the slug gets prefixed with the type (`modelo-anclaje`). Without this
   `getStaticPaths` would blow up the build with two identical routes.

**If you want to change the drawer's order, change it here** (the final
`.sort()`), not in the component.

---

## 6. How the viewer works (the enlarged folder)

It's a **native `<dialog>`**, no React and no client state.

- `SourceFiles.astro` paints **one `<dialog>` per folder** with **all**
  its sources inside: one `<div data-slide="i">` per source, all `hidden`
  except the first.
- `scripts/folder-dialog.ts` is the viewer script (~100 lines). It listens
  for clicks on `document` (delegation) and:
  - `[data-folder-open="<id>"]` → `dialog.showModal()` + shows the
    `data-index` sheet (the folder you clicked).
  - `[data-folder-next]` / `[data-folder-prev]` / arrows ← → → changes sheet.
  - Click on the backdrop or `Esc` → closes (`Esc` is free, `<dialog>`
    gives it to you).

Details that look like magic and aren't:

- **The `2 / 8` counter**, the **tab's type** and the **header's date** are
  recomputed in the `show()` function by reading the `data-*` of the active
  sheet (`data-type-label`, `data-date`). They aren't fixed in the HTML.
- **The navigation disappears** when only one sheet is left visible.
- **The slider respects the type filter**: when filtering, `topic-filters.ts`
  marks the discarded sheets with `data-off`, and the script only navigates
  through `[data-slide]:not([data-off])`. That's why the counter switches to
  `1 / 2` instead of `1 / 8`.
- The script is registered **only once** (flag
  `document.documentElement.dataset.foldersInit`) because the listener is
  on `document`, which survives the view transitions of Astro's router.
  If we re-registered it on `astro:page-load` it would run twice per
  click. The filter scripts do get re-registered on each
  `astro:page-load`, because their listeners hang off elements that the
  transition replaces — hence the `data-init` flag on their root.

⚠️ **Known loose end**: the script handles `[data-folder-close]`, but
**no component paints that button** (and the `.sheetClose` CSS class is
unused). Today the viewer is closed with `Esc` or with the backdrop. If you
want a visible close button, the JS and the CSS are already there, only the
markup in `SourceFiles.astro` is missing.

---

## 7. The CSS: the four tricks you have to understand

Everything is in `sources.module.css`. If you understand these four, you
can touch the rest without fear.

### 7.0 Heads-up first: here `1rem = 14px`

`global.css` sets `html { font-size: var(--t-body) }` = **0.875rem →
1rem = 14px**, not 16px. So `--folder-w: 10.5rem` is **147px** and
`--min-step: 5rem` is **70px**. If you do the math in your head with 16px
the numbers won't add up.

### 7.1 The folder silhouette = `clip-path` (defined only once)

The tab cut out at the top left isn't an image or a pseudo-element: it's a
polygon that clips the button. And it's declared **once** for the three
silhouettes (`.topicFolder`, `.folder`, `.sheetInner`), which only tune the
variables:

```css
.topicFolder,
.folder,
.sheetInner {
	--folder-clip: polygon(
		0 0,
		var(--tab-w) 0,
		calc(var(--tab-w) + var(--tab-slope)) var(--tab-h),
		100% var(--tab-h),
		100% 100%,
		0 100%
	);

	border-radius: var(--folder-r);
	clip-path: var(--folder-clip);

	/* progressive enhancement: where shape() exists, the top-right corner
	   is rounded with an arc instead of staying a sharp point */
	@supports (clip-path: shape(...)) {
		--folder-clip: shape(...);
	}
}
```

To change the tab's shape you touch `--tab-h` (height), `--tab-w` (width)
and `--tab-slope` (the diagonal) **in whichever class you want**: that's why
the viewer's big folder (`--tab-h: 4rem`) can have a much more generous tab
than the small ones (`1.125rem`).

And that's why `.file` / `.sheetFile` only need to **override `--folder-clip`**
to turn the folder into a sheet: they inherit everything else.

⚠️ **Critical consequence of `clip-path`: it clips EVERYTHING outside the
polygon, shadows included.** Hence two things:

- the edge separating one folder from the one underneath is a `border-left`
  (it goes _inside_ the box) and not a shadow;
- the hover shadow (`--folder-shadow`, a `drop-shadow`) is applied on the
  **containing `<li>`** (`.topicCell` / `.stackItem`), never on the button:
  there the clip would eat it. `drop-shadow` and not `box-shadow` because it
  follows the clipped silhouette instead of the rectangular box.

### 7.2 The stacking = columns narrower than the folder

The stack (`.stack`) is a **grid** whose columns measure the **step**
(`--step`), and the folders are **wider than their column**: each one
invades the next, and that's where the overlap comes from.

```css
.stack {
	--folder-w: 10.5rem; /* folder width */
	--min-step: 5rem; /* MAXIMUM overlap = minimum visible strip of each folder */
	--step: clamp(
		var(--min-step),
		calc((100% - var(--folder-w)) / (var(--n) - 1)),
		/* ← what fits */ calc(var(--folder-w) + var(--gap)) /* ← no overlap */
	);
	grid-template-columns: repeat(auto-fill, var(--step));
}
```

`--n` (how many sources there are) is injected by `SourceStack.astro` with a
`style="--n: 8"`, **with a minimum of 2** because the formula divides by
`--n - 1`. The `clamp` produces the three behaviors you see:

| Situation                                      | Resulting `--step`         | Looks like this                                                               |
| ---------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| Few sources / wide screen                      | high cap: `folder-w + gap` | whole and separated, **no overlap**                                           |
| They don't fit whole                           | the middle value           | they overlap **just enough** to fit in the row                                |
| They don't fit even overlapped (mobile + many) | low cap: `min-step`        | maximum overlap (the tab always peeks out) and **they wrap to the row below** |

**To make the pieces bigger/smaller → `--folder-w`. To make them stack more
→ lower `--min-step`.**

> Why grid and not negative margins? Because with a negative `margin-left`
> the first folder **of each row** dragged the overlap along and spilled out
> the left of the container. With columns, each row starts clean.

There are **three calibrations** of the same stack:

| Class         | Where                     | `--folder-w` / `--min-step` | Effect                                                           |
| ------------- | ------------------------- | --------------------------- | ---------------------------------------------------------------- |
| `.stack`      | "Behind this post"        | 10.5rem / 5rem              | landscape folders, heavily stacked                               |
| `.stackLoose` | topic page (prop `loose`) | — / 8.5rem                  | they barely overlap; with a mouse, the hovered one comes forward |
| `.stackFiles` | topic page (prop `file`)  | 8.5rem / 7rem               | vertical A4 sheets (`aspect-ratio: 210/297`)                     |

⚠️ The topic page uses **both** (`loose` **and** `file`), and both declare
`--min-step`. `.stackFiles` wins because it comes **later** in the file
(same specificity), so the real value there is **7rem over an 8.5rem
sheet**: an overlap of 1.5rem. If you reorder those two rules, you change
the topic page's overlap without touching a single number.

On mobile (`< 40rem`) both **remove the overlap entirely**
(`--min-step = --folder-w + --gap`) and switch to 2 columns filling the
screen, just like the drawer's grid (on tablet, `.stackFiles` goes to 3
columns: with the vertical A4, 2 came out huge).

### 7.2 bis — Why hover does NOT raise the z-index (except in `.stackLoose`)

`--step` isn't just aesthetics: **it's the uncovered strip of each folder,
i.e. its hover and click zone**. Hence a rule that looks
counterintuitive:

```css
.stackItem:has(.folder:hover) {
	transform: translateY(-0.5rem); /* it lifts… */
	/* …but carries NO z-index: the hovered folder doesn't come forward */
}
```

If the hovered folder jumped to the front (`z-index: 20`), it would cover
the next 2-3 (70px each) with its **full width** (147px). Result: moving
the mouse to the right, you jump from folder 1 to 4 and **there are folders
you can't reach**.

Two exceptions, and in both the reasoning holds:

- **`.stackLoose`** (topic page) **does** raise the z-index, but only
  under `@media (hover: hover)`: with an overlap of 1.5rem, the hovered
  piece covers very little of the next one and you can still reach them all.
- **The keyboard** (`:focus-visible`) does carry `z-index: 20` always:
  there's no cursor that can "skip" anything, and that way both the focus
  ring and the focused piece are fully visible.

### 7.3 The page's explicit width (the weird `<main>` bug)

```css
.topicPage {
	width: min(var(--screen-md), calc(100vw - 2 * var(--sp-3)));
}
```

This **isn't decorative, it's functional**, and it's the hardest trap to
spot in the whole feature. The global `<main>` (`src/styles/global.css`)
carries `margin-inline: auto`, and that makes it size itself **by its
content** (`fit-content`) instead of stretching to the screen width.
Without a fixed width on the page containing a stack:

- the stack (which is wide by nature) stretched the `<main>` and **the
  whole page spilled off the screen on mobile**;
- and the `100%` in the `--step` calculation (§7.2) had nothing to resolve
  against → the adaptive overlap didn't work (everything came out
  overlapped even when there was room to spare).

For the same reason there's `min-width: 0` in the chain of flex
containers: a flex item uses `min-width: auto` by default and refuses to
shrink below its content.

⚠️ **Today only `.topicPage` carries that `width`**; the `.sourcesPage`
class is applied in the HTML but **has no CSS rule at all**, so the drawer
just sticks to the `<main>` width. That works because its grid
(`.topicGrid`, `auto-fill` + `minmax(…, 1fr)`) does know how to shrink. **If
one day you put a stack (`SourceStack`) in the drawer, you'll have to give
it an explicit `width`** or the responsive layout will break again. The same
applies to `PostSources`: today it works because the post's container
already has a width of its own.

---

## 8. Filters and search

They are **two separate scripts**, one per view. Both work only with
`data-*` and `hidden`, **never by adding classes**: the classes of a CSS
Module are hashed at build time (`_folder_1h04g_344`), so from the JS you
can't write `classList.add("folder")` and expect it to work.

### 8.1 The drawer — `scripts/sources-filters.ts`

The controls are painted by `TerminalSearch.astro`, a `<details>` styled
like a terminal window (title bar with traffic lights, `[+]`/`[-]`, prompt
`›`, checkboxes `[ ]` / `[x]`). Collapsing it is pure HTML, no JS.

State of 2 fields (`{ query, kinds }`), applied to each `[data-topic]`:

- **search box** → compares against `data-name` (the lowercased name,
  precomputed in the HTML by `TopicFolder`).
- **TOPIC-type toggles** → compares against `data-kind` (`sesgo` /
  `modelo`).

The toggles are independent and **none enabled = everything passes**; that's
why there's no "all" button. If nothing is left visible, the
`[data-no-results]` message shows up.

⚠️ In the drawer **there's no filtering by source type** (book, quote...):
at that level a folder is a whole topic and holds sources of several types.
That filter lives inside the topic.

### 8.2 The topic page — `scripts/topic-filters.ts`

**Source-type** toggles, and only for the types that topic actually holds
(`TopicPage` computes them; with a single type it doesn't even paint the
bar). It does two things at once so the stack and the viewer don't
contradict each other:

1. hides the `[data-source-item]` that aren't of that type;
2. marks with `data-off` the viewer sheets that aren't of that type, so
   the slider skips them (§6).

---

## 9. Recipes: what to touch in order to…

| I want to…                               | File                                                         | What                                                                                |
| ---------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Add a source to a post                   | `src/content/{bias,mental-models}/<x>.mdx`                   | add an item to `sources:`                                                           |
| A new source type                        | `content.config.ts` + `data/source-types.ts`                 | the `z.enum` and `TYPE_LABELS` (both, §3.3)                                         |
| See "Behind this post" on biases         | `src/pages/behavior/sesgos/[...id].astro`                    | uncomment the import and the `<PostSources />`                                      |
| Change the size of the pieces            | `sources.module.css`                                         | `--folder-w` in `.stack`/`.stackFiles` (stack) / `minmax()` in `.topicGrid`         |
| Make them stack more or less             | `sources.module.css`                                         | `--min-step` in `.stack` / `.stackLoose` / `.stackFiles`                            |
| Change the tab's shape                   | `sources.module.css`                                         | `--tab-h`, `--tab-w`, `--tab-slope` of whichever class                              |
| Turn folders into sheets (or vice versa) | whoever uses `SourceStack`                                   | the `file` prop (and `loose` for the loose overlap)                                 |
| Change the drawer's order                | `data/get-topics.ts`                                         | the final `.sort()`                                                                 |
| Keep a post OUT of the drawer            | its `.mdx`                                                   | remove its `sources` array                                                          |
| Change what the closed piece shows       | `TopicFolder.astro` (drawer) / `SourceStack.astro` (sources) | the `<button>` markup                                                               |
| Change what the open piece shows         | `SourceFiles.astro`                                          | the `<div data-slide>` markup                                                       |
| Add a close button to the viewer         | `SourceFiles.astro`                                          | a `<button data-folder-close class={styles.sheetClose}>` (JS and CSS already exist) |
| Add a new filter to the drawer           | `TerminalSearch.astro` + `scripts/sources-filters.ts`        | a control + a `data-*` in `TopicFolder` + a branch in `apply()`                     |
| Change colors                            | `src/styles/global.css`                                      | the tokens (`--surface-*`, `--c-behavior`); **never hardcode a hex here**           |

---

## 10. Invariants (breaking these breaks the feature)

1. **The `<dialog>`'s `id` and the button's `data-folder-open` must
   match.** It's the only link between the piece and its viewer.
2. **The `id`s must be unique on the page.** That's why the drawer uses
   `sesgo-<id>` / `modelo-<id>` and not the bare id.
3. **Don't add a type to the enum without adding it to `TYPE_LABELS`** (§3.3).
4. **Don't replace the piece's `border-left` or the `<li>`'s `drop-shadow`
   with a `box-shadow`**: the `clip-path` eats them (§7.1).
5. **Don't put `z-index` on the `:hover` of `.stackItem`** (the closed
   stack): it covers the following ones and makes them unreachable with the
   mouse. In `.stackLoose` you can, but only under `@media (hover: hover)`
   (§7.2 bis).
6. **Don't remove the explicit `width` on `.topicPage`** nor the
   `min-width: 0`: the responsive layout and the adaptive overlap break
   (§7.3). Any page containing a `SourceStack` needs a width of its own.
7. **Don't manipulate classes from JS** (they're hashed): use `data-*` and
   `hidden` (§8).
8. **`folder-dialog.ts` is registered once and that's it** (flag
   `foldersInit`); the filter ones, once per `astro:page-load` (flag
   `data-init`). Changing that split duplicates listeners (§6).

---

## 11. How to check you haven't broken it

```bash
pnpm build   # fails if the frontmatter doesn't meet the schema or if TS doesn't add up
pnpm dev     # and eyeball it:
```

Quick checklist in the browser:

- **Drawer**: collapse and expand the terminal; search by name; enable
  "sesgos" (the models should disappear) and disable it (everything should
  come back).
- **Open a folder**: the counter should say `1 / N`; with the ← → arrows it
  should change sheet and go back to the first when reaching the end; the
  tab and the date should change with each sheet; `Esc` and clicking
  outside should close it.
- **Topic page**: filter by "cita" → only the quote sheets should remain
  **and** the viewer's counter should switch to `1 / <number of quotes>`.
- **Responsive**: at 320px and 390px **there must be no horizontal scroll**
  (that's the classic failure here, §7.3).
- **Topic page with few sources** (e.g. `pensamiento-inverso`, 3): on
  desktop they should look **whole and barely overlapped**; on mobile, 2
  columns without overlap.
