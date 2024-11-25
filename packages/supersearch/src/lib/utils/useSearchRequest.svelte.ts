import debounce from '$lib/utils/debounce.js';
import type {
	QueryFunction,
	PaginationQueryFunction,
	TransformFunction
} from '$lib/types/superSearch.js';

export function useSearchRequest({
	endpoint,
	queryFn,
	paginationQueryFn,
	transformFn,
	debouncedWait = 300
}: {
	endpoint: string;
	queryFn: QueryFunction;
	paginationQueryFn?: PaginationQueryFunction;
	transformFn?: TransformFunction;
	debouncedWait?: number;
}) {
	let isLoading = $state(false);
	let error: string | undefined = $state();
	let data = $state();
	let paginatedData = $state();
	let moreSearchParams: URLSearchParams | undefined = $state();
	const hasMorePaginatedData = $derived(!!moreSearchParams);

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
		moreSearchParams = paginationQueryFn?.(searchParams, data);
	}

	const debouncedFetchData = debounce((query: string) => fetchData(query), debouncedWait);

	async function fetchMoreData() {
		if (data && moreSearchParams) {
			const moreData = await _fetchData(moreSearchParams);
			paginatedData = [...((Array.isArray(paginatedData) && paginatedData) || [data]), moreData];
			moreSearchParams = paginationQueryFn?.(moreSearchParams, data);
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
		},
		get paginatedData() {
			return paginatedData;
		},
		get hasMorePaginatedData() {
			return hasMorePaginatedData;
		}
	};
}

export default useSearchRequest;
