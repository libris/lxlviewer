import debounce from '$lib/utils/debounce.js';

export type Params = {
	query: string;
	limit: number;
	offset: number;
	sort: string;
};

export type SearchParamKeyMappings = {
	query: string;
	limit: string;
	offset: string;
	sort: string;
};

export function useSearchRequest({
	endpoint,
	searchParamKeyMappings = { query: 'q', limit: 'limit', offset: 'offset', sort: 'sort' },
	debouncedWait = 300
}: {
	endpoint: string;
	searchParamKeyMappings?: SearchParamKeyMappings;
	debouncedWait?: number;
}) {
	let isLoading = $state(false);
	let error: string | undefined = $state();
	let data = $state([]);
	let paginatedParams: Params;

	const debouncedFetchData = debounce((params: Params) => fetchData(params), debouncedWait);

	async function fetchData({ query, limit = 10, offset = 0, sort = '' }: Params) {
		try {
			isLoading = true;
			error = undefined;
			const response = await fetch(
				`${endpoint}?${new URLSearchParams([
					[searchParamKeyMappings.query, query],
					[searchParamKeyMappings.limit, limit.toString()],
					[searchParamKeyMappings.offset, offset.toString()],
					[searchParamKeyMappings.sort, sort]
				]).toString()}`
			);
			const fetchedData = await response.json();
			if (paginatedParams?.query === query) {
				data = [...data, ...fetchedData];
			} else {
				data = fetchedData;
			}
			paginatedParams = { query, limit, offset, sort };
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
		await fetchData({
			...paginatedParams,
			offset: paginatedParams.offset + paginatedParams.limit
		});
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
