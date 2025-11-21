<script lang="ts">
	import type { TreeItem } from '$lib/types/treeview';
	import { getTreeViewContext } from '$lib/contexts/treeview';
	import { treeItems } from './TreeView.svelte';
	type Props = {
		data: TreeItem;
		level: number;
		setsize: number;
		posinset: number;
	};

	const { data, level, setsize, posinset }: Props = $props();

	const treeItemParams = getTreeViewContext();
	const { treeItemSnippet, getSelected, getGroupItems } = treeItemParams;

	let expanded: boolean = $state(false);
	let selected = $derived(getSelected?.({ data, level }));

	const groupItems = $derived(getGroupItems({ data, level }));
	const isGroup = $derived(Array.isArray(groupItems));

	function handleToggleGroup(event: Event & { currentTarget: HTMLDetailsElement }) {
		expanded = !!event.currentTarget.open;
		if (!expanded) {
			event.currentTarget.scrollIntoView({ block: 'nearest' });
		}
	}
</script>

<li
	role="treeitem"
	aria-level={level}
	aria-setsize={setsize}
	aria-posinset={posinset}
	aria-expanded={isGroup ? expanded : undefined}
	aria-selected={selected}
>
	{#if isGroup}
		<details ontoggle={handleToggleGroup} class="relative top-0 z-10 flex flex-1 flex-col">
			<summary
				class="hover:bg-primary-100 sticky top-0 z-20 flex w-full cursor-pointer items-stretch"
			>
				{@render treeItemSnippet({ data, level })}
			</summary>
			<ul
				role="group"
				class="relative min-w-0 flex-1 grow-0 overflow-hidden"
				style={`--level:${level + 1}`}
			>
				{@render treeItems({ ...treeItemParams, items: groupItems, level: level + 1 })}
			</ul>
		</details>
	{:else}
		{@render treeItemSnippet({ data, level })}
	{/if}
</li>

<style lang="postcss">
	@reference 'tailwindcss';
</style>
