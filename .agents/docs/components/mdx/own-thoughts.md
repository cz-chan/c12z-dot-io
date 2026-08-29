# `OwnThoughts` — the editorial-note callout

> Callout box for inline editorial notes inside content (book reviews, essays,
> behavior posts). The component itself carries no comments — its "how" and
> "why" live here.
>
> General context for the repo: [`start-here.md`](../../start-here.md).

Files: `src/components/mdx/own-thoughts/OwnThoughts.astro` +
`own-thoughts.module.css`.

---

## 1. What it is

A bordered box that renders an icon (`UnclearThought`) next to one or more body
paragraphs, with an optional link block underneath. It is a **manual** component:
nothing imports it from an `.astro` file — the `.mdx` posts import it by hand.
Zero importers outside `src/content/` is its normal state, not dead code.

In use today in `src/content/books/*/index.mdx`.

## 2. Props

| Prop          | Type       | Required | What it does                              |
| ------------- | ---------- | -------- | ----------------------------------------- |
| `paragraphs`  | `string[]` | yes      | Body copy. **Each string becomes its own `<p>`.** |
| `asset`       | `boolean`  | no       | Shows the link block below the paragraphs |
| `title_asset` | `string`   | no       | Visible label of the link (anchor text)   |
| `href_link`   | `string`   | no       | URL the link points to                    |
| `title_link`  | `string`   | no       | Tooltip / accessible title for the `<a>`  |

**The four link props travel together.** The block renders only when `asset` is
truthy, and an `asset` without the other three renders an empty anchor. TypeScript
doesn't enforce the grouping — they are all independently optional — so it is on
the author to pass the set.

## 3. Usage in MDX

Import after the frontmatter, before any content, always through the alias:

```mdx
import OwnThoughts from "@/mdx/own-thoughts/OwnThoughts.astro";
```

One paragraph:

```mdx
<OwnThoughts paragraphs={["your thought"]} />
```

Several — one `<p>` per string:

```mdx
<OwnThoughts paragraphs={["First paragraph.", "Second paragraph.", "..."]} />
```

With a link:

```mdx
<OwnThoughts
	paragraphs={["thought.", "another thought."]}
	asset
	title_asset="Ver fuente"
	href_link="https://example.com"
	title_link="Fuente original"
/>
```

## 4. Notes on the markup and the CSS

- The anchor is hardcoded `target="_blank" rel="noopener noreferrer"`. That is
  redundant for external links — `rehype-external-links` adds both at build
  time — but it also means an **internal** `href_link` opens in a new tab.
- The link carries the global `lettering` class on top of its CSS Module class.
- All styles are nested under `.otSection` and use design tokens only
  (`--surface-2`, `--border`, `--sp-*`, `--ff-mono`, `--accent`). Body text is
  mono at `--t-mili`.
- `.otLink svg` and `.ot-texts` are styled but unused by the current markup —
  leftovers from an earlier version with an icon inside the link.
