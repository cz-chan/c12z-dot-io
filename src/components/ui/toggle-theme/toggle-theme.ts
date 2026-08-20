/**
 * Alterna `data-theme` en <html> y lo recuerda en localStorage.
 * El tema inicial lo pinta BaseHead antes del paint; esto solo lo cambia.
 */
export function initToggleTheme() {
	const btn = document.getElementById("theme-toggle");
	if (!btn) return;

	btn.addEventListener("click", () => {
		const current = document.documentElement.dataset.theme ?? "dark";
		const next = current === "light" ? "dark" : "light";

		const apply = () => {
			document.documentElement.dataset.theme = next;
			localStorage.setItem("theme", next);
		};

		if (document.startViewTransition) {
			// Los catch no son opcionales. Al pulsar dos veces seguidas —o al
			// navegar mientras corre— el navegador descarta la transición y
			// rechaza sus promesas; sin catch salen como excepciones sueltas en
			// consola. Hay que silenciar `ready` y `finished` por separado:
			// rechazan las dos, así que atrapar solo una deja la mitad del ruido.
			// El tema se aplica igual, no hay nada que recuperar.
			const transition = document.startViewTransition(apply);
			transition.ready.catch(() => {});
			transition.finished.catch(() => {});
		} else {
			apply();
		}
	});
}
