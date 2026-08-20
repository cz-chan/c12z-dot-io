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

export const SECTION_LISTS: Section[] = [
	{
		href: "/proyectos",
		style: "project",
		label: "proyectos",
		description: "Cosas que voy creando y compartiendo",
		items: [],
	},
	{
		href: "/biblioteca",
		style: "library",
		label: "biblioteca",
		description: "Notas de los libros que voy leyendo",
		items: [],
	},
	{
		href: "/behavior",
		style: "behavior",
		label: "behavior",
		description: "Cómo y por qué hacemos lo que hacemos",
		items: [],
	},
	{
		href: "/notas",
		style: "note",
		label: "notas",
		description: "Apuntes cortos e ideas antes de que sean ensayos",
		items: [],
	},
	{
		href: "/ensayos",
		style: "essay",
		label: "ensayos",
		description: "Frameworks y pensamientos sobre Growth y Producto",
		items: [],
	},
];
