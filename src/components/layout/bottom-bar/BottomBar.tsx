import styles from "./bottom-bar.module.css";
import { useState, useEffect } from "react";

const BottomBar = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [currentPath, setCurrentPath] = useState("");

	// Obtener la ruta actual y mostrar los botones cuando el usuario haga scroll
	useEffect(() => {
		setCurrentPath(window.location.pathname);

		const handleScroll = () => {
			setIsVisible(window.scrollY > 300);
		};

		window.addEventListener("scroll", handleScroll);

		// Cleanup al desmontar
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// Calcular la ruta de retroceso
	const getBackPath = (path: string) => {
		// Normalizar la ruta removiendo barra final si existe
		const normalizedPath = path.replace(/\/$/, "") || "/";
		if (normalizedPath === "/") return null; // En la raíz, no hay retroceso
		const segments = normalizedPath.split("/").filter(Boolean);
		segments.pop(); // Remover el último segmento
		return "/" + segments.join("/") || "/";
	};

	const backPath = getBackPath(currentPath);

	return (
		<section
			className={`${styles.bb}
        ${isVisible ? `${styles.isvisible}` : `${styles.isnotvisible}`}`}
		>
			<div
				className={`${styles.bar} ${
					backPath ? `${styles.both}` : `${styles.unique}`
				}`}
			>
				{backPath && (
					<a
						title="go back"
						className={styles.gb}
						href={backPath}
					>
						←
					</a>
				)}
				{/* Aquí debe ir los elementos de Share */}
				<button
					title="go to top"
					onClick={scrollToTop}
					className={styles.gt}
				>
					↑
				</button>
			</div>
		</section>
	);
};

export default BottomBar;
