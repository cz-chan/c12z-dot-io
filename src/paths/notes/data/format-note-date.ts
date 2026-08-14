export function parseNoteDate(publishDate: string): Date {
	const [day, month, year] = publishDate.split("/").map(Number);

	return new Date(year, month - 1, day);
}

/** Convert date from DD/MM/YYYY into timeline: "7 jul 2026". */
export function formatNoteDate(publishDate: string): string {
	return new Intl.DateTimeFormat("es-ES", {
		day: "numeric",
		month: "short",
		year: "numeric",
	})
		.format(parseNoteDate(publishDate))
		.replace(".", "");
}
