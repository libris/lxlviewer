export const load = async ({ url, fetch }) => {
	console.log('page load');
	// makes this load function dependant on 'cite' param change
	const id = url.searchParams.get('cite');

	async function getCitations() {
		if (id) {
			// fetching the record again via cite api is needed as long as csl mapping depends on computedLabel
			const res = await fetch(`/api/cite?id=${id}&format=csl`);
			return await res.json();
		}
		return null;
	}

	return {
		citations: await getCitations()
	};
};
