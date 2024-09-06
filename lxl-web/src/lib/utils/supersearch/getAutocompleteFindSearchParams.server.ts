import getSortedSearchParams from '$lib/utils/getSortedSearchParams';

/**
 * Gets URL search params to be used for autocomplete fetches to the LibrisXL API /find endpoint (not to be confused with getAutocompleteSearchParams which can be used on the client)
 */

function getAutocompleteFindSearchParams(q: string): URLSearchParams {
	if (q.startsWith('"') && !q.endsWith('"')) {
		q = q.substring(1);
	}

	/** Add wildcard if not already present and if not quoted */
	/* NOTE: We cannot rely on prefix characters as a wildcard as prefixes affects the relevancy of the results (e.g. longer names seems to favoured over shorter?) */
	if (!q.endsWith('*') && !q.endsWith('"')) {
		q = `${q}*`;
	}

	return getSortedSearchParams(
		new URLSearchParams([
			['q', q],
			['_limit', '5'],
			['_offset', '0'],
			['_sort', ''],
			['@type', 'Person'],
			['@type', 'Concept'],
			['@type', 'Language'],
			['not-@type', 'ComplexSubject'], // Should it be "unboosted" instead?
			['not-inScheme.@id', 'https://id.kb.se/term/swepub'],
			['not-inScheme.@id', 'https://id.kb.se/term/marc']
			// ['@type', 'Work']
		])
	);
}

export default getAutocompleteFindSearchParams;
