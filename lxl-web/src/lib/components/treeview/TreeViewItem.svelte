<script lang="ts">
	import { TreePath, type TreeItem } from './TreeView.svelte';

	import { getTreeViewContext } from '$lib/contexts/treeview';
	import { treeItems } from './TreeView.svelte';
	import { TreeViewKeys } from '$lib/types/treeview';

	interface Props {
		data: TreeItem[];
		path: TreePath;
		elementTag?: string;
	}

	const { data, path, elementTag = 'li' }: Props = $props();

	const {
		treeItem,
		animated,
		getId,
		getSetsize,
		getPosinset,
		getExpanded,
		getSelected,
		getOwnsId,
		getHasSelected,
		tabbablePath
	} = getTreeViewContext();

	const groupItems = $derived(data.filter((item) => item.path.length === path.length + 1));
	const level = $derived(path.length);

	let expanded = $derived(getExpanded?.(path) || false);

	function handleKeyDown(event: KeyboardEvent) {
		if (Object.values(TreeViewKeys).includes(event.key as TreeViewKeys)) {
			event.preventDefault();
			const closestTreeItem = document.activeElement?.closest('[role="treeitem"]');
			console.log(
				'pressed treeview key',
				event.key,
				closestTreeItem?.hasAttribute('aria-expanded') ? 'is expandedable' : 'is not expandable'
			);
		}
	}
</script>

{#snippet fallbackContents()}
	<span>{JSON.stringify(path)}</span>
{/snippet}

{#snippet contents()}
	{#if treeItem}
		{@render treeItem({ path, level })}
	{:else}
		{@render fallbackContents()}
	{/if}
{/snippet}

<svelte:element
	this={elementTag}
	role="treeitem"
	id={getId?.(path)}
	aria-level={level}
	aria-setsize={getSetsize?.(path)}
	aria-posinset={getPosinset?.(path)}
	aria-expanded={groupItems.length ? expanded : undefined}
	aria-selected={getSelected?.(path)}
	aria-owns={getOwnsId?.(path)}
	data-has-selected={getHasSelected?.(path)}
>
	{#if groupItems.length}
		<details role="none" bind:open={expanded}>
			<summary
				tabindex={tabbablePath && path.isEqualPath(tabbablePath) ? 0 : -1}
				onkeydown={handleKeyDown}
			>
				{@render contents()}
			</summary>
			<ul role="group" style="--level:{level + 1}">
				{#each groupItems as item (item.path)}
					{@render treeItems(data, item.path, { animated })}
				{/each}
			</ul>
		</details>
	{:else}
		{@render contents()}
	{/if}
</svelte:element>

<style lang="postcss">
	@reference 'tailwindcss';

	summary {
		cursor: default;
		outline-offset: -2px;
	}
</style>
