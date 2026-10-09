import type { CollectionKey } from "astro:content";
import { COLLECTION_SECTIONS } from "@/config/collection-keys.ts";

export type ContentRef = { collection: CollectionKey; id: string };

export class ContentRoute {
	private constructor() {}

	public static getPath(entry: ContentRef) {
		return `${COLLECTION_SECTIONS[entry.collection]}/${entry.id}`.normalize(
			"NFC",
		);
	}

	public static getLink(entry: ContentRef) {
		return `/${ContentRoute.getPath(entry)}`;
	}
}
