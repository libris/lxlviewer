export type QueryFunction = (value: string) => URLSearchParams;
export type PaginationQueryFunction = (
	searchParams: URLSearchParams,
	data?: unknown
) => URLSearchParams | undefined;
export type TransformFunction = (data: unknown) => SearchQueryResult;

export interface ResultItem {
	id: string;
	heading: string;
}

export interface SearchQueryResult {
	'@id'?: string;
	context?: string;
	items: ResultItem[];
}
