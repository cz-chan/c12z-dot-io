import type { CollectionKey } from "astro:content";

export const COLLECTION_KEYS = {
	bias: "bias",
	mentalModels: "mentalModels",
	designLaws: "designLaws",
	library: "library",
	projects: "projects",
	notes: "notes",
} satisfies Record<CollectionKey, CollectionKey>;
