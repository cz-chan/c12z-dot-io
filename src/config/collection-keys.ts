import type { CollectionKey } from "astro:content";

export const COLLECTION_KEYS = {
	biases: "biases",
	mentalModels: "mentalModels",
	designLaws: "designLaws",
	books: "books",
	projects: "projects",
	notes: "notes",
	// essays: "essays",
} satisfies Record<CollectionKey, CollectionKey>;
