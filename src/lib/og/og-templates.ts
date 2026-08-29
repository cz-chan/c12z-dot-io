import { backgroundDataUri, logoDataUri } from "@/lib/og/og-assets.ts";

/**
 * Árboles de nodos (formato Satori, sin JSX) para los 4 templates OG:
 * - Texto (Template A/B): título grande, subtítulo opcional
 * - Carátula (Template C): portada de libro + título + autor
 * - Proyecto (Template D): protada del proyecto + título del proyecto
 *
 * Canvas 1200×630. Todas las medidas viven en DEFAULT_LAYOUT; los templates
 * aceptan overrides parciales (usado por /og-playground para experimentar).
 */

export const DEFAULT_LAYOUT = {
	// Header (logo + breadcrumb)
	headerTop: 35,
	headerLeft: 40,
	headerGap: 25,
	logoSize: 68,
	headerFontSize: 40,
	// Bloque de título (Templates A/B)
	titleTop: 180,
	titleLeft: 48,
	titleWidth: 1050,
	titleFontSize: 0, // 0 = automático según longitud del texto
	titleLineHeight: 1,
	// Subtítulo (Template B)
	subtitleMarginTop: 20,
	subtitleFontSize: 35,
	// Footer (URL completa)
	footerBottom: 44,
	footerRight: 48,
	footerFontSize: 27,
	// Template C (carátula + columna de texto)
	coverTop: 150,
	coverLeft: 88,
	coverTextTop: 150,
	coverTextLeft: 420,
	coverTextWidth: 700,
	coverSubtitleMarginTop: 25,
	coverSubtitleFontSize: 35,
	// Template D (hero de proyecto centrado + título abajo + URL arriba-dcha)
	heroTop: 135,
	heroWidth: 850,
	heroHeight: 360,
	heroBorderWidth: 2,
	heroTitleBottom: 40,
	heroTitleFontSize: 70, // 0 = automático según longitud del texto
	heroUrlTop: 60,
} as const;

export type OgLayout = {
	-readonly [K in keyof typeof DEFAULT_LAYOUT]: number;
};
export type OgLayoutOverrides = Partial<OgLayout>;

type OgNode = {
	type: string;
	props: {
		style?: Record<string, string | number>;
		children?: OgNode | OgNode[] | string;
		src?: string;
		width?: number;
		height?: number;
	};
};

const COLOR_TITLE = "#fcf8f1";
const COLOR_TEXT = "#dfdbd5";

/** Ancho de la caja de la carátula (ver load-cover.ts); centra en horizontal. */
const COVER_BOX_WIDTH = 260;

const background: OgNode = {
	type: "img",
	props: {
		src: backgroundDataUri,
		width: 1200,
		height: 630,
		style: { position: "absolute", top: 0, left: 0 },
	},
};

const header = (breadcrumb: string, l: OgLayout): OgNode => ({
	type: "div",
	props: {
		style: {
			position: "absolute",
			top: l.headerTop,
			left: l.headerLeft,
			display: "flex",
			alignItems: "center",
			gap: l.headerGap,
		},
		children: [
			{
				type: "img",
				props: { src: logoDataUri, width: l.logoSize, height: l.logoSize },
			},
			{
				type: "div",
				props: {
					style: {
						fontFamily: "Tamago",
						fontSize: l.headerFontSize,
						color: COLOR_TITLE,
						display: "flex",
					},
					children: breadcrumb,
				},
			},
		],
	},
});

const footer = (url: string, l: OgLayout): OgNode => ({
	type: "div",
	props: {
		style: {
			position: "absolute",
			bottom: l.footerBottom,
			right: l.footerRight,
			fontFamily: "Cascadia Code Medium",
			fontSize: l.footerFontSize,
			color: COLOR_TITLE,
			display: "flex",
		},
		children: url,
	},
});

/** Reduce el tamaño del título según su longitud para evitar overflow. */
const autoTitleFontSize = (title: string, isCoverLayout: boolean) => {
	if (isCoverLayout) {
		if (title.length <= 30) return 68;
		if (title.length <= 48) return 56;
		return 46;
	}
	if (title.length <= 34) return 84;
	if (title.length <= 55) return 68;
	return 56;
};

const root = (children: OgNode[]): OgNode => ({
	type: "div",
	props: {
		style: {
			width: 1200,
			height: 630,
			display: "flex",
			position: "relative",
			backgroundColor: "#111",
		},
		children,
	},
});

interface TextTemplateProps {
	breadcrumb: string;
	title: string;
	subtitle?: string;
	footerUrl: string;
	layout?: OgLayoutOverrides;
}

