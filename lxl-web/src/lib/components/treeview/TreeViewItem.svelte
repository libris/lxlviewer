<script lang="ts">
	import type { TreeItem } from '$lib/types/treeview';
	import { getTreeViewContext } from '$lib/contexts/treeview';
	import { treeItems } from './TreeView.svelte';

	interface Props extends TreeItem {
		elementTag?: string;
		ownsId?: string;
		level: number;
	}

	const {
		elementTag = 'li',
		id,
		items,
		expanded: _expanded,
		selected: _selected,
		level,
		setsize,
		posinset,
		ownsId,
		data
	}: Props = $props();

	const fallbackUid = $props.id();
	const { treeItemSnippet, animated } = getTreeViewContext();

	const useGeneratedId = $derived(animated && Array.isArray(items)); // generated IDs are used for `aria-owns` to identify the contextual relationship between parent/child elements when the DOM hierarchy cannot be used to represent the relationship (which is the case when with animated treeviews)
	let expanded = $derived(_expanded); // derived expanded state is used to enable optimistic updates
	let selected = $derived(_selected); // derived selected state is used to enable optimistic updates

	function handleToggleGroup(event: Event & { currentTarget: HTMLDetailsElement }) {
		expanded = event.currentTarget.open;
		if (!expanded) {
			event.currentTarget.scrollIntoView({ block: 'nearest' });
		}
	}

	function handleSelectTreeItem(selectedFromEvent: boolean) {
		selected = selectedFromEvent;
	}
</script>

<svelte:element
	this={elementTag}
	role="treeitem"
	id={id || (useGeneratedId && fallbackUid) || undefined}
	aria-level={level}
	aria-setsize={setsize}
	aria-posinset={posinset}
	aria-expanded={expanded}
	aria-selected={selected}
	aria-owns={ownsId}
>
	{#if Array.isArray(items)}
		<details
			open={expanded}
			ontoggle={handleToggleGroup}
			class="relative top-0 z-10 flex flex-col"
			role="none"
		>
			<summary class="sticky top-0 z-20 items-stretch">
				{@render treeItemSnippet({ data, onselecttreeitem: handleSelectTreeItem })}
			</summary>
			<ul
				role="group"
				class="relative min-w-0 flex-1 grow-0 overflow-hidden"
				style={`--level:${level + 1}`}
			>
				{@render treeItems(items, {
					level: level + 1,
					animated,
					ownsId: id || (useGeneratedId && fallbackUid)
				})}
			</ul>
		</details>
	{:else}
		{@render treeItemSnippet({ data, onselecttreeitem: handleSelectTreeItem })}
	{/if}
</svelte:element>

<style lang="postcss">
	@reference 'tailwindcss';
</style>
