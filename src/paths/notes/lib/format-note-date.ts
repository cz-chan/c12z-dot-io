import { parseDate } from "@/utils/validating-date.ts";

/** Convert date from DD/MM/YYYY into timeline: "7 jul 2026". */
export function formatNoteDate(publishDate: string): string {
	return new Intl.DateTimeFormat("es-ES", {
		day: "numeric",
		month: "short",
		year: "numeric",
	})
		.format(parseDate(publishDate))
		.replace(".", "");
}
