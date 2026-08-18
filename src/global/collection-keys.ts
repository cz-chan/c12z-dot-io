import type { CollectionKey } from "astro:content";

export const COLLECTION_KEYS = {
	biases: "biases",
	mentalModels: "mentalModels",
	designLaws: "designLaws",
	library: "library",
	projects: "projects",
	notes: "notes",
	essays: "essays",
} satisfies Record<CollectionKey, CollectionKey>;
