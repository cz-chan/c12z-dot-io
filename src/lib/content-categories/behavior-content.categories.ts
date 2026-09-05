import { z } from "astro/zod";

const BIASES_CATEGORIES = [
	"speed",
	"memory",
	"perception",
	"context",
	"judgment",
] as const;

const MENTAL_MODELS_CATEGORIES = [
	"general-thinking",
	"physics-chemistry-biology",
	"systems",
	"mathematics",
	"economics",
	"military-and-war",
	"humanity-and-judgment",
] as const;

const DESIGN_LAWS_CATEGORIES = [
	"visual-composition",
	"interaction",
	"perception",
] as const;

export type BiasCategory = (typeof BIASES_CATEGORIES)[number];
export const BIASES_CATEGORY_LABELS: Record<BiasCategory, string> = {
	speed: "velocidad",
	memory: "memoria",
	perception: "percepción",
	context: "contexto",
	judgment: "juicio",
};

export type MentalModelCategory = (typeof MENTAL_MODELS_CATEGORIES)[number];
export const MENTAL_MODELS_CATEGORY_LABELS: Record<
	MentalModelCategory,
	string
> = {
	"general-thinking": "pensamiento general",
	"humanity-and-judgment": "humanidad y juicio",
	"military-and-war": "militar y guerra",
	"physics-chemistry-biology": "física, química y biología",
	economics: "economía",
	mathematics: "matemáticas",
	systems: "sistemas",
};

export type DesignLawCategory = (typeof DESIGN_LAWS_CATEGORIES)[number];
export const DESIGN_LAWS_CATEGORY_LABELS: Record<DesignLawCategory, string> = {
	"visual-composition": "composición visual",
	interaction: "interacción",
	perception: "percepción",
};

export const biasCategories = z.enum(BIASES_CATEGORIES);
export const mentalModelCategories = z.enum(MENTAL_MODELS_CATEGORIES);
export const designLawCategories = z.enum(DESIGN_LAWS_CATEGORIES);
