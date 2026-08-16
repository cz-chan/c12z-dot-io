import type { PageKeywords } from "@interfaces/keywords.interface";

/**
 * Keywords for /behavior/fuentes (the drawer index only). The per-topic
 * routes build their own from the topic name, in
 * src/pages/behavior/fuentes/[...id].astro.
 */
export const sourcesKeywords: PageKeywords = {
	keywords: [
		"Sources on behavioral economics",
		"Sources on Cognitive Biases",
		"Rough Notes on Human Behavior",
		"Behavior Workbook",
		"Notes on Mental Models",
	],
};
