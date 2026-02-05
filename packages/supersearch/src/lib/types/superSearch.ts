import type { JSONValue } from './json.js';
import type { Selection } from '$lib/components/CodeMirror.svelte';

export type QueryFunction = (value: string, cursor: number) => URLSearchParams;
export type PaginationQueryFunction = (
	searchParams: URLSearchParams,
	data: JSONValue
) => URLSearchParams | undefined;
export type TransformFunction = (data: JSONValue) => JSONValue;
export type ShouldShowStartContentFunction = (value: string, selection?: Selection) => boolean;

// TODO update me
export interface ResultItem {
	'@id'?: string;
	heading: string;
}

export type ShowExpandedSearchOptions = {
	cursorAtEnd: boolean;
};

export type DebouncedWaitFunction = (query: string) => number | null;

export type ExpandEvent = {
	windowPageYOffset: number;
};
