/**
 * Every date in the frontmatter is DD/MM/YYYY, and this is the ONLY place
 * that turns one into a `Date`. Doing it by hand is not optional:
 * `new Date("02/06/2026")` reads the string as month/day (US order) and
 * `new Date("24/06/2026")` is an Invalid Date outright.
 */
export const parseDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split("/").map(Number);
  return new Date(year, month - 1, day); // Month está basado en 0, por eso restamos 1 al mes
};

export const isValidDateFormat = (dateString: string): boolean => {
  const dateFormatMustBe = /^\d{2}\/\d{2}\/\d{4}$/; // Expresión regular para DD/MM/YYYY

  if (!dateFormatMustBe.test(dateString))
    throw new Error("The date must be in the format DD/MM/YYYY!");

  const [day, month, year] = dateString.split("/").map(Number);
  const date = parseDate(dateString);

  // Si la fecha no existe (31/02), el Date se desborda al mes siguiente y
  // estos tres valores dejan de coincidir con lo escrito
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(
      "The date is invalid, make sure you have spelled the date correctly. Remember, it must be DD/MM/YYYY and be real!"
    );
  }

  return true;
};

// Función para convertir la fecha en ISO para las metatags
export const convertDateToISO8601 = (dateString: string): string => {
  isValidDateFormat(dateString);
  return parseDate(dateString).toISOString();
};
