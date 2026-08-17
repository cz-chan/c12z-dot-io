import { defineCollection, type ImageFunction } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

import { isValidDateFormat, parseDate } from "@/utils/validating-date.ts";

/** DD/MM/YYYY. `isValidDateFormat` throws if the format or the date is wrong. */
const dateField = z.string().refine(isValidDateFormat);

/**
 * A post cannot be edited before it was published. Both dates go through
 * `parseDate` and not `new Date()`, which would read DD/MM/YYYY as the US
 * MM/DD/YYYY — and return an Invalid Date from day 13 on, making the whole
 * check silently pass or fail for the wrong reason.
 *
 * Applied with `.refine()` AFTER the object, because it needs two fields at
 * once. Collections with no `lastTimeEdited` written simply skip it.
 */
const editedAfterPublished = (data: {
	publishDate: string;
	lastTimeEdited?: string;
}) =>
	!data.lastTimeEdited ||
	parseDate(data.lastTimeEdited) >= parseDate(data.publishDate);

const editedAfterPublishedError = {
	message:
		"The field { lastTimeEdited } cannot be earlier than { publishDate }.",
	path: ["lastTimeEdited"], // Indicates the field where the error is displayed
};

const essayCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/essay",
	}),
	schema: z.object({
		title: z.string().max(60),
		description: z.string().min(110).max(160),
		// essayImage: z.object({
		//   src: z.union([z.string(), z.string()]),
		//   alt: z.string(),
		// }),
		// keywords: z.array(z.string()),
		// publishDate: z.string().refine(isValidDateFormat, {
		//   message: "The date must be in the format: YYYY-MM-DD. Make sure you have written it in the correct format.",
		// }),
		// lastTimeEdited: z.string().refine(
		//   (val) => (val ? isValidDateFormat(val) : true), {
		//   message: "The date must be in the format: YYYY-MM-DD. Make sure you have written it in the correct format.",
		//   }).transform((val, ctx) => {
		//     const publishDate = ctx;
		//     return val ?? publishDate;
		//   }).optional(),
		// tags: z.array(z.string()),
		// language: z.enum(["es"]),
		// author: z.string().default("c12z"),
		// authorLink: z.string(),
		// readingTime: z.string(),
		// categories: z.array(z.string()),
		// status: z.boolean().default(true),
		// canonicalURL: z.string()
		// isDraft: z.boolean().default(true).optional(),
		// isIndexed: z.boolean().default(false),
	}),
});

const libraryCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/library",
	}),
	schema: ({ image }) =>
		z
			.object({
				title: z.string().max(60),
				cover: z.object({
					src: image(),
					alt: z.string(),
				}),
				titleTag: z.string().max(60),
				description: z.string().min(110).max(160),
				abstract: z.string().min(250).max(410),
				backlog: z.enum(["wip", "upload"]),
				quote: z.string().max(150),
				category: z.enum([
					"health",
					"product",
					"culture",
					"psychology",
					"economics",
					"creativity",
					"philosophy",
					"other",
				]),
				score: z
					.number()
					.min(1, {
						message: "The minimum score value is 1",
					})
					.max(5, {
						message: "The maximum score value is 5",
					})
					.int("The numbers must be integer"),
				publishDate: dateField,
				lastTimeEdited: dateField.optional(),
				authors: z.union([
					z.object({
						name: z.string(),
						link: z
							.string()
							.refine(
								(link) =>
									link.startsWith("https://www.") ||
									link.startsWith("https://"),
								{
									message:
										"The author's URL must start with 'https://www.' or 'https://'",
								},
							),
					}),
					z.array(
						z.object({
							name: z.string(),
							link: z
								.string()
								.refine(
									(link) =>
										link.startsWith("https://www.") ||
										link.startsWith("https://"),
									{
										message:
											"The author's URL must start with 'https://www.' or 'https://'",
									},
								),
						}),
					),
				]),
				readingTime: z.number().optional(),
				keywords: z.array(z.string()),
			})
			.refine(editedAfterPublished, editedAfterPublishedError),
});

const projectCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/project",
	}),
	schema: ({ image }) =>
		z
			.object({
				projectTitle: z.string().max(80),
				projectDescription: z.string().min(110).max(160),
				projectUrl: z.string().startsWith("https://"),
				cover: z.object({
					src: image(),
					alt: z.string(),
				}),
				why: z.string().max(20),
				backlog: z.enum(["wip", "upload"]),
				publishDate: dateField,
				lastTimeEdited: dateField.optional(),
				keywords: z.array(z.string()),
				styleClass: z.string().optional(),
			})
			.refine(editedAfterPublished, editedAfterPublishedError),
});

const notesCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/notes",
	}),
	schema: ({ image }) =>
		z
			.object({
				title: z.string().max(80),
				excerpt: z.string().min(50).max(300),
				keywords: z.array(z.string()),
				publishDate: dateField,
				lastTimeEdited: dateField.optional(),
				sources: z
					.array(
						z.object({
							label: z.string(),
							url: z.string(),
						}),
					)
					.default([]),
				illustration: z
					.array(
						z.object({
							src: image(),
							alt: z.string(),
						}),
					)
					.default([]),
			})
			.refine(editedAfterPublished, editedAfterPublishedError),
});

