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
 */
export type Source = CollectionEntry<"biases">["data"]["sources"][number];

/**
 * What each type is called in the UI (the folder tab / file label).
 *
 * The `Record<Source["type"], string>` is deliberate: adding a type to the
 * `z.enum` of `sourceSchema` without adding its label here breaks
 * `pnpm build`. That type error is the safety net, not a bug.
 */
export const TYPE_LABELS: Record<Source["type"], string> = {
	libro: "libro",
	articulo: "artículo",
	paper: "paper",
	video: "vídeo",
	podcast: "podcast",
	charla: "charla",
	web: "web",
	cita: "cita",
};
