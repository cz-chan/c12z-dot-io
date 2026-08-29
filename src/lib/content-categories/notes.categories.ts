import { z } from "astro/zod";
import {
	SHARED_CATEGORIES,
	SHARED_CATEGORY_LABELS,
} from "@/lib/content-categories/shared.categories.ts";

const ONLY_FOR_NOTES = ["random", "relationship", "society", "sport"] as const;

const NOTES_CATEGORIES = [...SHARED_CATEGORIES, ...ONLY_FOR_NOTES] as const;

export type NotesCategory = (typeof NOTES_CATEGORIES)[number];

export const NOTES_CATEGORY_LABELS: Record<NotesCategory, string> = {
	...SHARED_CATEGORY_LABELS,
	random: "random",
	relationship: "personas",
	society: "sociedad",
	sport: "deporte",
};

export const notesCategories = z.enum(NOTES_CATEGORIES);
