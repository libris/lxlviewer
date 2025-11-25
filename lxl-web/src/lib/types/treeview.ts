import type { Snippet } from 'svelte';

export enum Selectable {
	single = 'single',
	multiple = 'multiple'
}

export interface TreeItem {
	path: string[];
	id?: string;
	expanded?: boolean;
	selected?: boolean;
	level?: number;
	setsize?: number;
	posinset?: number;
}

export interface TreeItemSnippetParams extends TreeItem {
	level: number; // level should always be passed on
	hasSelected?: boolean;
	onchangeselected?: (selected: boolean) => void;
}

export type TreeItemSnippet = Snippet<[TreeItemSnippetParams]>;

export enum TreeViewKeys {
	ArrowUp = 'ArrowUp',
	ArrowRight = 'ArrowRight',
	ArrowDown = 'ArrowDown',
	ArrowLeft = 'ArrowLeft',
	Home = 'Home',
	End = 'End'
	//Enter = 'Enter'
}
