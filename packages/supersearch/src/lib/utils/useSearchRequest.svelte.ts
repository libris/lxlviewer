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
	searchParamKeyMappings = { query: '_q', limit: '_limit', offset: '_offset', sort: '_sort' },
	debouncedWait = 300
}: {
	endpoint: URL;
	searchParamKeyMappings?: SearchParamKeyMappings;
	debouncedWait?: number;
}) {
	let isLoading = $state(false);
	let error: string | undefined = $state();
	let data = $state();

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
