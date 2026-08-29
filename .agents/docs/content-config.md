# `src/content.config.ts` — the Zod schemas of the collections

> The file itself is kept comment-free on purpose: it is a schema declaration,
> and every "why" behind it lives here. If you change a schema, change this doc
> in the same commit. Short version of the rules is in `CLAUDE.md` / `AGENTS.md`
> §Content collection schemas; the map of the repo is
> [`start-here.md`](./start-here.md) §5. For the sources drawer that reads
> `sourceSchema`, see [`paths/sources.md`](./paths/sources.md).

## 1. Shared helpers

### `dateField`

```ts
const dateField = z.string().refine(isValidDateFormat);
```

Dates are `DD/MM/YYYY`. `isValidDateFormat` (`src/utils/validating-date.ts`)
throws when the format or the date itself is wrong.

### `editedAfterPublished` + `editedAfterPublishedError`

A post cannot be edited before it was published.

Both dates go through `parseDate`, **never `new Date()`**: `new Date()` reads
`DD/MM/YYYY` as the US `MM/DD/YYYY`, so from day 13 on it returns an
`Invalid Date` and the whole check silently passes — or fails for the wrong
reason.

It is applied with `.refine()` **after** the object, not on a field, because it
needs two fields at once. Collections that never write `lastTimeEdited` simply
skip it (the guard short-circuits on `!data.lastTimeEdited`).

`editedAfterPublishedError` carries `path: ["lastTimeEdited"]` — the field the
error is reported on.

## 2. Categories live outside this file

The category enums are built in `src/lib/content-categories/`, so that the label
shown in the UI can never drift from the value allowed in the frontmatter:

| File                     | Exports                                                       | Used by            |
| ------------------------ | ------------------------------------------------------------- | ------------------ |
| `shared.categories.ts`   | `SHARED_CATEGORIES`, `SHARED_CATEGORY_LABELS`                  | books + notes      |
| `books.categories.ts`    | `booksCategories` (`z.enum`), `BOOKS_CATEGORY_LABELS`          | `books`            |
| `notes.categories.ts`    | `notesCategories`, `NOTES_CATEGORY_LABELS`                     | `notes`            |
| `sources.categories.ts`  | `sourceCategories`, `SOURCES_CATEGORY_LABELS`                  | `sourceSchema`     |

Notes are the shared list plus `random`, `relationship`, `society`, `sport`.

Each labels object is typed `Record<<Enum>, string>`, so **adding a value to the
array without adding its label fails `pnpm build`**. That type error is the
safety net, not a bug.

The three behavior collections (`biases`, `mentalModels`, `designLaws`) still
declare their `category` enum inline, in Spanish, because they are the
user-facing pills of each section and nothing else consumes them:

- `biases`: `velocidad`, `memoria`, `percepción`, `contexto`, `juicio`
- `designLaws`: `composición visual`, `interacción`, `percepción`
- `mentalModels`: `pensamiento general`, `física, química y biología`,
  `sistemas`, `matematicas`, `economía`, `militar y guerra`,
  `humanidad y juicio` — a provisional list taken from
  <https://fs.blog/mental-models/>

## 3. `sourceSchema` — sources are frontmatter, not a collection

Sources cited in a post (a bias, a design law or a mental model) live in the
frontmatter of the post itself — no duplicated content — and are displayed as
what they are (book, video, quote…) in `/behavior/fuentes` and in the "Detrás de
este post" block of the post detail page.

**There is no `sources` collection on purpose**: adding a source means adding
four lines to the `.mdx` you are already writing. `sources: […].default([])`
keeps a post without sources valid — it just doesn't show up in the drawer.

Adding a new source type takes **two** steps, both in
`src/lib/content-categories/sources.categories.ts`: `SOURCE_CATEGORIES` and its
label in `SOURCES_CATEGORY_LABELS`. Forgetting the second one fails the build
(§2). See `paths/sources.md` §3.3.

## 4. `behaviorContentBaseSchema`

The frontmatter that `biases`, `mentalModels` and `designLaws` share. The three
are the same kind of thing — a post with a card in `/behavior` — so they are
described once. Only `category` stays per collection, since each has its own
enum (§2).

It is **a function, not a plain object**, because `cover` needs `image()`, which
only exists inside the `schema` callback of `defineCollection`.

`contentCount` must be unique **within its own collection**: it feeds the card
code (`DSG-001`), and `get-behavior-entries.ts` throws at build time naming the
two colliding entries. The three collections number independently.

## 5. `essays` — defined, exported nowhere

`essayCollection` is declared but left out of the `collections` export, kept for
when the section is picked up again. That is why `astro check` reports
`'essayCollection' is declared but its value is never read` — expected, not a
bug. Its live schema is only `title` + `description`.

The rest of the fields were drafted and then commented out. They are parked here
so the file can stay clean, and are what to start from when `essays` is revived:

```ts
essayImage: z.object({ src: z.union([z.string(), z.string()]), alt: z.string() }),
keywords: z.array(z.string()),
publishDate: dateField,
lastTimeEdited: dateField.optional(),
tags: z.array(z.string()),
language: z.enum(["es"]),
author: z.string().default("c12z"),
authorLink: z.string(),
readingTime: z.string(),
categories: z.array(essaysCategories),  // an essays.categories.ts, per §2
status: z.boolean().default(true),
canonicalURL: z.string(),
isDraft: z.boolean().default(true).optional(),
isIndexed: z.boolean().default(false),
```

Note the original draft validated dates with its own inline `.refine()` on
`YYYY-MM-DD`. Don't bring that back: use `dateField` and
`editedAfterPublished` (§1), like every other collection.

To revive it: add `essays: essayCollection` to the `collections` export, and add
the key to `COLLECTION_KEYS` in `src/global/collection-keys.ts` — the
`satisfies Record<CollectionKey, CollectionKey>` there fails the type-check if
the two files disagree.

## 6. Collections at a glance

| Collection     | Base folder                | Own fields worth knowing                                            |
| -------------- | -------------------------- | ------------------------------------------------------------------- |
| `books`        | `src/content/books`        | `cover` (`image()`), `score` 1-5 integer, `author.link` must start with `https://`, `quote` ≤150, `abstract` 250-410 |
| `projects`     | `src/content/projects`     | `projectUrl` starts with `https://`, `why` ≤20 chars, optional `styleClass` |
| `notes`        | `src/content/notes`        | `excerpt` 50-300, `category`, `sources` (label + url — **not** `sourceSchema`), `illustration[]` |
| `biases`       | `src/content/biases`       | `behaviorContentBaseSchema` + its `category`                        |
| `mentalModels` | `src/content/mental-models`| idem                                                                |
| `designLaws`   | `src/content/design-laws`  | idem                                                                |

`notes` has its own simpler `sources` shape (just a label and a url): it is a
list of links, not the sources drawer. Don't unify them without moving notes
into `/behavior/fuentes` too.

`backlog: z.enum(["wip", "upload"])` is the site-wide draft switch — it decides
whether a card is clickable or shown as not available yet.
