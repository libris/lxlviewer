import type { Snippet } from 'svelte';

export interface TreeItem {
	key: string;
	id?: string;
	items?: TreeItem[];
	expanded?: boolean;
	selected?: boolean; // indicates if the tree item is currently selected
	level?: number;
	setsize?: number;
	posinset?: number;
	ownsId?: string;
	data?: unknown;
}

export interface TreeItemSnippetParams {
	data: unknown;
	onselecttreeitem?: (selected: boolean) => void;
}

export type TreeItemSnippet = Snippet<[TreeItemSnippetParams]>;
