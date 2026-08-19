import { SECTION_LISTS } from "./section-lists";
import { getCollection } from "astro:content";
import type { SectionItem } from "./section-lists";

const parseDate = (theDate: string) =>
	new Date(theDate.split("/").reverse().join("-")).getTime();
const byNewest = (
	a: { data: { publishDate: string } },
	b: { data: { publishDate: string } },
) => parseDate(b.data.publishDate) - parseDate(a.data.publishDate);

const BEHAVIOR_COLLECTIONS = {
	biases: { basePath: "/behavior/sesgos", meta: "/sesgos" },
	mentalModels: { basePath: "/behavior/modelos-mentales", meta: "/modelos" },
	designLaws: { basePath: "/behavior/diseño", meta: "/diseño" },
} as const;

const [
	booksEntries,
	biasEntries,
	mentalModelEntries,
	designLawEntries,
	projectEntries,
] = await Promise.all([
	getCollection("books"),
	getCollection("biases"),
	getCollection("mentalModels"),
	getCollection("designLaws"),
	getCollection("projects"),
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
		const authors = Array.isArray(entry.data.authors)
			? entry.data.authors
			: [entry.data.authors];
		return {
			text: entry.data.title,
			href: `/biblioteca/${entry.id}`,
			meta: `${authors[0]?.name ?? ""} · ${entry.data.publishDate.split("/")[2]}`,
		};
	});

const recentBehavior: SectionItem[] = uploadedBehavior
	.sort(byNewest)
	.slice(0, 4)
	.map((entry) => {
		const { basePath, meta } = BEHAVIOR_COLLECTIONS[entry.collection];
		return {
			text: entry.data.title,
			href: `${basePath}/${entry.id}`,
			meta,
		};
	});

const recentProject: SectionItem[] = uploadedProject
	.sort(byNewest)
	.slice(0, 4)
	.map((entry) => ({
		text: entry.data.projectTitle,
		href: `/proyectos/${entry.id}`,
		meta: `@${entry.data.why}`,
	}));

const sectionUpdates: Record<
	string,
	{ items: SectionItem[]; totalCount: number }
> = {
	biblioteca: { items: recentBook, totalCount: uploadedBooks.length },
	behavior: { items: recentBehavior, totalCount: uploadedBehavior.length },
	proyectos: { items: recentProject, totalCount: uploadedProject.length },
};

export const updatedSectionLists = SECTION_LISTS.map((section) =>
	section.label in sectionUpdates
		? { ...section, ...sectionUpdates[section.label] }
		: section,
);
