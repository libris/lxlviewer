import type {
	QueryFunction,
	PaginationQueryFunction,
	TransformFunction
} from '$lib/types/superSearch.js';
import type { JSONValue } from '$lib/types/json.js';
import debounce from '$lib/utils/debounce.js';

export function useSearchRequest({
	endpoint,
	queryFn,
	paginationQueryFn,
	transformFn,
	debouncedWait = 300
}: {
	endpoint: string | URL;
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
	let latestRequest = 0;

	async function _fetchData(searchParams: URLSearchParams) {
		latestRequest++;
		const currentRequest = latestRequest;
		try {
			isLoading = true;
			error = undefined;

			controller?.abort();
			controller = new AbortController();

			const response = await fetch(`${endpoint}?${searchParams.toString()}`, {
				signal: controller.signal
			});

			if (!response.ok) {
				throw new Error(`${response.status}: ${response.statusText}`);
			}

			const jsonResponse = (await response.json()) as JSONValue;

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
			if (currentRequest === latestRequest) {
				isLoading = false;
			}
		}
	}

	async function fetchData(query: string, cursor: number) {
		data = await _fetchData(queryFn(query, cursor));
		if (paginationQueryFn) {
			paginatedData = [data];
		}
	}

	const debouncedFetchData = debounce(
		(query: string, cursor: number) => fetchData(query, cursor),
		debouncedWait
	);

	async function fetchMoreData() {
		if (moreSearchParams) {
			const moreData = await _fetchData(moreSearchParams);
			paginatedData = [...((Array.isArray(paginatedData) && paginatedData) || []), moreData];
		}
	}

	function resetData() {
		data = undefined;
		paginatedData = undefined;
		moreSearchParams = undefined;
	}

	return {
		fetchData,
		debouncedFetchData,
		fetchMoreData,
		resetData,
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
