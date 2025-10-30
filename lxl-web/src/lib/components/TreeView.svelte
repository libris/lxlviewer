<script module lang="ts">
	export interface TreeItem {
		ariaSelected?: boolean; // indicates if the tree item is currently selected
		items?: TreeItem[];
	}

	export interface TreeItemSnippetParams {
		data: unknown;
		level: number;
		setsize?: number;
		posinset: number;
	}

	export type TreeItemSnippet = Snippet<[TreeItemSnippetParams]>;

	export type GetChildItemsFn = ({ data, level, posinset }: GetChildItemsFnParams) => TreeItem[];

	export type GetChildItemsFnParams = {
		data: TreeItem;
		level: number;
		posinset: number;
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import TreeViewItem from './TreeViewItem.svelte';

	type Props = {
		// uid?: string;
		ariaLabelledby?: string;
		ariaLabel?: string;
		items: TreeItem[];
		treeItemSnippet: TreeItemSnippet;
		getChildItems?: GetChildItemsFn;
	};

	let {
		// uid,
		ariaLabelledby,
		ariaLabel,
		items = [],
		treeItemSnippet,
		getChildItems
	}: Props = $props();
</script>

<ul role="tree" aria-labelledby={ariaLabelledby} aria-label={ariaLabel}>
	{#each items as item, index (index)}
		<TreeViewItem data={item} level={1} posinset={index + 1} {treeItemSnippet} {getChildItems} />
	{/each}
</ul>
