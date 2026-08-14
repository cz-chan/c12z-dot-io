import type { CollectionKey } from "astro:content";

export interface BehaviorSectionConfig {
	href: string;
	name: string;
	title: string;
	eyebrow: string;
	transitionName: string;
	description: string;
	collection: CollectionKey | null; // null for sources because is not a collection
}

export interface BehaviorSection extends BehaviorSectionConfig {
	meta: string;
}
