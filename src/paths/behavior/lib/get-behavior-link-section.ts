import type { BehaviorEntry } from "@behavior-path/lib/card/behavior-card.types.ts";
import { BehaviorSectionData } from "@behavior-path/lib/behavior-sections.data.ts";

export const getBehaviorLinkSection = (
	collection: BehaviorEntry["collection"],
): string => {
	const collectionSection = BehaviorSectionData.find(
		(section) => section.collection === collection,
	);

	if (!collectionSection)
		throw new Error(
			`No behavior section is configured for the collection "${collection}".`,
		);

	return collectionSection.href;
};
