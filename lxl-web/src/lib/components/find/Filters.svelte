<script lang="ts">
	import { page } from '$app/state';
	import type { Facet } from '$lib/types/search';
	import Toolbar from '$lib/components/Toolbar.svelte';

	type Props = {
		facets?: Facet[];
		showHeader?: boolean;
	};

	const { facets, showHeader = true }: Props = $props();
</script>

<nav class="filters" data-testid="filters">
	{#if showHeader}
		<Toolbar>
			<h2 class="font-medium">
				{page.data.t('search.filters')}
			</h2>
		</Toolbar>
	{/if}
	{#if facets?.length}
		<ol class="filters-list text-4xs mr-1.5 overflow-x-hidden overflow-y-auto overscroll-contain">
			{#each facets as facet (facet.dimension)}
				<pre>{JSON.stringify(facet, null, 2)}</pre>
			{/each}
		</ol>
	{:else}
		<span role="status" aria-atomic="true">
			{page.data.t('search.noResults')}
		</span>
	{/if}
</nav>

<style lang="postcss">
	/* hide 'no hits' msg as long as there's results displaying */
	:global(.facet-nav:has(.has-hits) .no-hits-msg) {
		display: none;
	}

	:global(dialog .facet-nav) {
		margin-right: calc(var(--spacing) * -4);
		margin-left: calc(var(--spacing) * -4);
	}

	.filters-list {
		height: calc(var(--leading-pane-height) - var(--toolbar-height) * 2);
		scrollbar-width: thin;
	}
</style>
