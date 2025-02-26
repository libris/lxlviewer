import type { JSONValue } from './json.js';

export type QueryFunction = (value: string, cursor: number) => URLSearchParams;
export type PaginationQueryFunction = (
	searchParams: URLSearchParams,
	data: JSONValue
) => URLSearchParams | undefined;
export type TransformFunction = (data: JSONValue) => JSONValue;
export type ShouldShowStartContentFunction = (value: string, cursor: number) => boolean;

// TODO update me
export interface ResultItem {
	'@id'?: string;
	heading: string;
}
