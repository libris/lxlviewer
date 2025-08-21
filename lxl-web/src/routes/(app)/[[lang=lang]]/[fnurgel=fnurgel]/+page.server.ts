export const load = async ({ url, fetch }) => {
	console.log('page load');
	// makes this load function dependant on 'reference' param change
	const fnurgel = url.searchParams.get('reference');

	async function getReferences() {
		if (fnurgel) {
			const res = await fetch(`/api/reference?id=${fnurgel}`);
			return await res.json();
		}
		return null;
	}

	return {
		references: getReferences()
	};
};
