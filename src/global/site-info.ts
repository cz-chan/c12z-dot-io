export interface SiteDefaultConfig {
	title: string;
	description: string;
	url: string;
	author: string;
	location: string;
	lang: string;
}

export interface Site404Config {
	errorTitle: string;
	errorDescription: string;
	url: string;
	author: string;
	location: string;
	lang: string;
}

export const SITE_VERSION = "v1.10.02";

export const SITE_DEFAULT_CONFIG: SiteDefaultConfig = {
	title: "Chema Ferrandez - c12z",
	description:
		"Un 'building(me) in public' donde comparto aquello que voy haciendo, aprendiendo y pensando en mi carrera sobre Growth, Behavioral Dev y Product.",
	url: "https://c12z.io",
	author: "Chema Ferrandez | cz",
	location: "es_ES",
	lang: "es-ES",
};

export const SITE_404_CONFIG: Site404Config = {
	errorTitle: "Houston, tenemos un error 404",
	errorDescription:
		"Ha habido un problema con la página que estabas buscando y bueno... aquí estamos.",
	url: "https://c12z.io",
	author: "Chema Ferrandez | cz",
	location: "es_ES",
	lang: "es-ES",
};
