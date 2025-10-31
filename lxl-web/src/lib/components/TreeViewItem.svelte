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
		<details
			open={!!expanded}
			ontoggle={handleToggle}
			class="relative top-0 z-10 flex flex-1 flex-col"
		>
			<summary
				class="bg-aside hover:bg-primary-100 focus-visible:bg-accent-100 sticky top-0 z-20 flex min-h-9 w-full cursor-pointer items-center font-medium"
			>
				<span
					class="chevron pointer-events-none left-0 flex h-full w-8 origin-center items-center justify-center transition-transform"
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

	[role='treeitem'] {
		&:not([aria-expanded]) > * {
			padding-left: calc((var(--level) + 1) * (var(--spacing) * 4));
		}

		&[aria-expanded='true'] > details > summary .chevron {
			transform: rotate(90deg);
			left: calc(--var(--level) * var(--spacing) * 4);
		}
	}

	[role='treeitem'] > details {
		& > summary {
			top: calc((var(--level) - 1) * (var(--spacing) * 9));
			padding-left: calc((var(--level) - 1) * (var(--spacing) * 4));

			&::before {
				content: '';
				position: absolute;
				left: 0;
				height: 100%;
				width: calc((var(--level) - 1) * var(--spacing) * 4);
				background: red;
				pointer-events: none;
			}
		}
	}

	details[open] > summary + [role='group'] {
		position: relative;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			height: 100%;
			width: calc(var(--level) * var(--spacing) * 4);
			background: red;
			pointer-events: none;
		}
	}
</style>
