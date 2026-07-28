/**
 * Global per-page SEO/OG metadata for c12z.io.
 *
 * - `PAGE_INFO_SCHEMA` — Zod schema enforcing title (50-60 chars) and
 *   description (110-160 chars) length, plus optional OG image and
 *   keywords (7-8 items, short-tail + long-tail) fields.
 * - `PagesInfo` — TypeScript type inferred from the schema.
 * - `PAGES` — per-section metadata keyed by page slug, validated at build time.
 *
 * Always import from here instead of hardcoding page titles/descriptions elsewhere.
 */

import { z } from "astro/zod";

import { SITE_DEFAULT_CONFIG } from "./site-info";

const OG_IMAGE_DEFAULT = "/og/og-image.avif";
const OG_IMAGE_LIBRARY = "/og/pages/og-image-library.avif";
const OG_IMAGE_BEHAVIOR = "/og/pages/og-image-behavior.avif";
const OG_IMAGE_SOURCES = "/og/pages/og-image-sources.avif";
const OG_IMAGE_BIAS = "/og/pages/og-image-bias.avif";
const OG_IMAGE_MENTAL_MODEL = "/og/pages/og-image-mental-models.avif";
const OG_IMAGE_DESIGN = "/og/pages/og-image-design.avif";
const OG_IMAGE_ESSAY = "/og/pages/og-image-essay.avif";
const OG_IMAGE_PROJECTS = "/og/pages/og-image-projects.avif";
const OG_IMAGE_NOTES = "/og/pages/og-image-notes.avif";

const PAGE_INFO_SCHEMA = z.object({
	title: z.string().max(60),
	description: z.string().min(110).max(160),
	ogImage: z.string().optional(),
	ogImageAlt: z.string().optional(),
	keywords: z.array(z.string()).min(7).max(8).optional(),
});

export type PagesInfo = z.infer<typeof PAGE_INFO_SCHEMA>;

