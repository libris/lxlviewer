import type { Snippet } from 'svelte';

export interface TreeItem {
	selected?: boolean; // indicates if the tree item is currently selected
	items?: TreeItem[];
}

export interface TreeItemSnippetParams {
	data: TreeItem;
	level: number;
	setsize?: number;
	expandedGroup?: boolean;
	groupSnippet?: Snippet;
}

export interface TreeItemsParams {
	items: TreeItem[];
	level: number;
	treeItemSnippet: TreeItemSnippet;
	getKey: GetKeyFn;
	getSelected?: GetSelectedFn;
	getGroupItems: GetGroupItemsFn;
}

export type TreeItemSnippet = Snippet<[TreeItemSnippetParams]>;

export type GetKeyFn = ({ data, index }: GetKeyParams) => string;
export type GetKeyParams = { data: TreeItem; index: number };

export type GetSelectedFn = ({ data, level }: GetSelectedParams) => boolean | undefined;
export type GetSelectedParams = { data: TreeItem; level: number };

export type GetGroupItemsFn = ({ data, level }: GetGroupItemsParams) => TreeItem[] | undefined;
export type GetGroupItemsParams = {
	data: TreeItem;
	level: number;
};
