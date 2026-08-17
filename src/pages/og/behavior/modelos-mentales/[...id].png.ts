import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

import { textOgTemplate } from "@/lib/og/og-templates.ts";
import { renderOgImage } from "@/lib/og/render-og-image.ts";

export const prerender = true;

interface Props {
	entry: CollectionEntry<"mentalModels">;
}

export async function getStaticPaths() {
	const models = await getCollection("mentalModels");

	return models.map((entry) => ({
		params: { id: entry.id },
		props: { entry },
	}));
}

// Template B: título + subtítulo (la pregunta del modelo), sin carátula
export const GET: APIRoute<Props> = async ({ props }) => {
	const { entry } = props;

	return renderOgImage(
		textOgTemplate({
			breadcrumb: "c12z.io/behavior/modelos-mentales",
			title: entry.data.title,
			subtitle: entry.data.question,
			footerUrl: `c12z.io/behavior/modelos-mentales/${entry.id}`,
		}),
	);
};
