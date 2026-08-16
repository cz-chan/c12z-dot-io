import { COLLECTION_KEYS } from "@/global/collection-keys";
import type { BehaviorSectionConfig } from "./behavior-sect.types";

export const BehaviorSectionData: BehaviorSectionConfig[] = [
	{
		href: "/behavior/sesgos",
		name: "Sesgos cognitivos",
		title: "Sesgos cognitivos",
		eyebrow: "Sección 01 /sesgos",
		transitionName: "bias-header-page-h1-transition-name",
		description:
			"Inclinaciones desproporcionadas a favor o en contra de una idea o cosa, por lo general de forma inexacta, prejuiciosa o injusta.",
		collection: COLLECTION_KEYS.biases,
	},
	{
		href: "/behavior/modelos-mentales",
		name: "Modelos mentales",
		title: "Modelos mentales",
		eyebrow: "Sección 02 /modelos",
		transitionName: "mental-models-header-page-h1-transition-name",
		description:
			"Formas simplificadas de explicar de cómo funcionan las cosas.",
		collection: COLLECTION_KEYS.mentalModels,
	},
	{
		href: "/behavior/diseño",
		name: "Leyes de diseño",
		title: "Leyes de diseño",
		eyebrow: "Sección 03 /diseño",
		transitionName: "design-law-header-page-h1-transition-name",
		description:
			"Un campo que combina la psicología, la economía conductual y el diseño para entender las acciones humanas e influir en ellas.",
		collection: COLLECTION_KEYS.designLaws,
	},
	{
		href: "/behavior/fuentes",
		name: "Fuentes",
		title: "Fuentes.",
		eyebrow: "Sección 04 /fuentes",
		transitionName: "sources-header-page-h1-transition-name",
		description:
			"El cajón donde guardo todas las fuentes en las que me he basado para escribir sobre los temas de esta sección.",
		collection: null,
	},
];
