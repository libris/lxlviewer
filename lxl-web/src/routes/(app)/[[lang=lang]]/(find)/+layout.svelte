<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import SearchMapping from './SearchMapping.svelte';
	import SearchCard from './SearchCard.svelte';
	import Pagination from './Pagination.svelte';
	import Filters from './Filters.svelte';
	import IconSliders from '~icons/bi/sliders';
	import type { SearchResult, DisplayMapping } from './search';
	import { shouldShowMapping } from './utils';

	let showFiltersModal = false;

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

	function toggleFiltersModal() {
		showFiltersModal = !showFiltersModal;
	}

	function getFiltersCount(mapping: DisplayMapping[]) {
		return (mapping[0].children || mapping).filter(
			(filterItem) => !(filterItem.display === '*' && filterItem.operator === 'equals') // TODO: probably best to do wildcard-filtering in an earlier step (in search.ts)?
		).length;
	}
</script>

<slot />
{#if searchResult}
	{#await searchResult}
		<p class="p-4">{$page.data.t('search.loading')}</p>
	{:then searchResult}
		{#if searchResult}
			{@const facets = searchResult.facetGroups}
			{@const numHits = searchResult.totalItems}
			{@const filterCount = getFiltersCount(searchResult.mapping)}
			{#if shouldShowMapping(searchResult.mapping)}
				<nav
					class="hidden md:flex md:px-6 md:pb-0 md:pt-4"
					aria-label={$page.data.t('search.selectedFilters')}
				>
					<SearchMapping mapping={searchResult.mapping} />
				</nav>
			{/if}
			<div class="relative gap-y-4 find-layout md:page-padding">
				{#if showFiltersModal}
					<Modal position="left" close={toggleFiltersModal}>
						<span slot="title">
							{$page.data.t('search.filters')} ({numHits.toLocaleString($page.data.locale)}
							{numHits == 1 ? $page.data.t('search.hitsOne') : $page.data.t('search.hits')})
						</span>
						<Filters {facets} mapping={searchResult.mapping} />
					</Modal>
				{/if}
				<div class="filters hidden md:block" id="filters">
					<Filters {facets} mapping={searchResult.mapping} />
				</div>

				<div class="results max-w-content">
					<div
						class="toolbar flex min-h-14 items-center justify-between pb-4 page-padding md:min-h-fit"
					>
						<a
							href={`${$page.url.pathname}?${$page.url.searchParams.toString()}#filters`}
							class="filter-modal-toggle button-ghost md:hidden"
							aria-label={$page.data.t('search.filters')}
							on:click|preventDefault={toggleFiltersModal}
						>
							<IconSliders width={20} height={20} />
							{$page.data.t('search.filters')}
							{#if filterCount}
								<span
									class="flex h-5 w-5 items-center justify-center rounded-full bg-pill text-xs font-bold leading-none text-primary-inv"
								>
									{filterCount}
								</span>
							{/if}
						</a>
						<span
							class="hits pt-4 text-secondary text-3-cond-bold md:pt-0"
							role="status"
							data-testid="result-info"
						>
							{#if numHits && numHits > 0}
								{numHits.toLocaleString($page.data.locale)}
								{#if $page.data.instances}
									{numHits == 1
										? $page.data.t('search.relatedOne')
										: $page.data.t('search.related')}
								{/if}
								{numHits == 1 ? $page.data.t('search.hitsOne') : $page.data.t('search.hits')}
							{:else}
								{$page.data.t('search.noResults')}
							{/if}
						</span>
						{#if numHits > 0}
							<div
								class="sort-select flex flex-col items-baseline justify-self-end"
								data-testid="sort-select"
							>
								<label class="text-secondary text-2-regular" for="search-sort">
									{$page.data.t('sort.sortBy')}
								</label>
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
					<ol class="flex flex-col gap-2 md:px-0">
						{#each searchResult.items as item (item['@id'])}
							<SearchCard {item} />
						{/each}
					</ol>
					<Pagination data={searchResult} />
				</div>
			</div>
		{/if}
	{/await}
{/if}

<style lang="postcss">
	.toolbar {
		display: grid;
		grid-template-areas:
			'filter-modal-toggle sort-select'
			'hits hits';
	}

	.find-layout {
		grid-template-areas: 'filters results';
	}

	.filters {
		grid-area: filters;
	}

	#filters {
		&:target {
			display: block; /* TODO: fix better no-JS fallback styling */
		}
	}

	.mappings {
		grid-area: mappings;
	}

	.results {
		grid-area: results;
	}

	.filter-toggle {
		grid-area: filter-toggle;
	}

	.sort-select {
		grid-area: sort-select;
	}

	.hits {
		grid-area: hits;
	}

	@media screen and (min-width: theme('screens.md')) {
		.filters {
			display: block;
		}

		.mappings {
			display: block;
		}

		.filter-modal-toggle {
			display: none;
		}

		.toolbar {
			grid-template-areas: 'hits sort-select';
		}
	}
</style>
