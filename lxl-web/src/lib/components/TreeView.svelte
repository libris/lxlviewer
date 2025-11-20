<script module lang="ts">
	export interface TreeItem {
		selected?: boolean; // indicates if the tree item is currently selected
		items?: TreeItem[];
	}

	export interface TreeItemSnippetParams {
		data: unknown;
		level: number;
		setsize?: number;
		expandedGroup?: boolean;
		groupSnippet?: Snippet;
	}

	export type TreeItemSnippet = Snippet<[TreeItemSnippetParams]>;

	export type GetChildItemsFn = ({ data, level }: GetChildItemsFnParams) => TreeItem[] | undefined;
	export type GetChildItemsFnParams = {
		data: unknown;
		level: number;
	};

	export type GetKeyFn = ({ data, index }: GetKeyFnParams) => string;
	export type GetKeyFnParams = {
		data: unknown;
		index: number;
	};

	export type GetLimitFn = ({ data, level, posinset }: GetLimitFnParams) => number | undefined;
	export type GetLimitFnParams = {
		data: unknown;
		level: number;
		posinset: number;
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { flip } from 'svelte/animate';
	import { send, receive } from '$lib/utils/transition';
	import IconChevron from '~icons/bi/chevron-right';

	type Props = {
		// uid?: string;
		ariaLabelledby?: string;
		ariaLabel?: string;
		items: TreeItem[];
		treeItemSnippet: TreeItemSnippet;
		getChildItems: GetChildItemsFn;
		getKey?: GetKeyFn;
		showChevrons?: boolean;
	};

	let {
		// uid,
		ariaLabelledby,
		ariaLabel,
		items = [],
		treeItemSnippet,
		getChildItems,
		getKey = ({ index }) => index.toString(),
		showChevrons = false
	}: Props = $props();

	function handleToggle(event: Event & { currentTarget: HTMLDetailsElement }) {
		if (!event.currentTarget.open) {
			event.currentTarget.scrollIntoView({ block: 'nearest' });
		}
	}
</script>

{#snippet chevron()}
	<div class="chevron pointer-events-none flex w-8 origin-center items-center justify-center">
		<div class="flex h-full w-8 origin-center items-center justify-center transition-transform">
			<IconChevron class={['text-subtle size-3']} />
		</div>
	</div>
{/snippet}

{#snippet treeItems({ items, level }: { items: unknown[]; level: number })}
	{#each items as item, index (getKey({ data: item, index }))}
		{@const key = getKey({ data: item, index })}
		{@const childItems = getChildItems?.({ data: item, level })}
		{@const isGroup = Array.isArray(childItems)}
		<li
			role="treeitem"
			aria-level={level}
			aria-setsize={items.length}
			aria-posinset={index + 1}
			style={isGroup ? `--level:${level}` : undefined}
			in:receive={{ key }}
			out:send={{ key }}
			animate:flip={{
				duration: prefersReducedMotion.current || isGroup ? 0 : 250
			}}
		>
			{#if isGroup}
				<details ontoggle={handleToggle} class="relative top-0 z-10 flex flex-1 flex-col">
					<summary
						class="hover:bg-primary-100 sticky top-0 z-20 flex w-full cursor-pointer items-stretch"
					>
						{#if showChevrons}
							{@render chevron()}
						{/if}
						{@render treeItemSnippet({ data: item, level })}
					</summary>
					<ul role="group" class="relative min-w-0 flex-1 grow-0 overflow-hidden">
						{@render treeItems({ items: childItems, level: level + 1 })}
					</ul>
				</details>
			{:else}
				{@render treeItemSnippet({ data: item, level })}
			{/if}
		</li>
	{/each}
{/snippet}

<ul role="tree" aria-labelledby={ariaLabelledby} aria-label={ariaLabel}>
	{@render treeItems({ items, level: 1 })}
</ul>

<style lang="postcss">
	@reference 'tailwindcss';

	details[open] > summary > .chevron > * {
		transform: rotate(90deg);
	}

	[role='group'] {
		padding-left: calc(var(--level, 0) * var(--spacing) * 6);
	}
</style>
