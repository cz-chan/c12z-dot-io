/**
 * This component was inspired by bepyan.me/en and its documentation.
 */
import styles from "./toc.module.css";

import { motion } from "motion/react";

import type { MotionValue } from "motion/react";

interface Props {
	progress: MotionValue<number>;
	strokeWidth?: number;
	className?: string;
}

export default function ProgressCircle({
	progress,
	strokeWidth = 4,
}: Props) {
	return (
		<span className={styles.circle}>
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
			>
				<circle
					cx="10"
					cy="10"
					r="8"
					fill="none"
					stroke="currentColor"
					className={styles.unfill}
					strokeLinecap="round"
					strokeOpacity={0.2}
					strokeWidth={strokeWidth}
				/>
				<motion.circle
					cx="10"
					cy="10"
					r="8"
					fill="none"
					stroke="currentColor"
					className={styles.fill}
					strokeLinecap="round"
					strokeWidth={strokeWidth}
					style={{
						pathLength: progress,
					}}
				/>
			</svg>
		</span>
	);
}