/** Template A (sin subtítulo) y Template B (con subtítulo). */
export function textOgTemplate({
	breadcrumb,
	title,
	subtitle,
	footerUrl,
	layout,
}: TextTemplateProps): OgNode {
	const l: OgLayout = { ...DEFAULT_LAYOUT, ...layout };

	const titleBlock: OgNode = {
		type: "div",
		props: {
			style: {
				position: "absolute",
				top: l.titleTop,
				left: l.titleLeft,
				width: l.titleWidth,
				display: "flex",
				flexDirection: "column",
			},
			children: [
				{
					type: "div",
					props: {
						style: {
							fontFamily: "Tamago",
							fontSize: l.titleFontSize || autoTitleFontSize(title, false),
							lineHeight: l.titleLineHeight,
							color: COLOR_TITLE,
							display: "flex",
						},
						children: title,
					},
				},
				...(subtitle
					? [
							{
								type: "div",
								props: {
									style: {
										marginTop: l.subtitleMarginTop,
										fontFamily: "Cascadia Code Medium",
										fontSize: l.subtitleFontSize,
										lineHeight: 1.4,
										color: COLOR_TEXT,
										display: "flex",
									},
									children: subtitle,
								},
							} satisfies OgNode,
						]
					: []),
			],
		},
	};

	return root([
		background,
		header(breadcrumb, l),
		titleBlock,
		footer(footerUrl, l),
	]);
}

interface CoverTemplateProps {
	title: string;
	subtitle: string;
	cover: { dataUri: string; width: number; height: number };
	footerUrl: string;
	layout?: OgLayoutOverrides;
}

/** Template C: carátula a la izquierda, título + autor a la derecha. */
export function coverOgTemplate({
	title,
	subtitle,
	cover: coverImage,
	footerUrl,
	layout,
}: CoverTemplateProps): OgNode {
	const l: OgLayout = { ...DEFAULT_LAYOUT, ...layout };

	// La carátula llega ya escalada a la caja 260×420. Se ancla ARRIBA:
	// su borde superior cae siempre en coverTop, sea cuadrada o alargada,
	// para que todas arranquen a la misma altura que el texto.
	const cover: OgNode = {
		type: "img",
		props: {
			src: coverImage.dataUri,
			width: coverImage.width,
			height: coverImage.height,
			style: {
				position: "absolute",
				top: l.coverTop,
				left:
					l.coverLeft + Math.round((COVER_BOX_WIDTH - coverImage.width) / 2),
				borderRadius: 10,
			},
		},
	};

	const textColumn: OgNode = {
		type: "div",
		props: {
			style: {
				position: "absolute",
				top: l.coverTextTop,
				left: l.coverTextLeft,
				width: l.coverTextWidth,
				display: "flex",
				flexDirection: "column",
			},
			children: [
				{
					type: "div",
					props: {
						style: {
							fontFamily: "Tamago",
							fontSize: l.titleFontSize || autoTitleFontSize(title, true),
							lineHeight: l.titleLineHeight,
							color: COLOR_TITLE,
							display: "flex",
						},
						children: title,
					},
				},
				{
					type: "div",
					props: {
						style: {
							marginTop: l.coverSubtitleMarginTop,
							fontFamily: "Cascadia Code Medium",
							fontSize: l.coverSubtitleFontSize,
							color: COLOR_TEXT,
							display: "flex",
						},
						children: subtitle,
					},
				},
			],
		},
	};

	return root([
		background,
		header("c12z.io", l),
		cover,
		textColumn,
		footer(footerUrl, l),
	]);
}

interface HeroTemplateProps {
	breadcrumb: string;
	title: string;
	hero: { dataUri: string; width: number; height: number };
	footerUrl: string;
	layout?: OgLayoutOverrides;
}

/**
 * Template D (proyectos): hero/screenshot del proyecto centrado, título
 * grande abajo y la URL completa arriba a la derecha (en vez de footer).
 * El hero llega con dimensiones naturales y aquí se encaja en la caja
 * heroWidth×heroHeight sin recortes.
 */
export function heroOgTemplate({
	breadcrumb,
	title,
	hero: heroImage,
	footerUrl,
	layout,
}: HeroTemplateProps): OgNode {
	const l: OgLayout = { ...DEFAULT_LAYOUT, ...layout };

	const scale = Math.min(
		l.heroWidth / heroImage.width,
		l.heroHeight / heroImage.height,
	);
	const heroWidth = Math.round(heroImage.width * scale);
	const heroHeight = Math.round(heroImage.height * scale);

	const hero: OgNode = {
		type: "img",
		props: {
			src: heroImage.dataUri,
			width: heroWidth,
			height: heroHeight,
			style: {
				position: "absolute",
				top: l.heroTop + Math.round((l.heroHeight - heroHeight) / 2),
				left: Math.round((1200 - heroWidth) / 2),
				border: `${l.heroBorderWidth}px solid ${COLOR_TITLE}`,
			},
		},
	};

	const urlTopRight: OgNode = {
		type: "div",
		props: {
			style: {
				position: "absolute",
				top: l.heroUrlTop,
				right: l.footerRight,
				fontFamily: "Cascadia Code Medium",
				fontSize: l.footerFontSize,
				color: COLOR_TITLE,
				display: "flex",
			},
			children: footerUrl,
		},
	};

	const titleBottom: OgNode = {
		type: "div",
		props: {
			style: {
				position: "absolute",
				bottom: l.heroTitleBottom,
				left: 50,
				width: 1100,
				display: "flex",
				justifyContent: "center",
				textAlign: "center",
				fontFamily: "Tamago",
				fontSize: l.heroTitleFontSize || autoTitleFontSize(title, false),
				lineHeight: l.titleLineHeight,
				color: COLOR_TITLE,
			},
			children: title,
		},
	};

	return root([
		background,
		header(breadcrumb, l),
		urlTopRight,
		hero,
		titleBottom,
	]);
}
