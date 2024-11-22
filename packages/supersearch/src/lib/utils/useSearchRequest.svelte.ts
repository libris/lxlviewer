import debounce from '$lib/utils/debounce.js';
import type { ResultItem } from '$lib/types/index.js';

export function useSearchRequest({
	endpoint,
	queryFunction,
	transformerFunction,
	paginateFunction,
	debouncedWait = 300
}: {
	endpoint: string;
	queryFunction: (query: string) => URLSearchParams;
	transformerFunction?: (data: unknown) => ResultItem[];
	paginateFunction?: (prevSearchParams: URLSearchParams) => URLSearchParams;
	debouncedWait?: number;
}) {
	let isLoading = $state(false);
	let error: string | undefined = $state();
	let data = $state();
	let prevQuery: string | undefined = $state();
	let prevSearchParams: URLSearchParams | undefined = $state();

	const debouncedFetchData = debounce((query: string) => fetchData(query), debouncedWait);

	async function fetchData(query: string) {
		try {
			isLoading = true;
			error = undefined;
			const searchParams =
				paginateFunction && query === prevQuery && prevSearchParams
					? paginateFunction(prevSearchParams)
					: queryFunction(query);

			prevSearchParams = searchParams;
			const response = await fetch(`${endpoint}?${searchParams.toString()}`);
			const jsonResponse = await response.json();
			const responseData = transformerFunction?.(jsonResponse) || jsonResponse;
			if (query === prevQuery) {
				data = [...$state.snapshot(data), ...responseData];
			} else {
				data = responseData;
			}
			prevQuery = query;
			prevSearchParams = searchParams;
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

	async function fetchMoreData() {
		if (prevQuery) {
			await fetchData?.(prevQuery);
		}
	}

	return {
		fetchData,
		debouncedFetchData,
		fetchMoreData,
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
