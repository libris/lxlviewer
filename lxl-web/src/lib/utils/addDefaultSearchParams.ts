/**
 * Adds default URL search params if they are missing.
 */
function addDefaultSearchParams(searchParams: URLSearchParams): URLSearchParams {
	const params = new URLSearchParams([...Array.from(searchParams.entries())]);

	if (!params.has('_q')) {
		params.set('_q', '*');
	}

	return params;
}

export default addDefaultSearchParams;
