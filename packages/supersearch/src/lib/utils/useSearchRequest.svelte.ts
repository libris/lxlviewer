import type { QueryFunction } from '$lib/types/superSearch.js';

export function useSearchRequest({
	endpoint,
	queryFn
}: {
	endpoint: string;
	queryFn: QueryFunction;
}) {
	let isLoading = $state(false);
	let error: string | undefined = $state();
	let data = $state();

	async function fetchData(query: string) {
		try {
			isLoading = true;
			error = undefined;

			const response = await fetch(`${endpoint}?${queryFn(query).toString()}`);
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

export default useSearchRequest;
