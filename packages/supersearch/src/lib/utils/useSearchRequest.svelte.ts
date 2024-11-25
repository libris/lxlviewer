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
	let controller: AbortController;

	async function _fetchData(searchParams: URLSearchParams) {
		try {
			isLoading = true;
			error = undefined;

			controller?.abort();
			controller = new AbortController();

			const response = await fetch(`${endpoint}?${searchParams.toString()}`, {
				signal: controller.signal
			});
			const jsonResponse = await response.json();
			const _data = transformFn?.(jsonResponse) || jsonResponse;
			moreSearchParams = paginationQueryFn?.(searchParams, _data);

			return _data;
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
		if (paginationQueryFn) {
			paginatedData = [data];
		}
	}

	const debouncedFetchData = debounce((query: string) => fetchData(query), debouncedWait);

	async function fetchMoreData() {
		if (moreSearchParams) {
			const fetchedData = await _fetchData(moreSearchParams);
			paginatedData = [...((Array.isArray(paginatedData) && paginatedData) || []), fetchedData];
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