/**
 * Sources cited in a post (bias, design or mental model). They are located in the
 * frontmatter of the post itself—no duplicate content—and are
 * displayed as what they are (book, video, quote...) in /behavior/fuentes
 * and in the "Detrás de este post" block on the post detail page.
 *
 * There is no `sources` collection on purpose: adding a source means adding
 * four lines to the .mdx you are already writing. `default([])` keeps a post
 * without sources valid — it simply does not show up in the drawer.
 *
 * Adding a new type takes TWO steps: the `z.enum` below AND `TYPE_LABELS` in
 * behavior/paths/sources/data/source-types.ts (the build fails if you forget the
 * second one — that is intended). See .docs/paths/sources.md.
 */
const sourceSchema = z.object({
	title: z.string().max(300),
	type: z.enum([
		"libro",
		"articulo",
		"paper",
		"video",
		"podcast",
		"charla",
		"web",
		"cita",
	]),
	author: z.string().optional(),
	url: z.string().startsWith("https://").optional(),
	date: dateField.optional(),
	excerpt: z.string().optional(),
});

/**
 * The frontmatter that `biases`, `mentalModels` and `designLaws` share.
 * The three are the same kind of thing — a post with a card in /behavior —
 * so they must be described once. Only `category` stays per collection,
 * because each one has its own enum.
 *
 * It is a function and not a plain object because `cover` needs `image()`,
 * which only exists inside the `schema` callback.
 */

const behaviorContentBaseSchema = (image: ImageFunction) =>
	z.object({
		title: z.string().max(80),
		englishTitle: z.string().max(80),
		question: z.string().min(50).max(120),
		contentCount: z.number().int().min(1).max(999),
		cover: z.object({
			src: image().optional(),
			alt: z.string().optional(),
		}),
		titleTag: z.string().max(60),
		description: z.string().min(110).max(160),
		backlog: z.enum(["wip", "upload"]),
		publishDate: dateField,
		lastTimeEdited: dateField.optional(),
		keywords: z.array(z.string()),
		readingTime: z.number().optional(),
		sources: z.array(sourceSchema).default([]),
	});

const biasCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/biases",
	}),
	schema: ({ image }) =>
		behaviorContentBaseSchema(image)
			.extend({
				category: z.array(
					z.enum(["velocidad", "memoria", "percepción", "contexto", "juicio"]),
				),
			})
			.refine(editedAfterPublished, editedAfterPublishedError),
});

// const biasCollection = defineCollection({
// 	loader: glob({
// 		pattern: "**/*.{md,mdx}",
// 		base: "./src/content/biases",
// 	}),
// 	schema: ({ image }) =>
// 		z
// 			.object({
// 				biasName: z.string().max(80),
// 				englishBiasName: z.string().max(80),
// 				contentCount: z.number().int().min(1).max(999),
// 				cover: z.object({
// 					src: image().optional(),
// 					alt: z.string(),
// 				}),
// 				titleTag: z.string().max(60),
// 				description: z.string().min(110).max(160),
// 				biasQuestion: z.string().min(50).max(120),
// 				backlog: z.enum(["wip", "upload"]),
// 				publishDate: dateField,
// 				lastTimeEdited: dateField.optional(),
// 				keywords: z.array(z.string()),
// 				readingTime: z.number().optional(),
// 				category: z.array(
// 					z.enum(["velocidad", "memoria", "percepción", "contexto", "juicio"]),
// 				),
// 				sources: z.array(sourceSchema).default([]),
// 			})
// 			.refine(editedAfterPublished, editedAfterPublishedError),
// });

const mentalModelsCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/mental-models",
	}),
	schema: ({ image }) =>
		z
			.object({
				modelName: z.string().max(80),
				englishModelName: z.string().max(80),
				contentCount: z.number().int().min(1).max(999),
				category: z.array(
					z.enum([
						// provisional categories: https://fs.blog/mental-models/
						"pensamiento general",
						"física, química y biología",
						"sistemas",
						"matematicas",
						"economía",
						"militar y guerra",
						"humanidad y juicio",
					]),
				),
				cover: z.object({
					src: image().optional(),
					alt: z.string(),
				}),
				titleTag: z.string().max(60),
				description: z.string().min(110).max(160),
				modelQuestion: z.string().min(50).max(120),
				backlog: z.enum(["wip", "upload"]),
				publishDate: dateField,
				lastTimeEdited: dateField.optional(),
				keywords: z.array(z.string()),
				readingTime: z.number().optional(),
				sources: z.array(sourceSchema).default([]),
			})
			.refine(editedAfterPublished, editedAfterPublishedError),
});
const designLawsCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/design",
	}),
	schema: ({ image }) =>
		z
			.object({
				designLawName: z.string().max(80),
				englishDesignLawName: z.string().max(80),
				contentCount: z.number().int().min(1).max(999),
				category: z.array(
					z.enum(["composición visual", "interacción", "percepción"]),
				),
				designQuestion: z.string().min(50).max(120),
				cover: z.object({
					src: image().optional(),
					alt: z.string(),
				}),
				titleTag: z.string().max(60),
				description: z.string().min(110).max(160),
				backlog: z.enum(["wip", "upload"]),
				publishDate: dateField,
				lastTimeEdited: dateField.optional(),
				keywords: z.array(z.string()),
				readingTime: z.number().optional(),
				sources: z.array(sourceSchema).default([]),
			})
			.refine(editedAfterPublished, editedAfterPublishedError),
});

export const collections = {
	biases: biasCollection,
	library: libraryCollection,
	projects: projectCollection,
	notes: notesCollection,
	mentalModels: mentalModelsCollection,
	designLaws: designLawsCollection,
};
// essays: essayCollection,
