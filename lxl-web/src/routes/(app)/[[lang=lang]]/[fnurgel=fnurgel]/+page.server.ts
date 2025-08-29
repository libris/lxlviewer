import type { CSLJSON } from '$lib/types/citation.js';

export const load = async ({ url, fetch }) => {
	// makes this load function dependant on 'cite' param change
	const id = url.searchParams.get('cite');

	async function getCitations(): Promise<CSLJSON[] | undefined> {
		if (id) {
			// fetching the record again via cite api is needed as long as csl mapping depends on computedLabel
			const res = await fetch(`/api/cite?id=${id}&format=csl`);
			return await res.json();
		}
		return;
	}

	return {
		citations: await getCitations()
	};
};
