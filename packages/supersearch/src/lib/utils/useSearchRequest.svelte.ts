import debounce from '$lib/utils/debounce.js';

export type Params = {
	query: string;
	limit: number;
	offset: number;
	sort: string;
};

export type MappedParamsKeys = {
	query: string;
	limit: string;
	offset: string;
	sort: string;
};

export function useSearchRequest({
	endpoint,
	mappedParamsKeys = { query: '_q', limit: '_limit', offset: '_offset', sort: '_sort' },
	debouncedWait = 300
}: {
	endpoint: URL;
	mappedParamsKeys?: MappedParamsKeys;
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
					[mappedParamsKeys.query, query],
					[mappedParamsKeys.limit, limit.toString()],
					[mappedParamsKeys.offset, offset.toString()],
					[mappedParamsKeys.sort, sort]
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
