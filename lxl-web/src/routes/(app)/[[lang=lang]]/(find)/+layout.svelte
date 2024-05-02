<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import SearchMapping from './SearchMapping.svelte';
	import SearchCard from './SearchCard.svelte';
	import Pagination from './Pagination.svelte';
	import FacetGroup from './FacetGroup.svelte';
	import type { SearchResult } from './search';

	$: searchResult = $page.data.searchResult as SearchResult;

	$: sortOrder = $page.url.searchParams.get('_sort');
	const sortOptions = [
		{ value: '', label: $page.data.t('sort.relevancy') },
		{ value: `_sortKeyByLang.${$page.data.locale}`, label: $page.data.t('sort.alphaAsc') },
		{ value: `-_sortKeyByLang.${$page.data.locale}`, label: $page.data.t('sort.alphaDesc') },
		{ value: '-@reverse.instanceOf.publication.year', label: $page.data.t('sort.publicationDesc') },
		{ value: '@reverse.instanceOf.publication.year', label: $page.data.t('sort.publicationAsc') },
		{ value: '-reverseLinks.totalItems', label: $page.data.t('sort.linksDesc') }
	];

	function handleSortChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		let searchParams = $page.url.searchParams;
		searchParams.set('_sort', value);
		if (searchParams.has('_offset')) {
			searchParams.set('_offset', '0');
		}
		goto(`${$page.url.pathname}?${searchParams.toString()}`, { invalidateAll: true });
	}

	let searchPhrase = '';
</script>

<slot />
{#if searchResult}
	{#await searchResult}
		<p class="px-8">Laddar...</p>
	{:then searchResult}
		{#if searchResult}
			{@const facets = searchResult.facetGroups}
			{@const numHits = searchResult.totalItems}
			<div class="find container-fluid">
				<nav class="mapping" aria-label="Valda filter">
					<SearchMapping mapping={searchResult.mapping} />
				</nav>
				<nav
					class="lg:facets hidden lg:block"
					aria-labelledby="facet-sidebar-header"
					data-testid="facet-panel"
				>
					{#if facets && facets.length > 0}
						<header id="facet-sidebar-header" class="font-bold">Filter</header>
						<input
							bind:value={searchPhrase}
							class="mt-2"
							placeholder={$page.data.t('search.findFilter')}
							title={$page.data.t('search.findFilter')}
							type="search"
						/>
						<ol>
							{#each facets as group (group.dimension)}
								<FacetGroup {group} locale={$page.data.locale} {searchPhrase} />
							{/each}
						</ol>
					{/if}
				</nav>
				<section class="results">
					<div class="mb-4 flex items-center justify-between">
						<p role="status" data-testid="result-info">
							{#if numHits && numHits > 0}
								{numHits.toLocaleString($page.data.locale)} träffar
							{:else}
								Inga träffar
							{/if}
						</p>
						{#if numHits > 0}
							<div class="flex flex-col items-baseline" data-testid="sort-select">
								<label class="pl-1 text-secondary text-2-regular" for="search-sort"
									>{$page.data.t('sort.sortBy')}</label
								>
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
		{/if}
	{:catch error}
		<p>error loading search: {error.message}</p>
	{/await}
{/if}

<style lang="postcss">
	.find {
		@apply grid gap-4 py-4;
		grid-template-areas:
			'mapping'
			'results';

		@media screen and (min-width: theme('screens.lg')) {
			grid-template-areas:
				'mapping mapping'
				'facets results';
			grid-template-columns: 320px 1fr;
		}
	}

	.mapping {
		grid-area: mapping;
	}

	.facets {
		grid-area: facets;
	}

	.results {
		grid-area: results;
	}
</style>
