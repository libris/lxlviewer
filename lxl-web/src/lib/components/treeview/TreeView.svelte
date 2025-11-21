<script module lang="ts">
	export { treeItems };
</script>

<script lang="ts">
	import type { TreeItem, GetKeyFn, TreeItemsParams } from '$lib/types/treeview';
	import { setTreeViewContext } from '$lib/contexts/treeview';
	import TreeViewItem from './TreeViewItem.svelte';

	interface Props extends Omit<TreeItemsParams, 'level'> {
		ariaLabelledby?: string;
		ariaLabel?: string;
	}

	let {
		// uid,
		ariaLabelledby,
		ariaLabel,
		items = [],
		treeItemSnippet,
		getSelected,
		getKey = ({ index }) => index.toString(),
		getGroupItems
	}: Props = $props();

	setTreeViewContext({ treeItemSnippet, getKey, getSelected, getGroupItems });
</script>

{#snippet treeItems({
	items,
	level,
	getKey
}: {
	items: TreeItem[];
	level: number;
	getKey: GetKeyFn;
})}
	{#each items as item, index (getKey({ data: item, index }))}
		<TreeViewItem data={item} {level} setsize={items.length} posinset={index + 1} />
	{/each}
{/snippet}

<ul role="tree" aria-labelledby={ariaLabelledby} aria-label={ariaLabel}>
	{@render treeItems({ items, level: 1, getKey })}
</ul>

<style lang="postcss">
	@reference 'tailwindcss';
</style>
