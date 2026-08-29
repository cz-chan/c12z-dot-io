import { getCollection } from "astro:content";

import type { BehaviorSectionKeys } from "@behavior-path/lib/card/behavior-fancycodes.ts";

import { parseDate } from "@/utils/validating-date.ts";
import { COLLECTION_KEYS } from "@/global/collection-keys.ts";

export async function getBehaviorEntries(section: BehaviorSectionKeys) {
	const entries = await getCollection(COLLECTION_KEYS[section]);

	const seen = new Map<number, string>();
	for (const entry of entries) {
		const previous = seen.get(entry.data.contentCount);

		if (previous) {
			throw new Error(
				`[${section}] contentCount ${entry.data.contentCount} duplicated: ${previous} and ${entry.id}`,
			);
		}

		seen.set(entry.data.contentCount, entry.id);
	}

	return [...entries].sort(
		(a, b) =>
			parseDate(b.data.publishDate).getTime() -
			parseDate(a.data.publishDate).getTime(),
	);
}
