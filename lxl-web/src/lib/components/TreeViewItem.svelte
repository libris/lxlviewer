<script lang="ts">
	import TreeViewItem from '$lib/components/TreeViewItem.svelte';
	import IconChevron from '~icons/bi/chevron-right';
	import { type GetChildItemsFn, type TreeItemSnippet } from './TreeView.svelte';

	type Props = {
		data: unknown;
		level: number;
		setsize?: number;
		posinset: number;
		selected?: boolean;
		treeItemSnippet: TreeItemSnippet;
		getChildItems?: GetChildItemsFn;
	};

	let {
		data,
		level,
		setsize = $bindable(-1),
		posinset,
		selected,
		treeItemSnippet,
		getChildItems = ({ data }) => data?.items
	}: Props = $props();

	const childItems = $derived(getChildItems?.({ data, level, posinset }));
	const isGroup = $derived(Array.isArray(childItems));

	let expanded = $state(false);

	function handleToggle(event: Event & { currentTarget: HTMLDetailsElement }) {
		expanded = event.currentTarget.open;
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
	class={['flex min-h-9 w-full']}
>
	{#if isGroup}
		<details open={!!expanded} ontoggle={handleToggle} class="flex flex-1 flex-col">
			<summary
				class="bg-aside hover:bg-primary-100 focus-visible:bg-accent-100 sticky top-0 z-10 flex min-h-9 w-full cursor-pointer items-center pl-8 font-medium"
			>
				<span
					class="chevron pointer-events-none absolute left-0 flex h-full w-8 origin-center items-center justify-center transition-transform"
				>
					<IconChevron class="text-subtle size-3.5" />
				</span>
				{@render treeItemSnippet({ data, level, posinset, setsize })}
			</summary>
			<ul role="group">
				{#each childItems as item, index (index)}
					<TreeViewItem
						data={item}
						level={level + 1}
						posinset={index + 1}
						{getChildItems}
						{treeItemSnippet}
					/>
				{/each}
			</ul>
		</details>
	{:else}
		<a
			href="#"
			class="hover:bg-primary-100 focus-visible:bg-accent-100 flex w-full items-center"
			onclick={() => console.log('click', data)}
		>
			{@render treeItemSnippet({ data, level, posinset, setsize })}
		</a>
	{/if}
</li>

<style lang="postcss">
	@reference 'tailwindcss';

	[role='treeitem']:not([aria-expanded]) > * {
		padding-left: calc(var(--level) * (var(--spacing) * 8));
	}

	details[open] .chevron:first-of-type {
		transform: rotate(90deg);
	}

	details[open] > summary + * {
		position: relative;

		&::before {
			content: '';
			position: absolute;
			left: calc(var(--spacing) * 4);
			border-left: 1px solid var(--color-neutral-300);
			height: 100%;
			pointer-events: none;
		}
	}
</style>
