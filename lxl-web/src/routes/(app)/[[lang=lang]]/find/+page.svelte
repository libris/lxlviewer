<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import SearchMapping from './SearchMapping.svelte';
	import SearchCard from './SearchCard.svelte';
	import Pagination from './Pagination.svelte';
	import FacetGroup from './FacetGroup.svelte';
	import { type SearchResult } from './search';

	$: searchResult = $page.data.searchResult as SearchResult;
	$: numHits = searchResult.totalItems;
	$: facets = searchResult.facetGroups;

	const sortOrder = $page.url.searchParams.get('_sort');
	const sortOptions = [
		{ value: '', label: 'Relevans' },
		{ value: `_sortKeyByLang.${$page.data.locale}`, label: 'A-Ö' },
		{ value: `-_sortKeyByLang.${$page.data.locale}`, label: 'Ö-A' }
	];

	function handleSortChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		let searchParams = $page.url.searchParams;
		searchParams.set('_sort', value);
		if (searchParams.has('_offset')) {
			searchParams.set('_offset', '0');
		}
		goto(`find?${searchParams.toString()}`, { invalidateAll: true });
	}
</script>

<div class="find">
	<nav class="mapping py-4" aria-label="Valda filter">
		<SearchMapping mapping={searchResult.mapping} />
	</nav>
	<nav class="facets hidden pr-4 lg:block" aria-labelledby="facet-sidebar-header">
		{#if facets && facets.length > 0}
			<header id="facet-sidebar-header" class="font-bold">Filter</header>
			<ol>
				{#each facets as group (group.dimension)}
					<FacetGroup {group} locale={$page.data.locale} />
				{/each}
			</ol>
		{/if}
	</nav>
	<section class="results">
		<div class="mb-4 flex justify-between">
			<p role="status" data-testid="result-info">
				{#if numHits && numHits > 0}
					{numHits.toLocaleString($page.data.locale)} träffar
				{:else}
					Inga träffar
				{/if}
			</p>
			{#if numHits > 0}
				<div data-testid="sort-select">
					<label for="search-sort">Sortera efter</label>
					<select id="search-sort" form="main-search" on:change={handleSortChange}>
						{#each sortOptions as option}
							<option value={option.value} selected={option.value === sortOrder}
								>{option.label}</option
							>
						{/each}
					</select>
				</div>
			{/if}
		</div>
		<ol class="flex flex-col gap-2">
			{#each searchResult.items as item (item['@id'])}
				<SearchCard {item} />
			{/each}
		</ol>
		<Pagination data={searchResult} />
	</section>
</div>

<style lang="postcss">
	.find {
		@media screen and (min-width: theme('screens.lg')) {
			display: grid;
			grid-template-areas:
				'mapping mapping'
				'facets results';
			grid-template-columns: 360px 1fr;
			grid-template-rows: min-content 1fr;
		}
	}

	.mapping {
		grid-area: mapping;
	}

	.facets {
		grid-area: facets;

		@media screen and (min-width: theme('screens.lg')) {
		}
	}

	.results {
		grid-area: results;
		align-items: flex-start;
	}
</style>
