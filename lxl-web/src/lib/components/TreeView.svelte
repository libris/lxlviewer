<script module lang="ts">
	export interface TreeItem {
		selected?: boolean; // indicates if the tree item is currently selected
		items?: TreeItem[];
	}

	export interface TreeItemSnippetParams {
		data: unknown;
		level: number;
		setsize?: number;
		posinset: number;
		isGroup: boolean;
		expandedGroup?: boolean;
		groupSnippet?: Snippet;
	}

	export type TreeItemSnippet = Snippet<[TreeItemSnippetParams]>;

	export interface GroupContainerSnippetParams {
		data: unknown;
		level: number;
		expanded: boolean;
		groupSnippet: Snippet;
	}
	export type GroupContainerSnippet = Snippet<[GroupContainerSnippetParams]>;

	export type GetChildItemsFn = ({
		data,
		level,
		posinset
	}: GetChildItemsFnParams) => TreeItem[] | undefined;
	export type GetChildItemsFnParams = {
		data: unknown;
		level: number;
		posinset: number;
	};

	export type GetKeyFn = ({ data, index }: GetKeyFnParams) => string;
	export type GetKeyFnParams = {
		data: unknown;
		index: number;
	};

	export type GetLimitFn = ({ data, level, posinset }: GetLimitFnParams) => number | undefined;
	export type GetLimitFnParams = {
		data: unknown;
		level: number;
		posinset: number;
	};

	export type GetGroupExpandedFn = ({ data, level, posinset }: GetGroupExpandedFnParams) => boolean;
	export type GetGroupExpandedFnParams = {
		data: unknown;
		level: number;
		posinset: number;
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import TreeViewItem from '$lib/components/TreeViewItem.svelte';

	type Props = {
		// uid?: string;
		ariaLabelledby?: string;
		ariaLabel?: string;
		items: TreeItem[];
		treeItemSnippet: TreeItemSnippet;
		getChildItems: GetChildItemsFn;
		getKey?: GetKeyFn;
		getLimit?: GetLimitFn;
	};

	let {
		// uid,
		ariaLabelledby,
		ariaLabel,
		items = [],
		treeItemSnippet,
		getChildItems,
		getKey = ({ index }) => index.toString(),
		getLimit
	}: Props = $props();
</script>

<ul role="tree" aria-labelledby={ariaLabelledby} aria-label={ariaLabel}>
	{#each items as item, index (getKey({ data: item, index }))}
		<TreeViewItem
			data={item}
			level={1}
			posinset={index + 1}
			selected={item?.selected}
			{treeItemSnippet}
			{getChildItems}
			{getKey}
			{getLimit}
		/>
	{/each}
</ul>
