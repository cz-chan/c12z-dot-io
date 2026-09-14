// https://schema.org/Organization
// https://schema.org/WebApplication
// https://schema.org/CreativeWork
// https://schema.org/Person

import { z } from "astro/zod";

export const PERSON_ID = "https://c12z.io/#person";

const httpsValidator = z.url({ protocol: /^https$/ });

const projectSchema = z.object({
	type: z.enum(["Organization", "WebApplication", "CreativeWork"]),
	name: z.string().min(3).max(60),
	url: httpsValidator,
	description: z.string().max(160).optional(),
	logo: httpsValidator.optional(),
});

const projectsSchema = z.array(projectSchema);

// convert into TS schema
export type Project = z.infer<typeof projectSchema>;

const ID_SUFFIX: Record<Project["type"], string> = {
	Organization: "org",
	WebApplication: "app",
	CreativeWork: "creative",
};

export const projectId = ({ type, url }: Pick<Project, "type" | "url">) =>
	`${new URL(url).origin}/#${ID_SUFFIX[type]}`;

export const parseProjectsSchema = (project: Project) => {
	const { name, type, url, description, logo } = projectSchema.parse(project);
	const relation = type === "Organization" ? "founder" : "creator";

	return {
		"@type": type,
		"@id": projectId({ type, url }),
		name,
		url,
		...(description && { description }),
		...(logo && { logo }),
		[relation]: { "@id": PERSON_ID },
	};
};

export const projectsToSchema = (projects: Project[]) =>
	projects.map(parseProjectsSchema);
