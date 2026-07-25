/**
 * Turns the DD/MM/YYYY dates of the frontmatter into a Date, so they can be
 * sorted. `new Date("02/06/2026")` would read that as month/day (US order),
 * hence the manual split.
 */
export const parseSourceDate = (dateString: string): Date => {
	const [day, month, year] = dateString.split("/").map(Number);
	return new Date(year, month - 1, day);
};
