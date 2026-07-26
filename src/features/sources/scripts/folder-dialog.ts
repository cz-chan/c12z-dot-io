/**
 * The folder viewer: opens a folder's native <dialog> and navigates through
 * its sources using a slider.
 *
 * Every slide is already in the HTML printed by SourceFiles. This only
 * flips which one is `hidden` and rewrites the counter, the tab and the
 * date from the active slide's `data-*`.
 */

// ── the excerpt ───────────────────────────────────────────────────────────

/**
 * This function is for show the excdrpt border with a fade-out text transition.
 */
const fadeState = (above: boolean, below: boolean) => {
	if (above && below) return "both";
	if (below) return "bottom";
	if (above) return "top";
	return undefined;
};

/**
 * An excerpt longer than the file is read by scrolling inside it. This only
 * writes what CSS cannot know: on which side there is more text (`data-fade`)
 * and whether it is worth reaching with the keyboard (`tabindex`).
 */
const syncExcerpt = (excerpt: HTMLElement) => {
	/* 1px of slack: with fractional heights the end of the scroll 
	never lands on an exact number*/
	const above = excerpt.scrollTop > 1;
	const below =
		excerpt.scrollTop + excerpt.clientHeight < excerpt.scrollHeight - 1;

	const fade = fadeState(above, below);
	if (fade) excerpt.dataset.fade = fade;
	else delete excerpt.dataset.fade;

	/* only a scrollable region is focusable: otherwise it would be one more stop 
	in the tab order with nothing to do there */
	if (above || below) excerpt.tabIndex = 0;
	else excerpt.removeAttribute("tabindex");
};

/** the excerpt of the slide being shown, already laid out */
const syncActiveExcerpt = (dialog: HTMLDialogElement) => {
	const excerpt = dialog.querySelector<HTMLElement>(
		"[data-slide]:not([hidden]) [data-excerpt]",
	);
	if (excerpt) syncExcerpt(excerpt);
};

/** every source is read from the top, not from where it was left last time */
const resetExcerpt = (slide: HTMLElement | null) => {
	const excerpt = slide?.querySelector<HTMLElement>("[data-excerpt]");
	if (!excerpt) return;

	excerpt.scrollTop = 0;
	syncExcerpt(excerpt);
};

// ── the slider ────────────────────────────────────────────────────────────

/**
 * The navigable slides, by index: those the type filter has not excluded.
 * It is the running order of the slider — position in this array is what
 * the counter shows, and what `step` walks through.
 */
const slideOrder = (dialog: HTMLDialogElement) =>
	[...dialog.querySelectorAll<HTMLElement>("[data-slide]:not([data-off])")].map(
		(slide) => Number(slide.dataset.slide),
	);

/** shows one slide and hides the rest; returns the one left visible */
const activate = (dialog: HTMLDialogElement, index: number) => {
	let active: HTMLElement | null = null;

	for (const slide of dialog.querySelectorAll<HTMLElement>("[data-slide]")) {
		slide.hidden = Number(slide.dataset.slide) !== index;
		if (!slide.hidden) active = slide;
	}

	dialog.dataset.active = String(index);
	return active;
};

/* The counter displays "2 / 3" at the top of the display. */
const setCounter = (
	dialog: HTMLDialogElement,
	position: number,
	total: number,
) => {
	const counter = dialog.querySelector<HTMLElement>("[data-counter]");
	if (counter) counter.textContent = `${position} / ${total}`;
};

/* 
	the tab (type (LIBRO/PAPER/...)) and the date in the
  header are from the active sheet
 */
const setHeaderFrom = (
	dialog: HTMLDialogElement,
	slide: HTMLElement | null,
) => {
	if (!slide) return;

	const tab = dialog.querySelector<HTMLSpanElement>("[data-sheet-type]");
	if (tab) tab.textContent = slide.dataset.typeLabel ?? "";

	const date = dialog.querySelector<HTMLTimeElement>("[data-sheet-date]");
	if (date) {
		date.textContent = slide.dataset.date ?? "";
		date.hidden = !slide.dataset.date;
	}
};

/** with only one visible source, there is nothing to go through. hiddden the "< >" */
const toggleNav = (dialog: HTMLDialogElement, total: number) => {
	const nav =
		dialog.querySelector<HTMLButtonElement>(
			"[data-folder-prev]",
		)?.parentElement;
	if (nav) nav.hidden = total < 2;
};

