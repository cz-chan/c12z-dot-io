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
		speed: {
			surface: "var(--c-bias-category-speed-surface)",
			band: "var(--c-bias-category-speed-band)",
		},
		memory: {
			surface: "var(--c-bias-category-memory-surface)",
			band: "var(--c-bias-category-memory-band)",
		},
		judgment: {
			surface: "var(--c-bias-category-judgment-surface)",
			band: "var(--c-bias-category-judgment-band)",
		},
		context: {
			surface: "var(--c-bias-category-context-surface)",
			band: "var(--c-bias-category-context-band)",
		},
		perception: {
			surface: "var(--c-bias-category-perception-surface)",
			band: "var(--c-bias-category-perception-band)",
		},
	},
	mentalModels: {
		"general-thinking": {
			surface: "var(--c-model-category-general-surface)",
			band: "var(--c-model-category-general-band)",
		},
		"physics-chemistry-biology": {
			surface: "var(--c-model-category-science-surface)",
			band: "var(--c-model-category-science-band)",
		},
		systems: {
			surface: "var(--c-model-category-systems-surface)",
			band: "var(--c-model-category-systems-band)",
		},
		mathematics: {
			surface: "var(--c-model-category-maths-surface)",
			band: "var(--c-model-category-maths-band)",
		},
		economics: {
			surface: "var(--c-model-category-economics-surface)",
			band: "var(--c-model-category-economics-band)",
		},
		"military-and-war": {
			surface: "var(--c-model-category-war-surface)",
			band: "var(--c-model-category-war-band)",
		},
		"humanity-and-judgment": {
			surface: "var(--c-model-category-judgment-surface)",
			band: "var(--c-model-category-judgment-band)",
		},
	},
	designLaws: {
		"visual-composition": {
			surface: "var(--c-design-category-layout-surface)",
			band: "var(--c-design-category-layout-band)",
		},
		interaction: {
			surface: "var(--c-design-category-interaction-surface)",
			band: "var(--c-design-category-interaction-band)",
		},
		perception: {
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
