# Dynamic OG images — implementation documentation

> This document describes **the system as it's actually built** and is the
> source of truth for it.

## 1. What it does and when it runs

For every entry in `books`, `projects`, `notes`, `biases`, `mentalModels` and
`designLaws`, Astro generates a 1200×630 PNG at **build time** (`pnpm build`),
served at `/og/{section}/{slug}.png`. That PNG is what `og:image` /
`twitter:image` point to in each detail page's `<head>`.

**Not everything is generated.** Listing pages and the sources topic pages use
static images from `public/og/pages/*.webp`, referenced from `PAGES` in
`src/global/pages-info.ts` (`public/og-image.webp` is the fallback). Static OG
images are `.webp`, never `.avif`: X, Facebook and LinkedIn don't render it.

There is no runtime generation, ever, in production: after the build,
those URLs are static files served by Vercel, just like any other image on
the site. See "Security" (§8) for why that matters.

## 2. File map

```
src/lib/og/                         ← all the logic (no URL of its own)
  og-assets.ts                      Reads fonts/background/logo once (bytes + data URI)
  og-templates.ts                   The 4 templates (A/B/C/D) + DEFAULT_LAYOUT
  load-cover.ts                     Loads book covers / project hero images
  render-og-image.ts                Satori → PNG → palette recompression

src/pages/og/                       ← the endpoints (these DO have a URL)
  biblioteca/[...id].png.ts                  Template C — `books`
  proyectos/[...id].png.ts                   Template D — `projects`
  notas/[...id].png.ts                       Template B — `notes` (subtitle: excerpt)
  behavior/sesgos/[...id].png.ts             Template B — `biases` (subtitle: question)
  behavior/modelos-mentales/[...id].png.ts   Template B — `mentalModels` (subtitle: question)
  behavior/diseño/[...id].png.ts             Template B — `designLaws` (subtitle: question)

src/pages/_og-playground/           ← dev-only tool (see §7)
  index.astro                       UI with sliders
  preview.png.ts                    Endpoint that accepts overrides via query params

src/assets/fonts/Tamago.ttf, CascadiaCode-Medium.ttf
src/assets/images/OpenGraph/og-templates/og-bg-template.png, og-logo-template.png
```

The `_` prefix on `_og-playground` makes Astro **ignore the folder**: no
route is generated, nothing is compiled for production. To re-enable the
playground, rename it to `og-playground` (drop the underscore).

## 3. The 4 templates

All four share the 1200×630 canvas, the same background
(`og-bg-template.png`), and the same two fonts (Tamago for titles/wordmark,
Cascadia Code Medium for secondary text).

| Template | Function                         | Collection | Uses cover/hero               | Subtitle            |
| -------- | -------------------------------- | ---------- | ----------------------------- | ------------------- |
| **A**    | `textOgTemplate` (no subtitle)   | —          | no                            | no                  |
| **B**    | `textOgTemplate` (with subtitle) | `biases`, `mentalModels`, `designLaws`, `notes` | no | yes (`question`; `excerpt` in notes) |
| **C**    | `coverOgTemplate`                | `books`    | yes, book cover on the left   | yes (author)        |
| **D**    | `heroOgTemplate`                 | `projects` | yes, centered hero/screenshot | no                  |

`textOgTemplate` covers both A and B with a single function: pass it a
`subtitle` and it adds that block; omit it and it's skipped. That's a
reuse decision, not two separate functions.

### Template A/B — anatomy

```
[logo] breadcrumb                     ← header, y=headerTop
Big title (Tamago)                    ← y=titleTop, width=titleWidth
Subtitle (Cascadia, if present)       ← right below
                    full/path         ← footer, bottom-right
```

### Template C — anatomy

```
[logo] c12z.io                        ← header (no breadcrumb, fixed)
┌────────┐  Title (Tamago)
│ COVER  │  Author (Cascadia)
└────────┘
                    full/path         ← footer
```

The cover is anchored by its **top edge** (`coverTop`), not centered
vertically inside its box — so a square cover (_Steal Like An Artist_) and
a tall one (_The Cold Start Problem_) both start at the same height. See
`loadCover()` in §4.

### Template D — anatomy

```
[logo] breadcrumb              full/path   ← header and URL, same band
       ┌──────────────┐
       │ hero/screenshot  │                ← horizontally centered, white border
       └──────────────┘
        Project title (Tamago, centered)
```

