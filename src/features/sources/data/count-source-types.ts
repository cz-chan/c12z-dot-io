import { pluralize } from "@utils/pluralize.ts";

import { TYPE_LABELS, type Source } from "./source-types.ts";

/** one entry of the header summary: the figure apart from its label */
export interface TypeTally {
	numb: number;
	label: string;
}

/**
 * How many sources of each type a topic keeps, in order of first
 * appearance (a Map preserves insertion order, same as the object literal
 * this replaced).
 */
export const countSourceTypes = (
	sources: Source[], // all sources in behavior/* follow the sames structure
): Map<Source["type"], number> => {
	const counts = new Map<Source["type"], number>();
	for (const source of sources) {
		counts.set(source.type, (counts.get(source.type) ?? 0) + 1);
	}
	return counts;
};

/**
 * The header summary ("2 libros · 1 cita"), kept as pairs and not as a
 * joined string: each type is its own unit in the header.
 */
export const buildTally = (counts: Map<Source["type"], number>): TypeTally[] =>
	[...counts].map(([type, numb]) => ({
		numb,
		label: pluralize(numb, TYPE_LABELS[type]),
	}));
