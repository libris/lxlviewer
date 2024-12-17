import getEditedRanges from './getEditedRanges.js';

/**
 * TODO: How should we handle translated query codes and qualifier keys?
 */

const QUALIFIER_KEY_BY_BASE_CLASS = {
	Library: 'itemHeldBy',
	Agent: 'contributor',
	Topic: 'subject',
	Subject: 'subject',
	Language: 'SPRÅK',
	GenreForm: 'genreForm',
	Person: 'person',
	Work: 'titel'
};

const SKIP_QUALIFIERS = ['år'];

/**
 * Gets the URLSearchParams entries which should be appended/replaced with new values when editing a part of a query.
 */

function getEditedPartEntries(query: string, cursor: number): [string, string][] {
	const editedRanges = getEditedRanges(query, cursor);

	/**
	 * Narrow down search query when editing qualifier parts
	 */
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

		const baseClass = Object.entries(QUALIFIER_KEY_BY_BASE_CLASS).find(
			([, key]) => key === qualifierKey
		)?.[0];

		if (baseClass) {
			return [
				['_qualifier', `"rdf:type":${baseClass} ${qualifierValue}`],
				['min-reverseLinks.totalItems', '1'] // ensure results are linked/used atleast once
			];
		}

		return [['_qualifier', qualifierKey + qualifierOperator + qualifierValue]];
	}

	/**
	 * Otherwise keep query entries as is
	 */
	return [];
}

export default getEditedPartEntries;
