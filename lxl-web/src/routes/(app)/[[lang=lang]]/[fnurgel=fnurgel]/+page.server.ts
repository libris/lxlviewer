export const load = async ({ url, fetch }) => {
	console.log('page load');
	// makes this load function dependant on 'cite' param change
	const fnurgel = url.searchParams.get('cite');

	async function getCitations() {
		if (fnurgel) {
			const res = await fetch(`/api/cite?id=${fnurgel}&format=csl`);
			return await res.json();
		}
		return null;
	}

	return {
		citations: getCitations()
	};
};
