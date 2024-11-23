import debounce from '$lib/utils/debounce.js';
import type {
	QueryFunction,
	PaginateQueryFunction,
	TransformFunction
} from '$lib/types/superSearch.js';

export function useSearchRequest({
	endpoint,
	queryFn,
	paginateQueryFn,
	transformFn,
	debouncedWait = 300
}: {
	endpoint: string;
	queryFn: QueryFunction;
	paginateQueryFn?: PaginateQueryFunction;
	transformFn?: TransformFunction;
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

			return transformFn?.(jsonResponse) || jsonResponse;
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
