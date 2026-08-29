import { getCollection } from "astro:content";
import { BehaviorSectionData } from "@behavior-path/lib/behavior-sections.data.ts";
import type { BehaviorSection } from "@behavior-path/lib/behavior-section.types.ts";

const count = (num: number, singular: string, plural: string) =>
	`${num} ${num === 1 ? singular : plural}`;

export default async function getBehaviorSection(): Promise<BehaviorSection[]> {
	const collectionEntries = await Promise.all(
		BehaviorSectionData.map((section) =>
			section.collection
				? getCollection(section.collection)
				: Promise.resolve(null),
		),
	);

	const sourceCounts = collectionEntries
		.flatMap((entries) => entries ?? [])
		.map((entry) => ("sources" in entry.data ? entry.data.sources.length : 0));

	const totalSources = sourceCounts.reduce((sum, numb) => sum + numb, 0);
	const withSourcesCount = sourceCounts.filter((numb) => numb > 0).length;

	return BehaviorSectionData.map((section, i) => {
		const entries = collectionEntries[i];
		return {
			...section,
			meta: entries
				? count(entries.length, "publicado", "publicados")
				: `${count(totalSources, "fuente", "fuentes")} · ${count(withSourcesCount, "tema", "temas")}`,
		};
	});
}
