import type {
	Site404ConfigInterface,
	SiteDefaultConfigInterface,
} from "@interfaces/siteInfo.interface.ts";

export const SITE_VERSION = "v1.10.01";

export const SITE_DEFAULT_CONFIG: SiteDefaultConfigInterface = {
	title: "Chema Ferrandez - c12z",
	description:
		"Un 'building(me) in public' donde comparto aquello que voy haciendo, aprendiendo y pensando en mi carrera sobre Growth, Behavioral Dev y Product.",
	url: "https://c12z.io",
	author: "Chema Ferrandez | cz",
	location: "es_ES",
	lang: "es-ES",
};

export const SITE_404_CONFIG: Site404ConfigInterface = {
	errorTitle: "Houston, tenemos un error 404",
	errorDescription:
		"Ha habido un problema con la página que estabas buscando y bueno... aquí estamos.",
	url: "https://c12z.io",
	author: "Chema Ferrandez | cz",
	location: "es_ES",
	lang: "es-ES",
};
