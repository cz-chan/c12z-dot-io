import fs from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";
import type { CollectionEntry } from "astro:content";

export interface OgCover {
	dataUri: string;
	width: number;
	height: number;
}

/** Caja máxima que ocupa la carátula en el Template C. */
const MAX_COVER_WIDTH = 260;
const MAX_COVER_HEIGHT = 420;

type EntryWithCover = CollectionEntry<"books"> | CollectionEntry<"projects">;

/**
 * Resuelve la ruta en disco de la imagen `cover.src` de una entrada de
 * contenido y la devuelve como data URI PNG/JPEG con sus dimensiones
 * naturales. El rasterizador interno de @vercel/og (resvg-wasm) no
 * garantiza soporte WebP, así que cualquier formato distinto de jpg/png se
 * convierte al vuelo con sharp, sin tocar los archivos fuente del repo.
 */
async function loadCoverImage(entry: EntryWithCover): Promise<OgCover> {
	const coverMeta = entry.data.cover.src as ImageMetadata & {
		fsPath?: string;
	};

	let coverPath = coverMeta.fsPath;
	if (!coverPath) {
		// Fallback: el nombre del archivo sale del frontmatter crudo del index.mdx
		if (!entry.filePath) {
			throw new Error(`Entrada sin filePath: ${entry.id}`);
		}
		const entryPath = path.resolve(process.cwd(), entry.filePath);
		const raw = await fs.readFile(entryPath, "utf-8");
		const match = raw.match(/cover:\s*\n\s+src:\s*["']?([^"'\n]+?)["']?\s*$/m);
		if (!match) {
			throw new Error(`No se encontró cover.src en el frontmatter de ${entry.id}`);
		}
		coverPath = path.resolve(path.dirname(entryPath), match[1]);
	}

	const buffer = await fs.readFile(coverPath);
	const ext = path.extname(coverPath).toLowerCase();

	const metadata = await sharp(buffer).metadata();
	const width = metadata.width ?? MAX_COVER_WIDTH;
	const height = metadata.height ?? MAX_COVER_HEIGHT;

	if (ext === ".jpg" || ext === ".jpeg") {
		return {
			dataUri: `data:image/jpeg;base64,${buffer.toString("base64")}`,
			width,
			height,
		};
	}
	if (ext === ".png") {
		return {
			dataUri: `data:image/png;base64,${buffer.toString("base64")}`,
			width,
			height,
		};
	}
	const png = await sharp(buffer).png().toBuffer();
	return {
		dataUri: `data:image/png;base64,${png.toString("base64")}`,
		width,
		height,
	};
}

/**
 * Carátula de un post de `books`, con sus dimensiones ya escaladas para
 * encajar en la caja 260×420 del Template C sin recortes.
 */
export async function loadCover(
	entry: CollectionEntry<"books">,
): Promise<OgCover> {
	const cover = await loadCoverImage(entry);
	const scale = Math.min(
		MAX_COVER_WIDTH / cover.width,
		MAX_COVER_HEIGHT / cover.height,
	);
	return {
		dataUri: cover.dataUri,
		width: Math.round(cover.width * scale),
		height: Math.round(cover.height * scale),
	};
}

/**
 * Hero de un proyecto (su `cover` del frontmatter, la imagen que vive en
 * src/content/project/{slug}/). Devuelve dimensiones NATURALES: el encaje
 * en caja lo hace heroOgTemplate con las medidas del layout, para que sean
 * ajustables desde el playground.
 */
export async function loadProjectHero(
	entry: CollectionEntry<"projects">,
): Promise<OgCover> {
	return loadCoverImage(entry);
}
