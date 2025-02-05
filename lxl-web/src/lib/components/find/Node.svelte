<script lang="ts">
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import Node from '$lib/components/find/Node.svelte';
	import DecoratedData from '../DecoratedData.svelte';
	import type { Facet } from '$lib/types/search';
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
	import BiChevronRight from '~icons/bi/chevron-right';
	import BiChevronDown from '~icons/bi/chevron-down';

	// Corresponds to a folder
	// Implies there are nodes
	let { expanded = $bindable(false), root: facet, locale } = $props();

	function toggle() {
		expanded = !expanded;
	}

	function isRootNode(f: Facet) {
		console.log('Inside node', JSON.stringify(f));
		return typeof f._children !== 'undefined';
	}
</script>

<span class="flex gap-1">
	{#if isRootNode(facet)}
		<button class:expanded onclick={toggle}>
			<span class="arrow transition-transform">
				{#if expanded}
					<BiChevronDown class="text-icon" />
				{:else}
					<BiChevronRight class="text-icon" />
				{/if}
			</span>
		</button>
	{/if}
	<a
		class="facet-link flex w-full items-end justify-between gap-2 no-underline"
		href={facet.view['@id']}
	>
		<span class="overflow-hidden text-ellipsis whitespace-nowrap">
			<span>
				<DecoratedData data={facet.object} showLabels={ShowLabelsOptions.Never} />
				{#if facet.discriminator}
					<span class="text-sm text-secondary">({facet.discriminator})</span>
				{/if}
			</span>
		</span>
		{#if facet.totalItems > 0}
			<span
				class="facet-total mb-px rounded-sm bg-pill/4 px-1 text-sm text-secondary md:text-xs"
				aria-label="{facet.totalItems} {$page.data.t('search.hits')}"
			>
				{facet.totalItems.toLocaleString(locale)}
			</span>
		{/if}
	</a>
</span>

{#if expanded}
	<ul transition:slide={{ duration: 300 }}>
		{#each facet._children as child}
			<Node root={child} {locale} />
		{/each}
	</ul>
{/if}

<style lang="postcss">
	ul {
		padding: 0.2em 0 0 1em;
		margin: 0 0 0 0.5em;
		list-style: none;
		border-left: 1px solid #eee;
	}

	.facet-link:hover,
	.facet-link:focus {
		& .facet-total {
			@apply bg-pill/8;
		}
	}
</style>
