import type { Snippet } from 'svelte';

export type TreePath = string[];

export interface TreeMenuItem {
	path: TreePath;
}

export interface TreeMenuItemSnippetParams {
	data: TreeMenuItem;
	onmenuitemchange?: (event: Event) => void;
	onmenuitemkeydown: (event: KeyboardEvent) => void;
}

export type TreeMenuItemSnippet = Snippet<[TreeMenuItemSnippetParams]>;

export type ToggleHandlerParams = {
	data: TreeMenuItem;
	expanded: boolean;
	expandedItems?: TreeMenuItem[];
};

export type KeyDownHandler = (params: KeyDownHandler) => void;
export type KeyDownHandlerParams = { data: TreeMenuItem; event: KeyboardEvent };

export enum TreeMenuBarKeys {
	Enter = 'Enter',
	Space = ' ',
	ArrowUp = 'ArrowUp',
	ArrowRight = 'ArrowRight',
	ArrowDown = 'ArrowDown',
	ArrowLeft = 'ArrowLeft',
	Home = 'Home',
	End = 'End'
}
