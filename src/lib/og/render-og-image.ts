import { ImageResponse } from "@vercel/og";
import sharp from "sharp";

import { cascadiaFont, tamagoFont } from "@/lib/og/og-assets.ts";

/**
 * Rasteriza un árbol de nodos (og-templates) a PNG 1200×630 con las dos
 * fuentes del diseño ya registradas. El PNG RGBA que devuelve ImageResponse
 * se recomprime con paleta de 256 colores (~50% menos peso, sin pérdida
 * visual apreciable) manteniendo formato PNG por compatibilidad con los
 * scrapers de OG (LinkedIn/WhatsApp no garantizan WebP).
 */
export async function renderOgImage(node: unknown): Promise<Response> {
	// biome-ignore lint: ImageResponse espera un ReactElement; los nodos planos de Satori son compatibles en runtime
	const rawImage = new ImageResponse(node as any, {
		width: 1200,
		height: 630,
		fonts: [
			{ name: "Tamago", data: tamagoFont, weight: 400, style: "normal" },
			{
				name: "Cascadia Code Medium",
				data: cascadiaFont,
				weight: 500,
				style: "normal",
			},
		],
	});

	const rawBuffer = Buffer.from(await rawImage.arrayBuffer());
	const optimized = await sharp(rawBuffer)
		.png({ palette: true, quality: 90, compressionLevel: 9 })
		.toBuffer();

	return new Response(optimized, {
		headers: { "Content-Type": "image/png" },
	});
}
