/** Escribe la ruta que ha fallado dentro del texto del 404. */
export function initErrorPath() {
	const pathElement = document.getElementById("error-in-path");
	if (!pathElement) return;

	pathElement.textContent = window.location.pathname;
}
