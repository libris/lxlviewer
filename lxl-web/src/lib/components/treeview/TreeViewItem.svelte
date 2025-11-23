<script lang="ts">
	import type { TreeItem } from '$lib/types/treeview';
	import { getTreeViewContext } from '$lib/contexts/treeview';
	import { treeItems } from './TreeView.svelte';

	interface Props extends TreeItem {
		elementTag?: string;
		ownsId?: string;
		level: number;
	}

	const { elementTag, ...restProps }: Props = $props();

	const fallbackUid = $props.id();
	const { treeItem, animated } = getTreeViewContext();

	const { level, setsize, posinset, ownsId, items } = $derived(restProps);
	const useGeneratedId = $derived(animated && Array.isArray(restProps.items)); // generated IDs are used for `aria-owns` to identify the contextual relationship between parent/child elements when the DOM hierarchy cannot be used to represent the relationship (which is the case when with animated treeviews)
	const id = $derived(restProps.id || (useGeneratedId && fallbackUid) || undefined);
	let expanded = $derived(restProps.expanded); // derived expanded state is used to enable optimistic updates
	let selected = $derived(restProps.selected); // same as above...

	function handleToggleGroup(event: Event & { currentTarget: HTMLDetailsElement }) {
		expanded = event.currentTarget.open;
		if (!expanded) {
			event.currentTarget.scrollIntoView({ block: 'nearest' });
		}
	}

	function handleChangeSelected(_selected: boolean) {
		selected = _selected;
	}
</script>

{#snippet contents()}
	{@render treeItem({
		...restProps,
		onchangeselected: handleChangeSelected
	})}
{/snippet}

<svelte:element
	this={elementTag}
	role="treeitem"
	{id}
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
				{@render contents()}
			</summary>
			<ul
				role="group"
				class="relative min-w-0 flex-1 grow-0 overflow-hidden"
				style={`--level:${level + 1}`}
			>
				{@render treeItems(items, {
					level: level + 1,
					animated,
					ownsId: id
				})}
			</ul>
		</details>
	{:else}
		{@render contents()}
	{/if}
</svelte:element>

<style lang="postcss">
	@reference 'tailwindcss';
</style>
