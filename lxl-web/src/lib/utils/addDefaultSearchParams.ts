/**
 * Adds default URL search params if they are missing.
 */
function addDefaultSearchParams(searchParams: URLSearchParams): URLSearchParams {
	const params = new URLSearchParams([...Array.from(searchParams.entries())]);

	if (!params.has('q')) {
		params.set('q', '*');
	}
	if (!params.has('@type')) {
		params.set('@type', 'Work');
	}
	if (!params.has('_limit')) {
		params.set('_limit', '10');
	}
	if (!params.has('_offset')) {
		params.set('_offset', '0');
	}
	if (!params.has('_sort')) {
		params.set('_sort', '');
	}

	return params;
}

export default addDefaultSearchParams;
