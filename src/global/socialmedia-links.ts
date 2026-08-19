export interface SocialLink {
	name: string;
	url: string;
	userName: string;
	title: string;
}

export type SocialLinks = Record<string, SocialLink>;

export const SOCIAL_LINKS: SocialLinks = {
	github: {
		name: "Github",
		url: "https://github.com/cz-chan",
		userName: "cz-chan",
		title: "ir a Github de Chema Ferrández - cz",
	},
	twitter: {
		name: "Twitter/𝕏",
		url: "https://x.com/cz__chan",
		userName: "@cz__chan",
		title: "ir a Twitter/𝕏 de Chema Ferrández - cz",
	},
	linkedin: {
		name: "LinkedIn",
		url: "https://www.linkedin.com/in/chemaferrandez/",
		userName: "ChemaFerrandez",
		title: "ir a LinkedIn de Chema Ferrández - cz",
	},
	substack: {
		name: "Substack",
		url: "https://czchan.substack.com",
		userName: "@czchan",
		title: "ir a Substack de Chema Ferrández - cz",
	},
	goodreads: {
		name: "Goodreads",
		url: "goodreads.com/cz__chan",
		userName: "cz__chan",
		title: "ir a Goodreads de Chema Ferrández - cz",
	},
};
