export const SECTION_CODES = {
	biases: "BSS",
	designLaws: "DSG",
	mentalModels: "MOD",
} as const;

// build a type only with behavior useful sections for this element
export type BehaviorSectionKeys = keyof typeof SECTION_CODES;

export const formatCode = (section: BehaviorSectionKeys, num: number) =>
	`${SECTION_CODES[section]}-${String(num).padStart(3, "0")}`;
