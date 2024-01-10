/**
 * Sorts the URL search params (for simplified caching of requests).
 */
function getSortedSearchParams(searchParams: URLSearchParams): URLSearchParams {
	const params = new URLSearchParams([...Array.from(searchParams.entries())]);

	if (params.size) {
		params.sort();
	}

	return params;
}

export default getSortedSearchParams;