// ES: la función central — dado un índice, deja TODO consistente con él
// (slide visible, contador, cabecera, excerpt, nav). step() y openFolder()
// solo calculan qué índice mostrar y delegan aquí.
const show = (dialog: HTMLDialogElement, index: number) => {
	const order = slideOrder(dialog);
	if (order.length === 0) return;

	// if the requested slide is filtered out, start with the first one
	const active = order.includes(index) ? index : order[0];
	const slide = activate(dialog, active);

	setCounter(dialog, order.indexOf(active) + 1, order.length);
	setHeaderFrom(dialog, slide);
	resetExcerpt(slide);
	toggleNav(dialog, order.length);
};

/* 
	moves forward/backward `delta` positions (1 or -1) along `slideOrder` in a
	cyclic manner (from the last one back to the first) and calls show() 
	with the new index. 
*/
const step = (dialog: HTMLDialogElement, delta: number) => {
	const order = slideOrder(dialog);
	if (order.length === 0) return;

	const current = Number(dialog.dataset.active ?? order[0]);
	const pos = order.indexOf(current);
	// cyclical: from the last one back to the first
	show(dialog, order[(pos + delta + order.length) % order.length]);
};

// ── the handlers ──────────────────────────────────────────────────────────

/** the viewer on screen, if any: only one can be open at a time */
const openDialog = () =>
	document.querySelector<HTMLDialogElement>("[data-folder-dialog][open]");

const openFolder = (opener: HTMLElement) => {
	const id = opener.dataset.folderOpen;
	if (!id) return;

	const dialog = document.getElementById(id);
	if (!(dialog instanceof HTMLDialogElement)) return;

	show(dialog, Number(opener.dataset.index ?? 0));
	dialog.showModal();
	/* 
		only now does the sheet have a size: with the dialog closed everything
	 	easures 0 and no excerpt looks scrollable */
	syncActiveExcerpt(dialog);
};

/* 
	the button decision maker. only one const for all click events inse the folder/file
	this delegates what kind of click the user made
*/
const actOnDialog = (dialog: HTMLDialogElement, target: HTMLElement) => {
	if (target.closest("[data-folder-close]")) dialog.close();
	else if (target.closest("[data-folder-next]")) step(dialog, 1);
	else if (target.closest("[data-folder-prev]")) step(dialog, -1);
	// clicking on the backdrop (the dialog box itself) closes it
	else if (target === dialog) dialog.close();
};

/**
 * Delegated to `document`, which survives view transitions: it only needs to
 * be registered once, hence the `foldersInit` flag. Re-registering it on
 * `astro:page-load` would fire every handler twice per click.
 */
export const initFolderDialog = () => {
	if (document.documentElement.dataset.foldersInit === "true") return;
	document.documentElement.dataset.foldersInit = "true";

	/* 
	 A common listener for the files/folders. the click distingue 
	 if user clicked in folder or something inside 
	 */
	document.addEventListener("click", (event) => {
		const target = event.target as HTMLElement;

		const opener = target.closest<HTMLButtonElement>("[data-folder-open]");
		if (opener) {
			openFolder(opener);
			return;
		}

		const dialog = target.closest<HTMLDialogElement>("[data-folder-dialog]");
		if (dialog) actOnDialog(dialog, target);
	});

	/* arrows for file/folder navigation while element it's open 
	or there are more than one */
	document.addEventListener("keydown", (event) => {
		const dialog = openDialog();
		if (!dialog) return;

		if (event.key === "ArrowRight") step(dialog, 1);
		else if (event.key === "ArrowLeft") step(dialog, -1);
	});

	/* `scroll` does not bubble: it is caught on the way down (capture) */
	document.addEventListener(
		"scroll",
		(event) => {
			const excerpt = event.target as HTMLElement;
			if (excerpt?.dataset?.excerpt !== undefined) syncExcerpt(excerpt);
		},
		true,
	);

	/* resizing the window changes how much text fits: what was cut may no
		longer be, and the other way round */
	window.addEventListener("resize", () => {
		const dialog = openDialog();
		if (dialog) syncActiveExcerpt(dialog);
	});
};
