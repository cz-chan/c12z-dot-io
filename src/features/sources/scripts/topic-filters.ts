import { bindToggles, claimRoot, passes } from "./filter-toggles.ts";

/**
 * Source-type toggles inside a topic page (/behavior/fuentes/<topic>):
 * several at once, none = all.
 *
 * It does two things at the same time so that the pile and the viewer never
 * disagree: it hides the files whose type is not selected, and it marks
 * their slides with `data-off` so the viewer's slider skips them too (the
 * counter then reads "1 / 2" instead of "1 / 8").
 *
 * The toggle machinery and the `data-*` rules live in ./filter-toggles.ts.
 */
export const initTopicFilters = () => {
	const root = claimRoot("[data-topic-root]");
	if (!root) return;

	const items = [
		...root.querySelectorAll<HTMLLIElement>("[data-source-item]"),
	]; /* the "files" in /source/*.astro page */
	const slides = [
		...root.querySelectorAll<HTMLDivElement>("[data-slide]"),
	]; /* the filters in the page -source types*/

	const types = new Set<string>();

	const apply = () => {
		for (const item of items) {
			item.hidden = !passes(types, item.dataset.type);
		}

		for (const slide of slides) {
			slide.toggleAttribute("data-off", !passes(types, slide.dataset.type));
		}
	};

	bindToggles(root, "data-filter-type", types, apply);
};
