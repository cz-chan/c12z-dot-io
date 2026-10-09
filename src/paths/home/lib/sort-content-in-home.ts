import { getCollection } from "astro:content";

import {
	SECTION_LISTS,
	type SectionItem,
} from "@home-path/lib/section-lists.ts";
import { parseDate } from "@/utils/date.ts";
import { NOTES_CATEGORY_LABELS } from "@/lib/content-categories/notes.categories.ts";
import { ContentRoute } from "@/lib/routes/content-route.ts";

const byNewest = (
	a: { data: { publishDate: string } },
	b: { data: { publishDate: string } },
) =>
	parseDate(b.data.publishDate).getTime() -
	parseDate(a.data.publishDate).getTime();

const BEHAVIOR_META = {
	biases: "/sesgos",
	mentalModels: "/modelos",
	designLaws: "/diseño",
} as const;

const [
	booksEntries,
	biasEntries,
	mentalModelEntries,
	designLawEntries,
	projectEntries,
	notesEntries,
] = await Promise.all([
	getCollection("books"),
	getCollection("biases"),
	getCollection("mentalModels"),
	getCollection("designLaws"),
	getCollection("projects"),
	getCollection("notes"),
]);

const uploadedBooks = booksEntries.filter(
	(entry) => entry.data.backlog === "upload",
);
const uploadedBehavior = [
	...biasEntries,
	...mentalModelEntries,
	...designLawEntries,
].filter((entry) => entry.data.backlog === "upload");
const uploadedProject = projectEntries.filter(
	(entry) => entry.data.backlog === "upload",
);

const recentBook: SectionItem[] = uploadedBooks
	.sort(byNewest)
	.slice(0, 4)
	.map((entry) => {
		const { data } = entry;
		const { author, title, publishDate } = data;
		return {
			text: title,
			href: ContentRoute.getLink(entry),
			meta: `${author.name ?? ""} · ${publishDate.split("/")[2]}`,
		};
	});

const recentBehavior: SectionItem[] = uploadedBehavior
	.sort(byNewest)
	.slice(0, 4)
	.map((entry) => {
		return {
			text: entry.data.title,
			href: ContentRoute.getLink(entry),
			meta: BEHAVIOR_META[entry.collection],
		};
	});

const recentProject: SectionItem[] = uploadedProject
	.sort(byNewest)
	.slice(0, 4)
	.map((entry) => ({
		text: entry.data.projectTitle,
		href: ContentRoute.getLink(entry),
		meta: `@${entry.data.why}`,
	}));

const recentNotes: SectionItem[] = [...notesEntries]
	.sort(byNewest)
	.slice(0, 4)
	.map((entry) => ({
		text: entry.data.title,
		href: ContentRoute.getLink(entry),
		meta: NOTES_CATEGORY_LABELS[entry.data.category],
	}));

const sectionUpdates: Record<
	string,
	{ items: SectionItem[]; totalCount: number }
> = {
	biblioteca: { items: recentBook, totalCount: uploadedBooks.length },
	behavior: { items: recentBehavior, totalCount: uploadedBehavior.length },
	proyectos: { items: recentProject, totalCount: uploadedProject.length },
	notas: { items: recentNotes, totalCount: notesEntries.length },
};

export const updatedSectionLists = SECTION_LISTS.map((section) =>
	section.label in sectionUpdates
		? { ...section, ...sectionUpdates[section.label] }
		: section,
);
