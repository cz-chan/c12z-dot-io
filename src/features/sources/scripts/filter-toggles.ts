/**
 * the drawer's (sources-filters.ts) and a topic's (topic-filters.ts).
 * Both are the same * mechanism over different `data-*`: a set of toggles
 * that never re-renders anything, it only hides.
 *
 * Two rules hold for both, and they are the reason this file exists:
 *
 *   - only `data-*` and `hidden`, never classes: CSS Module class names are
 *     hashed at build time (`_folder_1h04g_344`), so `classList.add("folder")`
 *     from a script would do nothing;
 *   - guarded by `data-init`, because they re-run on `astro:page-load` and
 *     the listeners live on elements the view transition replaces.
 */

/**
 * The root, but only the first time it is seen: returns null if this render
 * was already initialised, so the caller bails out with a single check.
 */
export const claimRoot = (selector: string): HTMLElement | null => {
	const root = document.querySelector<HTMLElement>(selector);
	if (!root || root.dataset.init === "true") return null;
	root.dataset.init = "true";
	return root;
};

/** an empty selection filters nothing: none selected = all pass */
export const passes = (selected: Set<string>, value = "") =>
	selected.size === 0 || selected.has(value);

/**
 * Wires every `[attribute]` button in `root` as a toggle over `selected`:
 * click flips its value in the set, updates `aria-pressed` and calls
 * `onChange`. They are toggles and not radios — several at once, or none.
 *
 * `attribute` is the full name ("data-filter-kind") and the value is read
 * with `getAttribute`, which keeps it identical to the markup — no
 * dataset camelCase to convert.
 *
 * This btn/filter connect types with apply filter. For each btn/filter read the
 * attribute, if the Set contains the attribute, all of them switch the data set
 * to "data-off"
 */
export const bindToggles = (
	root: HTMLElement,
	attribute: string,
	selected: Set<string>,
	onChange: () => void,
) => {
	for (const btn of root.querySelectorAll<HTMLButtonElement>(
		`[${attribute}]`,
	)) {
		const value = btn.getAttribute(attribute);
		if (!value) continue;

		btn.addEventListener("click", () => {
			const on = !selected.has(value);
			if (on) selected.add(value);
			else selected.delete(value);

			btn.setAttribute("aria-pressed", String(on));
			onChange();
		});
	}
};
