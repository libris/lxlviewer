import type {
	QueryFunction,
	PaginationQueryFunction,
	TransformFunction
} from '$lib/types/superSearch.js';
import type { JSONValue } from '$lib/types/json.js';
import debounce from '$lib/utils/debounce.js';

let data = $state();

export function getData() {
	return {
		get data() {
			return data;
		},
	}
}
export function useSearchRequest({
	endpoint,
	queryFn,
	paginationQueryFn,
	transformFn,
	debouncedWait
}: {
	endpoint: string | URL;
	queryFn: QueryFunction;
	paginationQueryFn?: PaginationQueryFunction;
	transformFn?: TransformFunction;
	debouncedWait?: number;
}) {
	let isLoading = $state(false);
	let error: string | undefined = $state();
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
			isLoading = false;
		}
	}

	async function fetchData(query: string) {
		data = await _fetchData(queryFn(query));
		if (paginationQueryFn) {
			paginatedData = [data];
		}
	}

	const debouncedFetchData = debounce((query: string) => fetchData(query), debouncedWait);

	async function fetchMoreData() {
		if (moreSearchParams) {
			const moreData = await _fetchData(moreSearchParams);
			paginatedData = [...((Array.isArray(paginatedData) && paginatedData) || []), moreData];
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
