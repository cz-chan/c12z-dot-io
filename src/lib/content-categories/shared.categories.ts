export const SHARED_CATEGORIES = [
	"product",
	"psychology",
	"economics",
	"business",
	"health",
	"culture",
	"creativity",
	"philosophy",
] as const;

type SharedCategory = (typeof SHARED_CATEGORIES)[number];

export const SHARED_CATEGORY_LABELS: Record<SharedCategory, string> = {
	product: "producto",
	psychology: "psicología",
	economics: "economía",
	business: "negocio",
	health: "salud",
	culture: "cultura",
	creativity: "creatividad",
	philosophy: "filosofía",
};