export const PAGES = z.record(z.string(), PAGE_INFO_SCHEMA).parse({
	context: {
		title: "Quién soy, qué hago y por qué - cz ✌🏽",
		description:
			"Growth, producto y economía conductual. Quién soy, cómo trabajo y por qué me obsesiona entender la mente de quien usa lo que construimos.",
		ogImage: OG_IMAGE_DEFAULT,
		ogImageAlt: "Chema Ferrandez - c12z",
		keywords: [
			"chema ferrandez",
			"quién es cz",
			"contexto profesional",
			"chema ferrandez growth y producto",
			"perfil de growth y behavioral economics",
			"cómo trabajo growth y producto",
			"sobre mí producto y comportamiento",
			"experiencia en growth y economía conductual",
		],
	},
	library: {
		title: "Biblioteca: libros leídos, subrayados y sus notas - c12z",
		description:
			"Notas y reflexiones de los libros que voy leyendo sobre growth, psicología del comportamiento, y crecimiento personal entre otros.",
		ogImage: OG_IMAGE_LIBRARY,
		ogImageAlt: "Biblioteca y notas de libros - c12z",
		keywords: [
			"notas de libros",
			"resúmenes de libros",
			"libros de growth",
			"libros de producto recomendados",
			"libros de psicología del comportamiento",
			"reseñas de libros de negocio",
			"qué leer sobre growth y producto",
		],
	},
	behavior: {
		title: "Behavior: cómo decide la gente que usa tu producto",
		description:
			"Sesgos, modelos mentales y patrones de diseño en un mismo sitio. Entender la mente humana para construir productos que se usan de verdad.",
		ogImage: OG_IMAGE_BEHAVIOR,
		ogImageAlt: "Behavioral economics aplicado a growth y producto - c12z",
		keywords: [
			"behavioral economics",
			"economía conductual",
			"psicología del comportamiento",
			"behavioral economics para producto",
			"cómo deciden los usuarios",
			"sesgos y modelos mentales en producto",
			"behavioral design para startups",
		],
	},
	bias: {
		title: "Sesgos y heurísticas: atajos que usa tu cerebro - c12z",
		description:
			"Los atajos mentales que usamos sin darnos cuenta, explicados con ejemplos y aplicados a producto y a las decisiones del día a día.",
		ogImage: OG_IMAGE_BIAS,
		ogImageAlt: "Sesgos y heurísticas cognitivas - c12z",
		keywords: [
			"sesgos cognitivos",
			"heurísticas",
			"atajos mentales",
			"sesgos cognitivos con ejemplos",
			"sesgos aplicados a producto",
			"heurísticas de decisión",
			"por qué decidimos mal",
		],
	},
	mentalModel: {
		title: "Modelos mentales para pensar y decidir mejor - c12z",
		description:
			"Las herramientas de pensamiento que uso para ver problemas con más claridad, explicadas con ejemplos y aplicadas a producto, y a la vida en general.",
		ogImage: OG_IMAGE_MENTAL_MODEL,
		ogImageAlt: "Modelos mentales aplicados a growth y producto - c12z",
		keywords: [
			"modelos mentales",
			"mental models",
			"modelos mentales con ejemplos",
			"modelos mentales para decidir",
			"modelos mentales producto y growth",
			"pensar mejor herramientas",
			"lista de modelos mentales",
		],
	},
	design: {
		title: "Patrones y leyes de diseño aplicados a producto - c12z",
		description:
			"Cómo guiar el comportamiento de quien usa tu producto sin manipularlo: patrones, leyes de diseño y sus efectos reales en conversión y confianza.",
		ogImage: OG_IMAGE_DESIGN,
		ogImageAlt: "Patrones de diseño aplicados a producto y growth - c12z",
		keywords: [
			"patrones de diseño",
			"leyes de diseño",
			"design patterns producto",
			"patrones de diseño con ejemplos",
			"diseño y comportamiento del usuario",
			"behavioral design interfaces",
			"diseño de producto y conversión",
		],
	},
	sources: {
		title: "Fuentes usadas detrás del contenido de behavior - c12z",
		description:
			"Libros, papers, charlas y artículos que hay detrás de cada post de sesgos, modelos mentales y diseño. Todo lo que leo, en un solo sitio.",
		ogImage: OG_IMAGE_SOURCES,
		ogImageAlt: "Fuentes y notas en crudo de behavior - c12z",
		keywords: [
			"fuentes de behavioral economics",
			"bibliografía sesgos cognitivos",
			"papers de economía conductual",
			"fuentes de modelos mentales",
			"referencias de psicología del comportamiento",
			"material de estudio behavioral",
			"qué leer sobre comportamiento humano",
		],
	},
	essay: {
		title: "GEnsayos sobre growth, producto y comportamiento - c12z",
		description:
			"Textos largos donde pienso en voz alta: growth, producto, economía conductual y todo lo que aprendo construyendo y trabajando con equipos.",
		ogImage: OG_IMAGE_ESSAY,
		ogImageAlt: "Ensayos sobre growth, behavioral economics y producto - c12z",
		keywords: [
			"ensayos sobre growth",
			"artículos de producto",
			"ensayos de behavioral economics",
			"reflexiones sobre growth y producto",
			"guías de crecimiento de startups",
			"blog de growth en español",
			"ensayos sobre startups",
		],
	},
	notes: {
		title: "Notas: apuntes cortos para guardar - c12z",
		description:
			"El cajón de las ideas a medio cocer: notas breves sobre producto, economía conductual o cosas de la vida que me interesan y que considero interesante guardar.",
		ogImage: OG_IMAGE_NOTES,
		ogImageAlt: "Notas y apuntes cortos - c12z",
		keywords: [
			"notas cortas",
			"apuntes de growth",
			"notas sobre producto",
			"apuntes de behavioral economics",
			"ideas sueltas sobre startups",
			"notas rápidas producto y growth",
			"notas de chema ferrandez",
		],
	},
	projects: {
		title: "Proyectos y cosas que voy construyendo poco a poco - c12z",
		description:
			"Lo que voy construyendo por mi cuenta, contado por dentro: qué problema resuelve, con qué lo he hecho y el porqué de cada decisión.",
		ogImage: OG_IMAGE_PROJECTS,
		ogImageAlt: "Proyectos personales de Chema - c12z",
		keywords: [
			"proyectos personales",
			"proyectos de chema ferrandez",
			"building in public",
			"proyectos indie hacker",
			"cómo construyo mis proyectos",
			"herramientas para construir proyectos",
			"proyectos de growth y producto",
		],
	},
});
