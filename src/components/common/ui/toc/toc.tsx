/**
 * This component was inspired by bepyan.me/en and his documentation.
 */

import styles from "./toc.module.css";
import { useEffect, useRef, useState } from "react";

import type { DynamicTocProps } from "@/common/ui/toc/toc.interface";

import { throttle } from "es-toolkit";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";

import ProgressCircle from "./progressCircle";

export default function TOC({ title, headings }: DynamicTocProps) {
	const isHidden = useIsHidden();
	const { rootRef, expanded, setExpanded } = useExpanded();
	const { progress } = useArticleScrollProgress();
	const [activeSlug, setActiveSlug] = useState<string | null>(null);

	useEffect(() => {
		let headingsPositions: { slug: string; top: number }[] = [];

		const updatePositions = () => {
			headingsPositions = headings
				.map(({ slug }) => {
					const el = document.getElementById(slug);
					return el ? { slug, top: el.offsetTop } : null;
				})
				.filter((x): x is { slug: string; top: number } => x !== null);
		};

		const onScroll = throttle(() => {
			const scrollY = window.scrollY;
			let current: string | null = null;
			headingsPositions.forEach((h) => {
				if (scrollY >= h.top - 10) {
					current = h.slug;
				}
			});
			setActiveSlug(current);
		}, 100);

		updatePositions();
		onScroll();

		window.addEventListener("scroll", onScroll, { capture: true });
		window.addEventListener("resize", updatePositions, { capture: true });

		return () => {
			window.removeEventListener("scroll", onScroll, { capture: true });
			window.removeEventListener("resize", updatePositions, { capture: true });
		};
	}, [headings]);

	return (
		<div
			className={styles.toc}
			aria-label="Table of contents"
		>
			<AnimatePresence
				initial={false}
				mode="wait"
			>
				{!isHidden && (
					<motion.div
						variants={{
							visible: {
								y: 0,
								opacity: 1,
								transition: {
									delay: 0.1,
									y: {
										type: "spring",
										bounce: 0.4,
									},
									opacity: {
										duration: 0.2,
									},
								},
							},
							hidden: {
								y: -68,
								opacity: 0,
								transition: {
									delay: 0.4,
									y: {
										type: "spring",
										bounce: 0.4,
									},
									opacity: {
										duration: 0.2,
									},
								},
							},
						}}
						style={{ x: "-50%" }}
						initial="hidden"
						animate="visible"
						exit="hidden"
					>
						<motion.div
							aria-expanded={expanded}
							tabIndex={0}
							ref={rootRef}
							layout
							className={styles.motdiv}
							style={{
								borderRadius: expanded ? 16 : 300,
								width: expanded ? "24rem" : "fit-content",
								cursor: expanded ? "default" : "pointer",
							}}
							transition={{
								type: "spring",
								bounce: expanded ? 0.3 : 0.25,
							}}
							whileTap={{
								scale: expanded ? 1 : 0.9,
							}}
							whileHover={{
								scale: expanded ? 1 : 1.1,
							}}
							onClick={() => setExpanded(!expanded)}
						>
							<motion.div
								layout="position"
								className={styles.sectTitle}
							>
								<ProgressCircle progress={progress} />
								<span className={styles.title}>{title}</span>
							</motion.div>
							{expanded && (
								<motion.div
									layout="size"
									initial={{
										opacity: 0,
										filter: "blur(2px)",
									}}
									animate={{
										opacity: 1,
										filter: "blur(0px)",
										transition: {
											delay: 0.15,
										},
									}}
									transition={{
										type: "spring",
										bounce: expanded ? 0.3 : 0.25,
									}}
									key={expanded ? "list" : "title"}
								>
									<div className={styles.content}>
										{headings.map(({ text, slug, depth }) => (
											<div
												key={slug}
												className={styles.point}
												style={{ paddingLeft: `${(depth - 2) * 12}px` }}
											>
												<AnimatePresence mode="popLayout">
													{slug === activeSlug && (
														<motion.div
															layoutId="indicator"
															className={styles.a}
															initial={{ opacity: 0 }}
															animate={{ opacity: 1 }}
															exit={{ opacity: 0 }}
															transition={{ type: "spring", bounce: 0.25 }}
														>
															<div className={styles.theDot} />
														</motion.div>
													)}
												</AnimatePresence>
												<a
													href={`#${slug}`}
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														document.getElementById(slug)?.scrollIntoView({ behavior: "smooth" });
													}}
													className={`${styles.headingLink} ${
														slug === activeSlug ? styles.here : styles.notHere
													}`}
												>
													{text}
												</a>
											</div>
										))}
									</div>
								</motion.div>
							)}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function useIsHidden() {
	const [isHidden, setIsHidden] = useState(true);
	const headerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 100) {
				// Aparece después de hacer scroll 100px
				setIsHidden(false);
			} else {
				setIsHidden(true);
			}
		};

		window.addEventListener("scroll", handleScroll);

		// Cleanup al desmontar
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	useEffect(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				setIsHidden(entry.isIntersecting);
			});
		});

		if (headerRef.current) {
			observer.observe(headerRef.current);
		}
		return () => {
			if (headerRef.current) {
				observer.unobserve(headerRef.current);
			}
		};
	}, []);

	return isHidden;
}

function useExpanded() {
	const rootRef = useRef<HTMLDivElement>(null);
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (expanded && !rootRef.current?.contains(event.target as Node)) {
				setExpanded(false);
			}
		};

		const handleEscKey = (event: KeyboardEvent) => {
			if (event.key === "Escape" && expanded) {
				setExpanded(false);
			}
		};

		if (expanded) {
			document.addEventListener("click", handleClickOutside);
			document.addEventListener("keydown", handleEscKey);
		} else {
			document.removeEventListener("click", handleClickOutside);
			document.removeEventListener("keydown", handleEscKey);
		}

		return () => {
			document.removeEventListener("click", handleClickOutside);
			document.removeEventListener("keydown", handleEscKey);
		};
	}, [expanded]);

	return {
		rootRef,
		expanded,
		setExpanded,
	};
}

function useArticleScrollProgress() {
	const { scrollYProgress } = useScroll();
	const progress = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	return { progress };
}
