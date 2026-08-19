import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { loadCover, loadProjectHero } from "@/lib/og/load-cover.ts";
import {
	DEFAULT_LAYOUT,
	coverOgTemplate,
	heroOgTemplate,
	textOgTemplate,
	type OgLayoutOverrides,
} from "@/lib/og/og-templates";
import { renderOgImage } from "@/lib/og/render-og-image";

/**
 * HERRAMIENTA DE DESARROLLO — pareja de /og-playground.
 * Renderiza la imagen OG con las medidas recibidas por query param para
 * poder experimentar con el layout en vivo.
 *
 * prerender = false porque las rutas prerenderizadas no reciben query
 * params (ni siquiera en dev). El guard de PROD la deja inerte en
 * producción: nunca ejecuta el pipeline con input de terceros.
 */
export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	if (import.meta.env.PROD) {
		return new Response("Not found", { status: 404 });
	}

	const q = url.searchParams;

	const layout: OgLayoutOverrides = {};
	for (const key of Object.keys(
		DEFAULT_LAYOUT,
	) as (keyof OgLayoutOverrides)[]) {
		const raw = q.get(key);
		if (raw !== null && raw !== "" && !Number.isNaN(Number(raw))) {
			layout[key] = Number(raw);
		}
	}

	const template = q.get("template") ?? "B";
	const title = q.get("title") ?? "Sesgo de anclaje";
	const subtitle =
		q.get("subtitle") ??
		"¿Por qué comparamos todo con la primera información que recibimos?";
	const breadcrumb = q.get("breadcrumb") ?? "c12z.io/behavior/sesgos";
	const footerUrl =
		q.get("footerUrl") ?? "c12z.io/behavior/sesgos/sesgo-de-anclaje";

	if (template === "C") {
		const book = await getCollection("books");
		const cover = await loadCover(book[2]);
		return renderOgImage(
			coverOgTemplate({ title, subtitle, cover, footerUrl, layout }),
		);
	}

	if (template === "D") {
		const [firstProject] = await getCollection("projects");
		const hero = await loadProjectHero(firstProject);
		return renderOgImage(
			heroOgTemplate({ breadcrumb, title, hero, footerUrl, layout }),
		);
	}

	return renderOgImage(
		textOgTemplate({
			breadcrumb,
			title,
			subtitle: template === "A" ? undefined : subtitle,
			footerUrl,
			layout,
		}),
	);
};
