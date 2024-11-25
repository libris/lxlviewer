export type QueryFunction = (value: string) => URLSearchParams;
export type PaginationQueryFunction = (
	searchParams: URLSearchParams,
	data?: unknown
) => URLSearchParams | undefined;
export type TransformFunction = (data: unknown) => unknown;
