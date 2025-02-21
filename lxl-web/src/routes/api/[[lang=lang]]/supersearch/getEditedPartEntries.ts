import getEditedRanges, { type EditedRanges } from './getEditedRanges.js';
import {
	BASE_CLASS_FROM_QUALIFIER_KEY,
	QUALIFIER_KEY_FROM_ALIAS,
	findInMap
} from './qualifierMappings.js';

const DEFAULT_SUPERSEARCH_TYPES = ['Agent', 'Concept', 'Language', 'Work'];
const SKIP_QUALIFIERS = ['yearPublished', 'år'];

/**
 * Gets the URLSearchParams entries which should be appended/replaced with new values when editing a part of a query.
 */
function getEditedPartEntries(
	query: string,
	cursor: number,
	ranges?: EditedRanges
): [string, string][] {
	const editedRanges = ranges || getEditedRanges(query, cursor);

	// Narrow down search query when editing qualifier parts
	if (editedRanges.qualifierKey && editedRanges.qualifierOperator && editedRanges.qualifierValue) {
		const qualifierKey = query.slice(editedRanges.qualifierKey.from, editedRanges.qualifierKey.to);
		const qualifierOperator = query.slice(
			editedRanges.qualifierOperator.from,
			editedRanges.qualifierOperator.to
		);
		const qualifierValue = query.slice(
			editedRanges.qualifierValue.from,
			editedRanges.qualifierValue.to
		);

		// Don't narrow down year qualifiers
		const skipQualifier = SKIP_QUALIFIERS.includes(qualifierKey.toLowerCase());
		if (!skipQualifier) {
			// Get the normalized property from a translated key/alternative query code
			const keyFromAlias = findInMap(QUALIFIER_KEY_FROM_ALIAS, qualifierKey).join();
			const baseClasses = findInMap(BASE_CLASS_FROM_QUALIFIER_KEY, keyFromAlias || qualifierKey);

			if (baseClasses.length) {
				return [
					['_q', `${qualifierValue} "rdf:type":(${baseClasses.join(' OR ')})`],
					['min-reverseLinks.totalItems', '1'] // ensure results are linked/used atleast once
				];
			}

			return [['_q', qualifierKey + qualifierOperator + qualifierValue]]; // does this make sense??
		}
	}

	if (!queryIncludesType(query)) {
		// Else add default search types to _q
		return [['_q', `${query} "rdf:type":(${DEFAULT_SUPERSEARCH_TYPES.join(' OR ')})`]];
	}

	// Otherwise keep query entries as is
	return [];
}

function queryIncludesType(q: string | undefined) {
	if (q && typeof q === 'string') {
		return !!q.match(/"rdf:type"[:=]/g);
	}
	return false;
}

export default getEditedPartEntries;