Here the full URL goes **top-right** (`heroUrlTop`), not at the bottom —
that's the only structural difference from the other templates, because
the hero + title already occupy the bottom band.

## 4. `DEFAULT_LAYOUT` — the single source of truth for measurements

Every coordinate/size used by the 4 templates lives in one object in
`og-templates.ts` (values as of this writing — the file wins if they differ):

```ts
export const DEFAULT_LAYOUT = {
	headerTop: 35,
	headerLeft: 40,
	headerGap: 25,
	logoSize: 68,
	headerFontSize: 40,
	titleTop: 180,
	titleLeft: 48,
	titleWidth: 1050,
	titleFontSize: 0,
	titleLineHeight: 1,
	subtitleMarginTop: 20,
	subtitleFontSize: 35,
	footerBottom: 44,
	footerRight: 48,
	footerFontSize: 27,
	coverTop: 150,
	coverLeft: 88,
	coverTextTop: 150,
	coverTextLeft: 420,
	coverTextWidth: 700,
	coverSubtitleMarginTop: 25,
	coverSubtitleFontSize: 35,
	heroTop: 135,
	heroWidth: 850,
	heroHeight: 360,
	heroBorderWidth: 2,
	heroTitleBottom: 40,
	heroTitleFontSize: 70,
	heroUrlTop: 60,
} as const;
```

Each template accepts an optional `layout?: Partial<OgLayout>` that gets
merged on top of the defaults:

```ts
const l: OgLayout = { ...DEFAULT_LAYOUT, ...layout };
```

In production nobody passes `layout` → defaults always run. The playground
(§7) is the only place that passes overrides, so you can preview changes
without touching code.

**`titleFontSize` / `heroTitleFontSize` set to `0` means "automatic"**: if
it's `0`, `autoTitleFontSize(title, isCoverLayout)` kicks in, shrinking the
font size based on text length to avoid a long title overflowing into a
3rd line. Setting a number > 0 disables that auto-adjustment.

**To change the design permanently**: edit the values in `DEFAULT_LAYOUT`
directly (by hand, or by pasting the snippet the playground generates —
see §7). No need to touch endpoints or template functions.

## 5. The render pipeline

```
node tree (ogTemplates)
        │
        ▼  renderOgImage()
   ImageResponse (@vercel/og) → Satori (layout+fonts) → resvg-wasm → RGBA PNG
        │
        ▼  sharp(...).png({ palette: true, quality: 90, compressionLevel: 9 })
   256-color palette PNG (~50% smaller, same format)
        │
        ▼
   Response with Content-Type: image/png
```

`renderOgImage()` is the only function that knows how to rasterize; every
endpoint and the playground go through it. See
`src/lib/og/render-og-image.ts`.

**Why palette PNG and not WebP**: these images are only ever fetched by
scraper bots (WhatsApp, LinkedIn, iMessage...), never by users browsing the
site — they don't affect Lighthouse or any page's weight. LinkedIn doesn't
guarantee rendering WebP previews; PNG/JPEG is universally supported.
Palette quantization achieves a similar (or better) size reduction without
that risk.

## 6. Loading content images (`load-cover.ts`)

Two public functions, one shared private helper (`loadCoverImage`):

- **`loadCover(entry: CollectionEntry<"books">)`** — for Template C.
  Returns the cover **already scaled** to fit inside a 260×420 box without
  cropping (`Math.min` of the two ratios, like `object-fit: contain`). The
  template anchors it by its top edge (§3).

- **`loadProjectHero(entry: CollectionEntry<"projects">)`** — for
  Template D. Returns the image's **natural** dimensions (unscaled);
  `heroOgTemplate` decides how to fit it into the `heroWidth`×`heroHeight`
  box, so those two values stay adjustable from the playground without
  touching the loader.

Both resolve the on-disk path of the frontmatter's `cover.src` field like
this:

1. **Normal path**: Astro's content layer adds a semi-internal `fsPath`
   property to `ImageMetadata` with the real absolute path on disk.
2. **Fallback**: if `fsPath` weren't present, the raw `index.mdx`
   (`entry.filePath`) is read and `cover.src` is extracted with a regex
   over the frontmatter, resolving the relative path against the post's
   folder.

