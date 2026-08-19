import type { CollectionEntry } from "astro:content";

/**
 * An entry from any of the three collections that render a card in /behavior.
 * The three share `behaviorContentBaseSchema`.Only `category` differs, and it
 * widens to the union of the three enums, which is exactly what the chip needs.
 */
export type BehaviorEntry =
	| CollectionEntry<"biases">
	| CollectionEntry<"mentalModels">
	| CollectionEntry<"designLaws">;
