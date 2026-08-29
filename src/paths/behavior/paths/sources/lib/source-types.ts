import type { CollectionEntry } from "astro:content";

/**
 * One source from the frontmatter of a bias, a mental model or design pattern.
 *
 * It is derived from the `bias` collection instead of being declared here so
 * that the type can never drift from `sourceSchema` in `src/content.config.ts`.
 * `bias` `designLaws` and `mentalModels` share that same schema,
 * so either one would do.
 *
 * It's the same <"biases">, <"mentalModels"> or <"designLaws">
 *
 * The UI label of each `type` lives with its enum, in
 * `@/lib/content-categories/sources.categories.ts` (`SOURCES_CATEGORY_LABELS`).
 */
export type Source = CollectionEntry<"biases">["data"]["sources"][number];
