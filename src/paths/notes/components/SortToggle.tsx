import { useState } from "react";

import styles from "./notes.module.css";

type Order = "desc" | "asc";

interface Props {
	listId: string;
}

/**
 * Reverses the order of the <li> elements in the timeline in the DOM. The HTML arrives
 * pre-rendered in descending order (most recent first); since there are only two
 * states, reorder = reverse the children of the <ol>.
 */
export default function SortToggle({ listId }: Props) {
	const [order, setOrder] = useState<Order>("desc");

	function apply(next: Order) {
		if (next === order) return;

		const list = document.getElementById(listId);
		if (!list) return;

		Array.from(list.children)
			.reverse()
			.forEach((item) => list.appendChild(item));

		setOrder(next);
	}

	return (
		<div
			className={styles.toggle}
			role="group"
			aria-label="Orden de las notas"
		>
			<button
				type="button"
				className={`${styles.btn} ${order === "desc" ? styles.active : ""}`}
				aria-pressed={order === "desc"}
				onClick={() => apply("desc")}
			>
				Más recientes
			</button>
			<span
				className={styles.sep}
				aria-hidden="true"
			>
				/
			</span>
			<button
				type="button"
				className={`${styles.btn} ${order === "asc" ? styles.active : ""}`}
				aria-pressed={order === "asc"}
				onClick={() => apply("asc")}
			>
				Más antiguas
			</button>
		</div>
	);
}
