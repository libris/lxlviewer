export type QueryFunction = (value: string) => URLSearchParams;
export type PaginationQueryFunction = (
	searchParams: URLSearchParams,
	data?: unknown
) => URLSearchParams | undefined;
export type TransformFunction = (data: unknown) => unknown;

export interface ResultItem {
	'@id'?: string;
	heading: string;
}

export interface QueryResponse {
	'@id'?: string;
	context?: string;
	items: ResultItem[];
	totalItems: number;
}
