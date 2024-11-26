import type { JSONValue } from './json.js';

export type QueryFunction = (value: string) => URLSearchParams;
export type PaginationQueryFunction = (
	searchParams: URLSearchParams,
	data: JSONValue
) => URLSearchParams | undefined;
export type TransformFunction = (data: JSONValue) => JSONValue;
