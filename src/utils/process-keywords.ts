import type { PageKeywords } from "@/lib/keywords.ts";

export default function processKeywords(
	pageKeywords: PageKeywords | string[],
): PageKeywords {
	if (!pageKeywords) {
		return { keywords: [] };
	}

	// Si es un array, usarlo directamente
	// Si es un objeto PageKeywords, usar su propiedad keywords
	const keywords = Array.isArray(pageKeywords)
		? pageKeywords
		: pageKeywords.keywords;

	const uniqueKeywords = Array.from(
		new Set(keywords.map((kw) => kw.toLowerCase().trim().replace(/\s+/g, "-"))),
	);

	return { keywords: uniqueKeywords };
}

// export default function processKeywords(pageKeywords: {
//   keywords: string[];
// }): PageKeywords {
//   const uniqueKeywords = Array.from(
//     new Set(
//       pageKeywords.keywords.map((kw) =>
//         kw.toLowerCase().trim().replace(/\s+/g, "-")
//       )
//     )
//   );
//   return { keywords: uniqueKeywords };
// }
