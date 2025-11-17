<script lang="ts">
	import TreeViewItem from '$lib/components/TreeViewItem.svelte';
	import {
		type GetChildItemsFn,
		type GetKeyFn,
		type GetLimitFn,
		type TreeItemSnippet
	} from './TreeView.svelte';

	type Props = {
		data: unknown;
		level: number;
		setsize?: number;
		posinset: number;
		selected?: boolean;
		treeItemSnippet: TreeItemSnippet;
		getChildItems?: GetChildItemsFn;
		getKey: GetKeyFn;
		getLimit?: GetLimitFn;
	};

	let {
		data,
		level,
		setsize = $bindable(-1),
		posinset,
		selected,
		treeItemSnippet,
		getChildItems,
		getKey,
		getLimit
	}: Props = $props();

	const childItems = $derived(getChildItems?.({ data, level, posinset }));
	const isGroup = $derived(Array.isArray(childItems));

	let expanded = $state(false);

	function handleToggle(event: Event & { currentTarget: HTMLDetailsElement }) {
		expanded = event.currentTarget.open;
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
	aria-selected={selected}
	aria-expanded={isGroup ? expanded : undefined}
	style={isGroup ? `--level:${level}` : undefined}
>
	{#if isGroup}
		<details
			open={!!expanded}
			ontoggle={handleToggle}
			class="relative top-0 z-10 flex flex-1 flex-col"
		>
			<summary class="sticky top-0 z-20 flex w-full cursor-pointer items-stretch">
				{@render treeItemSnippet({ data, level, posinset, setsize, isGroup })}
			</summary>
			<ul role="group" class={['relative min-w-0 flex-1 grow-0 overflow-hidden']}>
				{#each childItems as item, index (getKey({ data: item, index }))}
					<TreeViewItem
						data={item}
						level={level + 1}
						posinset={index + 1}
						selected={item?.selected}
						{treeItemSnippet}
						{getChildItems}
						{getKey}
						{getLimit}
					/>
				{/each}
			</ul>
		</details>
	{:else}
		{@render treeItemSnippet({
			data,
			level,
			posinset,
			setsize,
			isGroup
		})}
	{/if}
</li>

<style lang="postcss">
	@reference 'tailwindcss';
</style>