Format: `.jpg`/`.jpeg`/`.png` files are embedded as-is (as a data URI); any
other format (`.webp`, `.avif`...) is converted **in memory** to PNG with
`sharp`, without creating new files in the repo or touching the originals.

### Where source images must live

**Always inside the content entry's own folder**, never in `src/assets/`
or anywhere else:

- Book covers → `src/content/books/{slug}/*.jpg|png|webp|avif`
- Project hero → `src/content/projects/{slug}/*.png|jpg|webp|avif`
  (e.g. `src/content/projects/la-vida-moderna-es/lavidamodernaes.avif`).

`.avif` is fine **here**: the loader converts it to PNG in memory, so it never
reaches a social network as-is.

No extra "registration" step needed: the post's frontmatter just needs to
point to that image via `cover.src` (the Zod schema in `content.config.ts`
already requires that field for both `books` and `projects`).
`getStaticPaths()` in the endpoint iterates the whole collection, so a new
project/book with its `cover` set generates its OG image automatically on
the next build — zero extra configuration.

## 7. The playground (`_og-playground`)

Dev-only tool for visually tuning `DEFAULT_LAYOUT` measurements instead of
editing code blind.

**How to enable it**: rename `src/pages/_og-playground/` →
`src/pages/og-playground/` (drop the underscore), run `pnpm dev`, open
`/og-playground`.

**How it works**:

- `index.astro` renders one slider per `DEFAULT_LAYOUT` measurement (the
  default values are injected via `define:vars`, so they can never drift
  out of sync with the real code) plus a template selector (A/B/C/D).
- Every change does a debounced (~200ms) `fetch` to
  `/og-playground/preview.png?titleTop=280&logoSize=120&...`, which calls
  `renderOgImage(...)` with those overrides and returns the real PNG.
- The "Changed values" panel shows a ready-to-copy snippet for
  `DEFAULT_LAYOUT` once you land on an adjustment you like.

**Why `prerender = false` on `preview.png.ts`**: Astro's prerendered
routes discard query params even in `pnpm dev` (verified empirically: two
requests with different params returned identical bytes). It needs to be
an on-demand route to read `url.searchParams`.

**Production guard**: even if left enabled (without the `_`), the handler
starts with:

```ts
if (import.meta.env.PROD) return new Response("Not found", { status: 404 });
```

so it never runs the render pipeline with external input on a real
deploy, even if someone forgets to remove it before merging. Still, the
recommended default is to keep it prefixed with `_` except while actively
tuning the design — that way the deploy stays 100% static (no serverless
function added to the build).

## 8. Security — summary

- The real endpoints (everything under `src/pages/og/`) are
  `prerender = true`: in production there's no
  code running, only static files. They don't accept external input
  (no query params, no body), so there's no injection or CPU-DoS surface.
- The only input to the entire pipeline is the repo's own content
  (frontmatter + images), controlled by the site's author.
- The playground is the only route with runtime logic, and only in dev
  (guarded by `import.meta.env.PROD` plus the convention of keeping it
  prefixed with `_` when not in use).

## 9. How to add a new template/collection (recipe)

1. If it needs its own measurements, add them to `DEFAULT_LAYOUT` in
   `og-templates.ts` (with a comment noting which template they belong to).
2. Write the `xxxOgTemplate(props)` function in `og-templates.ts`, reusing
   `header()`, `footer()`, `root()`, `autoTitleFontSize()`.
3. If it needs to load an image from the content, add/reuse a function in
   `load-cover.ts` (reuse `loadCoverImage` if applicable).
4. Create the endpoint at `src/pages/og/{section}/[...id].png.ts`:
   `prerender = true` + `getStaticPaths()` over the collection + a `GET`
   that assembles the template and calls `renderOgImage(...)`.
5. Point that section's SEO component's `ogImageSrc` to an **absolute** URL,
   since `ContentSEO` prints it as-is (pattern already used in `BooksSEO`,
   `ProjectsSEO`, `NotesSEO`, `BehaviorSEO`):

   ```ts
   const ogImageSrc = new URL(`/og/{section}/${id}.png`, Astro.site);
   ```
6. (Optional) add the template to the playground's selector so it can be
   tuned visually.

## 10. Known gaps

- There's no build cache keyed by content hash (evaluated and deliberately
  skipped: at the current content volume the saving is <1s per build; the
  pattern to add it if the site grows a lot has been discussed but isn't
  implemented).
