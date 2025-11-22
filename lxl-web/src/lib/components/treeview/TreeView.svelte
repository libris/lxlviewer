<script module lang="ts">
	export { treeItems };
</script>

<script lang="ts">
	import type { TreeItem, TreeItemSnippet } from '$lib/types/treeview';
	import { setTreeViewContext } from '$lib/contexts/treeview';
	import TreeViewItem from './TreeViewItem.svelte';

	import { prefersReducedMotion } from 'svelte/motion';
	import { send, receive } from '$lib/utils/transition';

	interface Props extends Omit<TreeItem, 'key'> {
		id?: string;
		ariaLabelledby?: string;
		ariaLabel?: string;
		treeItemSnippet: TreeItemSnippet;
		animated?: boolean;
	}

	let { id, ariaLabelledby, ariaLabel, items = [], treeItemSnippet, animated }: Props = $props();

	setTreeViewContext({ treeItemSnippet, animated });
</script>

{#snippet treeItems(
	items: TreeItem[],
	options: { level: number; animated?: boolean; ownsId?: string } = { level: 1 }
)}
	{#if options.animated}
		{#each items as item (item.key)}
			<li role="none" in:receive={{ key: item.key }} out:send={{ key: item.key }}>
				<TreeViewItem elementTag="div" level={options.level} ownsId={options.ownsId} {...item} />
			</li>
		{/each}
	{:else}
		{#each items as item (item.key)}
			<TreeViewItem elementTag="li" level={options.level} ownsId={options.ownsId} {...item} />
		{/each}
	{/if}
{/snippet}

<ul role="tree" {id} aria-labelledby={ariaLabelledby} aria-label={ariaLabel}>
	{@render treeItems(items, { level: 1, animated: !prefersReducedMotion.current && animated })}
</ul>

<style lang="postcss">
	@reference 'tailwindcss';
</style>
