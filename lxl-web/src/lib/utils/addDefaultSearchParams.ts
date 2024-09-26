/**
 * Adds default URL search params if they are missing.
 */
function addDefaultSearchParams(searchParams: URLSearchParams): URLSearchParams {
	const params = new URLSearchParams([...Array.from(searchParams.entries())]);

	if (!params.has('_q')) {
		params.set('_q', '*');
	}
	if (!params.has('_limit')) {
		params.set('_limit', '20');
	}
	if (!params.has('_offset')) {
		params.set('_offset', '0');
	}
	if (!params.has('_sort')) {
		params.set('_sort', '');
	}
	if (!params.has('_spell')) {
		params.set('_spell', 'true');
	}

	return params;
}

export default addDefaultSearchParams;
