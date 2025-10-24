<script module lang="ts">
	export interface TreeItem {
		ariaSelected?: boolean; // indicates if the tree item is currently selected
		items?: TreeItem[];
	}

	export interface TreeItemSnippetParams {
		items?: TreeItem[];
	}

	export interface GroupSnippetParams {
		items?: TreeItem[];
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		ariaLabelledby?: string;
		ariaLabel?: string;
		items: TreeItem[];
		groupSnippet: Snippet<[GroupSnippetParams]>;
		treeItemSnippet: Snippet<[TreeItemSnippetParams]>;
		itemsPropertyKey?: string;
		// labelPropertyKey?: string;
	};

	let {
		ariaLabelledby,
		ariaLabel,
		items = [],
		itemsPropertyKey = 'items',
		// labelPropertyKey = 'label',
		groupSnippet,
		treeItemSnippet
	}: Props = $props();
</script>

<ul role="tree" aria-labelledby={ariaLabelledby} aria-label={ariaLabel}>
	<!-- items should be dynamic -->
	{#each items as item, index (index)}
		{#if Object.hasOwn(item, itemsPropertyKey)}
			{@render group(item, item[itemsPropertyKey as keyof TreeItem] as TreeItem[])}
		{:else}
			{@render treeItem(item)}
		{/if}
	{/each}
</ul>

{#snippet group(data, items?: TreeItem[])}
	<ul role="group">
		<details>
			<summary class="bg-page sticky top-0 cursor-pointer"
				>{@render groupSnippet(data, items)}</summary
			>
			{#each items as item, index (index)}
				{@render treeItem(item)}
			{/each}
		</details>
	</ul>
{/snippet}

{#snippet treeItem(data: TreeItem)}
	<li role="treeitem" aria-selected={data.ariaSelected}>
		{#if Object.hasOwn(data, itemsPropertyKey)}
			{@render group(data, data[itemsPropertyKey as keyof TreeItem] as TreeItem[])}
		{:else}
			{@render treeItemSnippet(data)}
		{/if}
	</li>
{/snippet}
