import type { JSONValue } from './json.js';
import type { Editor, Selection } from '$lib/components/CodeMirror.svelte';

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

export type ChangeQueryParams = {
	change?: { insert: string; from?: number; to?: number };
	selection?: {
		anchor: number;
		head: number;
	};
	userEvent?: UserEvent;
	addToHistory?: boolean;
};

export type ShowExpandedSearchOptions = {
	cursorAtEnd?: boolean;
	focusRow?: number;
	preventPushState?: boolean;
};

export type HideExpandedSearchOptions = {
	skipFocus?: boolean;
};

export type DebouncedWaitFunction = (query: string) => number | null;

export type ExpandEvent = {
	editor: Editor;
	windowPageYOffset: number;
};

export type CollapseEvent = {
	editor: Editor;
};

export type UserEvent =
	| 'input'
	| 'input.type'
	| 'input.paste'
	| 'input.drop'
	| 'input.complete'
	| 'delete'
	| 'delete.selection'
	| 'delete.forward'
	| 'delete.backward'
	| 'delete.cut'
	| 'move'
	| 'move.drop'
	| 'select'
	| 'select.pointer'
	| 'undo'
	| 'redo'; // see: https://codemirror.net/docs/ref/#state.Transaction%5EuserEvent
