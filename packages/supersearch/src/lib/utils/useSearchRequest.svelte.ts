import debounce from '$lib/utils/debounce.js';
import type { ResultItem } from '$lib/types/index.js';

export function useSearchRequest({
	endpoint,
	queryFn,
	transformerFn,
	paginateQueryFn,
	debouncedWait = 300
}: {
	endpoint: string;
	queryFn: (query: string) => URLSearchParams;
	paginateQueryFn?: (searchParams: URLSearchParams) => URLSearchParams;
	transformerFn?: (data: unknown) => ResultItem[];
	debouncedWait?: number;
}) {
	let isLoading = $state(false);
	let error: string | undefined = $state();
	let data = $state();
	let prevSearchParams: URLSearchParams;

	async function _fetchData(searchParams: URLSearchParams) {
		try {
			isLoading = true;
			error = undefined;

			const response = await fetch(`${endpoint}?${searchParams.toString()}`);
			const jsonResponse = await response.json();

			return transformerFn?.(jsonResponse) || jsonResponse;
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

	async function fetchData(query: string) {
		const searchParams = queryFn(query);
		data = await _fetchData(searchParams);
		prevSearchParams = searchParams;
	}

	const debouncedFetchData = debounce((query: string) => fetchData(query), debouncedWait);

	async function fetchMoreData() {
		const paginatedSearchParams = paginateQueryFn?.(prevSearchParams);
		if (paginatedSearchParams) {
			const moreData = await _fetchData(paginatedSearchParams);
			data = [
				...(Array.isArray(data) ? data : [data]),
				...(Array.isArray(moreData) ? moreData : [moreData])
			];
			prevSearchParams = paginatedSearchParams;
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
