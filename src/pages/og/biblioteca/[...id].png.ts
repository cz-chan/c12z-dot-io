import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

import { loadCover } from "@/lib/og/load-cover";
import { coverOgTemplate } from "@/lib/og/og-templates";
import { renderOgImage } from "@/lib/og/render-og-image";

export const prerender = true;

interface Props {
	entry: CollectionEntry<"books">;
}

export async function getStaticPaths() {
	const books = await getCollection("books");

	return books.map((entry) => ({
		params: { id: entry.id },
		props: { entry },
	}));
}

// Template C: carátula del libro + título + autor
export const GET: APIRoute<Props> = async ({ props }) => {
	const { entry } = props;
	const { title, authors } = entry.data;

	const authorsInArray = Array.isArray(authors) ? authors : [authors];
	const cover = await loadCover(entry);

	return renderOgImage(
		coverOgTemplate({
			title,
			subtitle: authorsInArray[0].name,
			cover,
			footerUrl: `c12z.io/biblioteca/${entry.id}`,
		}),
	);
};
