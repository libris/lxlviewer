import {
	Fmt,
	JsonLd,
	type DisplayDecorated,
	type PropertyNode,
	type ResourceNode
} from '$lib/types/xl';
import { isHtmlNode, isPropertyNode, isResourceNode } from '$lib/utils/resourceData';

/**
 * Find all properties with the given name anywhere in the data.
 */
function getProperties(data: DisplayDecorated, prop: string): PropertyNode[] {
	if (typeof data === 'string' || isHtmlNode(data)) {
		return [];
	}

	if (Array.isArray(data)) {
		return data.flatMap((item) => getProperties(item, prop));
	}

	if (isPropertyNode(data)) {
		return data[Fmt.PROP] === prop ? [data] : [];
	}

	return data[Fmt.DISPLAY].filter((property) => property[Fmt.PROP] === prop);
}

/**
 * Get the immediate values of all properties with the given name.
 */
function getPropertyValues(data: DisplayDecorated, prop: string): DisplayDecorated[] {
	return getProperties(data, prop).flatMap((property) => {
		const value = property[Fmt.VALUE];

		return Array.isArray(value) ? value : [value];
	});
}

function getStringPropertyValues(data: DisplayDecorated, prop: string): string[] {
	return getPropertyValues(data, prop).filter(
		(value): value is string => typeof value === 'string'
	);
}

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
		.filter((year) => year.length === 4)
		.filter((year, index, array) => array.indexOf(year) === index)
		.sort();

	if (sortedYears.length <= NUM_NEW + NUM_OLD) {
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

		const startYear = primaryPublications.flatMap((publication) =>
			getStringPropertyValues(publication, 'startYear')
		);

		const endYear = primaryPublications.flatMap((publication) =>
			getStringPropertyValues(publication, 'endYear')
		);

		if (startYear.length || endYear.length) {
			return {
				count: 1,
				years: `${startYear.join(', ')}-${endYear.join(', ')}`
			};
		}
	}

	const years = getPublications(instances).flatMap((publication) =>
		getStringPropertyValues(publication, 'year')
	);

	return {
		count,
		years: formatYears(years)
	};
}

export default getInstanceData;
