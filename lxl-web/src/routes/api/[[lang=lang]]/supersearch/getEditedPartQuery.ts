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

function getEditedPartQuery(query: string, cursor: number): string {
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
			return query; // Keep query as is when editing year qualifiers
		}

		const baseClass = Object.entries(QUALIFIER_KEY_BY_BASE_CLASS).find(
			([, key]) => key === qualifierKey
		)?.[0];

		if (baseClass) {
			return qualifierValue + `"rdf:type":${baseClass}`;
		}

		return qualifierKey + qualifierOperator + qualifierValue;
	}

	/**
	 * Otherwise keep query as is...
	 */
	return query;
}

export default getEditedPartQuery;
