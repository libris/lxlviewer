import type { SearchResultItem } from '$lib/types/search';
import { Fmt, type DisplayDecorated, type PropertyNode } from '$lib/types/xl';

type DigitalAccess = {
	online?: DisplayDecorated;
	hasReproduction?: DisplayDecorated;
};

export function getResourceDigitalAccess(
	overview2: DisplayDecorated[],
	instances: SearchResultItem[],
	workCard: SearchResultItem,
	isWork: boolean
): DigitalAccess {
	const result: DigitalAccess = {};
	const hasReproduction = overview2?.[1]?._display?.filter(
		(p: PropertyNode) => p[Fmt.PROP] === 'hasReproduction'
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
