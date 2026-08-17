import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

import { textOgTemplate } from "@/lib/og/og-templates";
import { renderOgImage } from "@/lib/og/render-og-image";

export const prerender = true;

interface Props {
	entry: CollectionEntry<"biases">;
}

export async function getStaticPaths() {
	const biases = await getCollection("biases");

	return biases.map((entry) => ({
		params: { id: entry.id },
		props: { entry },
	}));
}

// Template B: título + subtítulo (la pregunta del sesgo), sin carátula
export const GET: APIRoute<Props> = async ({ props }) => {
	const { entry } = props;

	return renderOgImage(
		textOgTemplate({
			breadcrumb: "c12z.io/behavior/sesgos",
			title: entry.data.title,
			subtitle: entry.data.question,
			footerUrl: `c12z.io/behavior/sesgos/${entry.id}`,
		}),
	);
};
