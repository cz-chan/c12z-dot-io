import { z } from "astro/zod";

const SOURCE_CATEGORIES = [
	"book",
	"article",
	"paper",
	"video",
	"podcast",
	"lecture",
	"web",
	"quote",
] as const;

export type SourceCatgeoreis = (typeof SOURCE_CATEGORIES)[number];

export const SOURCES_CATEGORY_LABELS: Record<SourceCatgeoreis, string> = {
	article: "artículo",
	book: "libro",
	lecture: "charla",
	paper: "paper",
	podcast: "podcast",
	quote: "frase",
	video: "video",
	web: "web",
};

export const sourceCategories = z.enum(SOURCE_CATEGORIES);
