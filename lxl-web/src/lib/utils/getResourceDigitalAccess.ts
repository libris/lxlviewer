import type { ResourceData } from '$lib/types/resourceData';
import type { SearchResultItem } from '$lib/types/search';
import { type DisplayDecorated } from '$lib/types/xl';

type DigitalAccess = {
	online?: DisplayDecorated;
	hasReproduction?: DisplayDecorated;
};

export function getResourceDigitalAccess(
	overview2: DisplayDecorated[],
	instances: SearchResultItem[] | ResourceData[],
	workCard: SearchResultItem | null,
	isWork: boolean
): DigitalAccess {
	const result: DigitalAccess = {};
	const hasReproduction = overview2?.[1]?._display?.filter(
		(p: DisplayDecorated) => p?.hasReproduction
	);

	if (isWork) {
		// associatedMedia, isPrimaryTopicOf etc
		result.online = workCard?.mediaLinks;
	}
	if (instances.length === 1) {
		result.online = instances[0]?.mediaLinks;
	}

	if (hasReproduction && hasReproduction.length) {
		// already digitized
		result.hasReproduction = hasReproduction;
	}

	return result;
}
