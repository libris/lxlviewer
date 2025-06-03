<script lang="ts">
	import Node from '$lib/components/find/Node.svelte';
	import type { Facet } from '$lib/types/search';
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';
	import BiChevronRight from '~icons/bi/chevron-right';
	import BiChevronDown from '~icons/bi/chevron-down';
	import BiCheckSquareFill from '~icons/bi/check-square-fill';
	import BiSquare from '~icons/bi/square';
	import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';

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
		class="facet-link hover:bg-primary-50 grid grid-cols-[auto_auto] items-end justify-between gap-2 p-1 pl-2 font-normal no-underline"
		href={facet.view['@id']}
	>
		<span class="truncate" title={facet.str}>
			{#if 'selected' in facet}
				<!-- checkboxes -->
				<span class="sr-only">{facet.selected ? page.data.t('search.activeFilter') : ''}</span>
				<div class="mr-1 inline-block text-xs" aria-hidden="true">
					{#if facet.selected}
						<BiCheckSquareFill class="text-accent" />
					{:else}
						<BiSquare class="text-subtle" />
					{/if}
				</div>
			{/if}
			<span>
				<DecoratedDataLite data={facet.object} />
				{#if facet.discriminator}
					<span class="text-subtle">({facet.discriminator})</span>
				{/if}
			</span>
		</span>
		{#if facet.totalItems > 0}
			<span class="badge" aria-label="{facet.totalItems} {page.data.t('search.hits')}"
				>{facet.totalItems.toLocaleString(locale)}</span
			>
		{/if}
	</a>
</span>

{#if expanded}
	<ul transition:slide={{ duration: 300 }}>
		{#each facet._children as child, index (index)}
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
