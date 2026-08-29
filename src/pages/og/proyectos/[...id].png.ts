import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

import { loadProjectHero } from "@/lib/og/load-cover.ts";
import { heroOgTemplate } from "@/lib/og/og-templates.ts";
import { renderOgImage } from "@/lib/og/render-og-image.ts";

export const prerender = true;

interface Props {
	entry: CollectionEntry<"projects">;
}

export async function getStaticPaths() {
	const projects = await getCollection("projects");

	return projects.map((entry) => ({
		params: { id: entry.id },
		props: { entry },
	}));
}

// Template D: hero del proyecto centrado + título abajo + URL arriba-dcha
export const GET: APIRoute<Props> = async ({ props }) => {
	const { entry } = props;
	const hero = await loadProjectHero(entry);

	return renderOgImage(
		heroOgTemplate({
			breadcrumb: "c12z.io/proyectos",
			title: entry.data.projectTitle,
			hero,
			footerUrl: `c12z.io/proyectos/${entry.id}`,
		}),
	);
};
