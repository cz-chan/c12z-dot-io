import type { BehaviorSectionKeys } from "@behavior-path/lib/card/behavior-fancycodes.ts";

/**
 * The one place a category turns into colour.
 *
 * Every category has two: `surface` is the solid one — the card chip, the
 * barcode, the pill on the post — and `band` is the darker companion the card
 * uses for its bottom strip.
 */
interface CategoryColors {
	surface: string;
	band: string;
}

const CATEGORY_COLORS: Record<
	BehaviorSectionKeys,
	Record<string, CategoryColors>
> = {
	biases: {
		velocidad: {
			surface: "var(--c-bias-category-speed-surface)",
			band: "var(--c-bias-category-speed-band)",
		},
		memoria: {
			surface: "var(--c-bias-category-memory-surface)",
			band: "var(--c-bias-category-memory-band)",
		},
		juicio: {
			surface: "var(--c-bias-category-judgment-surface)",
			band: "var(--c-bias-category-judgment-band)",
		},
		contexto: {
			surface: "var(--c-bias-category-context-surface)",
			band: "var(--c-bias-category-context-band)",
		},
		percepción: {
			surface: "var(--c-bias-category-perception-surface)",
			band: "var(--c-bias-category-perception-band)",
		},
	},
	mentalModels: {
		"pensamiento general": {
			surface: "var(--c-model-category-general-surface)",
			band: "var(--c-model-category-general-band)",
		},
		"física, química y biología": {
			surface: "var(--c-model-category-science-surface)",
			band: "var(--c-model-category-science-band)",
		},
		sistemas: {
			surface: "var(--c-model-category-systems-surface)",
			band: "var(--c-model-category-systems-band)",
		},
		matematicas: {
			surface: "var(--c-model-category-maths-surface)",
			band: "var(--c-model-category-maths-band)",
		},
		economía: {
			surface: "var(--c-model-category-economics-surface)",
			band: "var(--c-model-category-economics-band)",
		},
		"militar y guerra": {
			surface: "var(--c-model-category-war-surface)",
			band: "var(--c-model-category-war-band)",
		},
		"humanidad y juicio": {
			surface: "var(--c-model-category-judgment-surface)",
			band: "var(--c-model-category-judgment-band)",
		},
	},
	designLaws: {
		"composición visual": {
			surface: "var(--c-design-category-layout-surface)",
			band: "var(--c-design-category-layout-band)",
		},
		interacción: {
			surface: "var(--c-design-category-interaction-surface)",
			band: "var(--c-design-category-interaction-band)",
		},
		percepción: {
			surface: "var(--c-design-category-perception-surface)",
			band: "var(--c-design-category-perception-band)",
		},
	},
};

export function getCategoryColors(
	section: BehaviorSectionKeys,
	category: string,
): CategoryColors {
	const colors = CATEGORY_COLORS[section][category];

	if (!colors) {
		throw new Error(
			`[category-colors] no colour for the "${category}" category of "${section}". Add it to CATEGORY_COLORS.`,
		);
	}

	return colors;
}

/** Ready to drop into an `style` attribute. */
export function categoryStyle(
	section: BehaviorSectionKeys,
	category: string,
): string {
	const { surface, band } = getCategoryColors(section, category);

	return `--cat-surface: ${surface}; --cat-band: ${band};`;
}
