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

/**
 * URL section of each content collection (e.g. `books` → `biblioteca`).
 *
 * Single source of truth for content routes: `ContentRoute` builds both
 * the page links (`/biblioteca/<id>`) and the like paths stored in the db
 * (`biblioteca/<id>`) from this map.
 *
 * Must match the folder structure in `src/pages/`.
 */
export const COLLECTION_SECTIONS = {
	books: "biblioteca",
	biases: "behavior/sesgos",
	designLaws: "behavior/diseño",
	mentalModels: "behavior/modelos-mentales",
	notes: "notas",
	projects: "proyectos",
	// essays: "ensayos",
} satisfies Record<CollectionKey, string>;
