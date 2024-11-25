import type { QueryFunction, TransformFunction } from '$lib/types/superSearch.js';
import debounce from '$lib/utils/debounce.js';

export function useSearchRequest({
	endpoint,
	queryFn,
	transformFn,
	debouncedWait
}: {
	endpoint: string;
	queryFn: QueryFunction;
	transformFn?: TransformFunction;
	debouncedWait?: number;
}) {
	let isLoading = $state(false);
	let error: string | undefined = $state();
	let data = $state();

	async function fetchData(query: string) {
		try {
			isLoading = true;
			error = undefined;

			const response = await fetch(`${endpoint}?${queryFn(query).toString()}`);
			const jsonResponse = await response.json();

			data = transformFn?.(jsonResponse) || jsonResponse;
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

	const debouncedFetchData = debounce((query: string) => fetchData(query), debouncedWait);

	return {
		fetchData,
		debouncedFetchData,
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
