function getHiddenSearchParams(searchParams: URLSearchParams): URLSearchParams {
	const params = new URLSearchParams([...Array.from(searchParams.entries())]);

	params.set('_offset', '0'); // always reset offset on new search

	if (params.has('_q')) {
		params.delete('_q');
	}

	if (!params.has('_limit')) {
		params.set('_limit', '20');
	}

	if (!params.has('_sort')) {
		params.set('_sort', '');
	}

	// TODO: remove when backend api is more forgiving with unknown params
	if (params.has('expanded')) {
		params.delete('expanded');
	}
	// TODO: remove when backend api is more forgiving with unknown params
	if (params.has('holdings')) {
		params.delete('holdings');
	}

	params.sort();

	return params;
}

export default getHiddenSearchParams;
