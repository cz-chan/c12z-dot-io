import { z } from "astro/zod";
import {
	SHARED_CATEGORIES,
	SHARED_CATEGORY_LABELS,
} from "@/lib/content-categories/shared.categories.ts";

const BOOKS_CATEGORIES = [...SHARED_CATEGORIES] as const;

export type BooksCategory = (typeof BOOKS_CATEGORIES)[number];

export const BOOKS_CATEGORY_LABELS: Record<BooksCategory, string> = {
	...SHARED_CATEGORY_LABELS,
};

export const booksCategories = z.enum(BOOKS_CATEGORIES);
