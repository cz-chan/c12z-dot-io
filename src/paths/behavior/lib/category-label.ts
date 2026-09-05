import type { BehaviorSectionKeys } from "@behavior-path/lib/card/behavior-fancycodes.ts";
import {
	BIASES_CATEGORY_LABELS,
	MENTAL_MODELS_CATEGORY_LABELS,
	DESIGN_LAWS_CATEGORY_LABELS,
} from "@/lib/content-categories/behavior-content.categories.ts";

/**
 * The one place a category slug turns into Spanish.
 *
 * Frontmatter stores the slug (`general-thinking`), the reader sees the label
 * ("pensamiento general"). Same split as `SOURCES_CATEGORY_LABELS`.
 */
const SECTION_LABELS: Record<BehaviorSectionKeys, Record<string, string>> = {
	biases: BIASES_CATEGORY_LABELS,
	mentalModels: MENTAL_MODELS_CATEGORY_LABELS,
	designLaws: DESIGN_LAWS_CATEGORY_LABELS,
};

export function categoryLabel(
	section: BehaviorSectionKeys,
	category: string,
): string {
	const label = SECTION_LABELS[section][category];

	if (!label) {
		throw new Error(
			`[category-label] no label for the "${category}" category of "${section}". Add it to the labels map.`,
		);
	}

	return label;
}
