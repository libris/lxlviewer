import getEditedRanges, { type EditedRanges } from './getEditedRanges.js';
import {
	DEFAULT_SUPERSEARCH_TYPES,
	qualifierKeyFromAlias,
	qualifierSearchTypeFromKey,
	getTypeQualifier,
	queryIncludesType
} from './qualifierTypes.js';

const SKIP_QUALIFIERS = ['år'];

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

		if (SKIP_QUALIFIERS.includes(qualifierKey.toLowerCase())) {
			return []; // Keep query as is when editing year qualifiers
		}

		const keyFromAlias = qualifierKeyFromAlias(qualifierKey);
		const baseClass = qualifierSearchTypeFromKey(keyFromAlias || qualifierKey);

		// console.log('baseclass:', baseClass, 'from alias:', keyFromAlias, 'key:', qualifierKey);

		if (baseClass) {
			return [
				['_q', `${getTypeQualifier(baseClass)} ${qualifierValue}`],
				['min-reverseLinks.totalItems', '1'] // ensure results are linked/used atleast once
			];
		}

		return [['_q', qualifierKey + qualifierOperator + qualifierValue]]; // does this make sense??
	}

	if (!queryIncludesType(query)) {
		// Else add default search types to _q
		return [['_q', `${query} ${getTypeQualifier(DEFAULT_SUPERSEARCH_TYPES)}`]];
	}

	// Otherwise keep query entries as is
	return [];
}

export default getEditedPartEntries;
