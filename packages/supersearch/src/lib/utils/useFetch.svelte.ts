export function useFetch() {
	let isLoading = $state(false);
	let error: string | undefined = $state();
	let data = $state();

	async function fetchData(newUrl: URL) {
		try {
			isLoading = true;
			error = undefined;
			const response = await fetch(newUrl);
			data = await response.json();
		} catch (err) {
			if (err instanceof Error) {
				error = 'Failed to fetch data: ' + err.message;
			} else {
				error = 'Failed to fetch data';
			}
		} finally {
			isLoading = false;
		}
	}

	return {
		fetchData,
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},
		get data() {
			return data;
		}
	};
}

export default useFetch;
