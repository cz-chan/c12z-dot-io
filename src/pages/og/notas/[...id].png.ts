import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

import { textOgTemplate } from "@/lib/og/og-templates.ts";
import { renderOgImage } from "@/lib/og/render-og-image.ts";

export const prerender = true;

interface Props {
	entry: CollectionEntry<"notes">;
}

export async function getStaticPaths() {
	const notes = await getCollection("notes");

	return notes.map((entry) => ({
		params: { id: entry.id },
		props: { entry },
	}));
}

// Template B: título + subtítulo (el extracto de la nota)
export const GET: APIRoute<Props> = async ({ props }) => {
	const { entry } = props;

	return renderOgImage(
		textOgTemplate({
			breadcrumb: "c12z.io/notas",
			title: entry.data.title,
			subtitle: entry.data.excerpt,
			footerUrl: `c12z.io/notas/${entry.id}`,
		}),
	);
};
