import type { Snippet } from 'svelte';

export type TreePath = string[];

export interface TreeMenuItem {
	path: TreePath;
}

export interface TreeMenuItemSnippetParams extends TreeMenuItem {
	hasSelected?: boolean;
	oonchangeselected?: (selected: boolean) => void;
}

export type TreeMenuItemSnippet = Snippet<[TreeMenuItem]>;

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
