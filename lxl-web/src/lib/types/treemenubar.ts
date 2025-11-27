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

export type ChangeHandler = (data: TreeMenuItem) => void;

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
