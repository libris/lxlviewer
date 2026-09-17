import { JsonLd, type DisplayDecorated, type ResourceNode } from '$lib/types/xl';
import {
	getPropertyValues,
	getStringPropertyValues,
	isResourceNode
} from '$lib/utils/resourceData';

function getPublications(data: DisplayDecorated): ResourceNode[] {
	return getPropertyValues(data, 'publication')?.filter(isResourceNode);
}

function getPrimaryPublications(data: DisplayDecorated): ResourceNode[] {
	return getPublications(data)?.filter(isPrimaryPublication);
}

function isPrimaryPublication(data: DisplayDecorated): data is ResourceNode {
	return isResourceNode(data) && data[JsonLd.TYPE] === 'PrimaryPublication';
}

function formatYears(years: string[]): string {
	const NUM_NEW = 3;
	const NUM_OLD = 1;

	const sortedYears = years
		.filter((year) => !isNaN(parseInt(year)))
		.filter((year) => year?.length === 4)
		.filter((year, index, array) => array.indexOf(year) === index)
		.sort();

	if (sortedYears?.length <= NUM_NEW + NUM_OLD) {
		return sortedYears.join(', ');
	}

	return sortedYears.slice(0, NUM_OLD).join(', ') + ' … ' + sortedYears.slice(-NUM_NEW).join(', ');
}

// TODO: doesn't handle PrimaryPublication correctly?

function getInstanceData(instances: DisplayDecorated) {
	if (typeof instances !== 'object') {
		return null;
	}

	const count = Array.isArray(instances) ? instances.length : 1;

	if (!Array.isArray(instances)) {
		const primaryPublications = getPrimaryPublications(instances);

		const startYear = primaryPublications?.flatMap((publication) =>
			getStringPropertyValues(publication, 'startYear')
		);

		const endYear = primaryPublications?.flatMap((publication) =>
			getStringPropertyValues(publication, 'endYear')
		);

		if (startYear?.length || endYear?.length) {
			return {
				count: 1,
				years: `${startYear.join(', ')}-${endYear.join(', ')}`
			};
		}
	}

	const years = getPublications(instances)?.flatMap((publication) =>
		getStringPropertyValues(publication, 'year')
	);

	return {
		count,
		years: Array.isArray(years) ? formatYears(years) : ''
	};
}

export default getInstanceData;
