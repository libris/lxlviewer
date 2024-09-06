import getEditedParts from '$lib/utils/codemirror/getEditedParts';

/**
 * Gets URL search params to be used for fetching the from proxy /autocomplete endpoint (not to be confused with getAutocompleteFindSearchparams which is used to fetch from the LibrisXL API)
 */

function getAutocompleteSearchParams({
	value,
	cursor
}: {
	value: string;
	cursor: number;
}): URLSearchParams {
	const { word, phrase } = getEditedParts({
		value,
		cursor
	});

	return new URLSearchParams({
		full: value,
		...(word ? { word } : {}), // should we skip word if it is equal to full?
		...(phrase ? { phrase } : {}) // ditto, should we skip phrase if it is equal to full?
	});
}

export default getAutocompleteSearchParams;
