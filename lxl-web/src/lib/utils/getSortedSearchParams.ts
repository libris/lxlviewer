/**
 * Sorts the URL search params (for simplified caching of requests).
 */
function getSortedSearchParams(searchParams: URLSearchParams): URLSearchParams {
	const params = new URLSearchParams([...Array.from(searchParams.entries())]);

	// TODO: remove when backend api is more forgiving with unknown params
	if (params.has('expanded')) {
		params.delete('expanded');
	}

	if (params.has('holdings')) {
		params.delete('holdings');
	}

	if (params.size) {
		params.sort();
	}

	return params;
}

export default getSortedSearchParams;
