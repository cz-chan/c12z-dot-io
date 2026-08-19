export interface SectionItem {
	text: string;
	href: string;
	meta?: string;
}

export interface Section {
	href: string;
	style: string;
	label: string;
	description: string;
	items: SectionItem[];
	totalCount?: number;
}
