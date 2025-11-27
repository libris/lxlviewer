import type { Snippet } from 'svelte';

export type TreePath = string[];

export interface TreeMenuItem {
	path: TreePath;
}

export interface TreeMenuItemSnippetParams {
	data: TreeMenuItem;
	onchange?: ChangeHandler;
}

export type TreeMenuItemSnippet = Snippet<[TreeMenuItemSnippetParams]>;

export type ChangeHandler = (params: ChangeHandlerParams) => void;
export type ChangeHandlerParams = { data: TreeMenuItem; checked?: boolean | 'mixed' };

export type ToggleHandler = (params: ToggleHandlerParams) => void;
export type ToggleHandlerParams = {
	data: TreeMenuItem;
	expanded: boolean;
	expandedItems?: TreeMenuItem[];
};

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
