import { defineCollection, type ImageFunction } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

import { isValidDateFormat, parseDate } from "@/utils/validating-date.ts";
import { booksCategories } from "@/lib/content-categories/books.categories.ts";
import { notesCategories } from "@/lib/content-categories/notes.categories.ts";
import { sourceCategories } from "@/lib/content-categories/sources.categories.ts";

const dateField = z.string().refine(isValidDateFormat);

const editedAfterPublished = (data: {
	publishDate: string;
	lastTimeEdited?: string;
}) =>
	!data.lastTimeEdited ||
	parseDate(data.lastTimeEdited) >= parseDate(data.publishDate);

const editedAfterPublishedError = {
	message:
		"The field { lastTimeEdited } cannot be earlier than { publishDate }.",
	path: ["lastTimeEdited"],
};

const essayCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/essays",
	}),
	schema: z.object({
		title: z.string().max(60),
		description: z.string().min(110).max(160),
	}),
});

const booksCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/books",
	}),
	schema: ({ image }) =>
		z
			.object({
				title: z.string().max(60),
				cover: z.object({
					src: image(),
					alt: z.string(),
				}),
				description: z.string().min(110).max(160),
				abstract: z.string().min(250).max(410),
				backlog: z.enum(["wip", "upload"]),
				quote: z.string().max(150),
				category: booksCategories,
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
				author: z.object({
					name: z.string(),
					link: z
						.string()
						.refine(
							(link) =>
								link.startsWith("https://www.") || link.startsWith("https://"),
							{
								message:
									"The author's URL must start with 'https://www.' or 'https://'",
							},
						),
				}),
				readingTime: z.number().optional(),
				keywords: z.array(z.string()),
			})
			.refine(editedAfterPublished, editedAfterPublishedError),
});

const projectCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/projects",
	}),
	schema: ({ image }) =>
		z
			.object({
				projectTitle: z.string().max(60),
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
				title: z.string().max(60),
				excerpt: z.string().min(50).max(300),
				keywords: z.array(z.string()),
				publishDate: dateField,
				lastTimeEdited: dateField.optional(),
				category: notesCategories,
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

const sourceSchema = z.object({
	title: z.string().max(300),
	type: sourceCategories,
	author: z.string().optional(),
	url: z.string().optional(),
	date: dateField.optional(),
	excerpt: z.string().optional(),
});

const behaviorContentBaseSchema = (image: ImageFunction) =>
	z.object({
		title: z.string().max(60),
		englishTitle: z.string().max(80),
		question: z.string().min(50).max(120),
		contentCount: z.number().int().min(1).max(999),
		cover: z.object({
			src: image().optional(),
			alt: z.string().optional(),
		}),
		description: z.string().min(110).max(160),
		backlog: z.enum(["wip", "upload"]),
		publishDate: dateField,
		lastTimeEdited: dateField.optional(),
		keywords: z.array(z.string()),
		readingTime: z.number().optional(),
		sources: z.array(sourceSchema).default([]),
	});

const designLawsCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/design-laws",
	}),
	schema: ({ image }) =>
		behaviorContentBaseSchema(image)
			.extend({
				category: z.enum(["composición visual", "interacción", "percepción"]),
			})
			.refine(editedAfterPublished, editedAfterPublishedError),
});

const mentalModelsCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/mental-models",
	}),
	schema: ({ image }) =>
		behaviorContentBaseSchema(image)
			.extend({
				category: z.enum([
					"pensamiento general",
					"física, química y biología",
					"sistemas",
					"matematicas",
					"economía",
					"militar y guerra",
					"humanidad y juicio",
				]),
			})
			.refine(editedAfterPublished, editedAfterPublishedError),
});

const biasCollection = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/biases",
	}),
	schema: ({ image }) =>
		behaviorContentBaseSchema(image)
			.extend({
				category: z.enum([
					"velocidad",
					"memoria",
					"percepción",
					"contexto",
					"juicio",
				]),
			})
			.refine(editedAfterPublished, editedAfterPublishedError),
});

export const collections = {
	biases: biasCollection,
	books: booksCollection,
	projects: projectCollection,
	notes: notesCollection,
	mentalModels: mentalModelsCollection,
	designLaws: designLawsCollection,
};
