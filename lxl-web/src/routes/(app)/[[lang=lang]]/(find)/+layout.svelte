<script lang="ts">
	import { page } from '$app/stores';
	import { goto, pushState } from '$app/navigation';
	import SearchMapping from './SearchMapping.svelte';
	import SearchCard from './SearchCard.svelte';
	import Pagination from './Pagination.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Filters from './Filters.svelte';
	import IconSliders from '~icons/bi/sliders';

	const sortOrder = $page.url.searchParams.get('_sort');
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

	let openFilters = false;

	function handleShowFilters(event) {
		event.preventDefault();
		pushState($page.url.href, { ...$page.state, openFilters: true });
		openFilters = true;
	}

	function handleCloseFilters() {
		pushState($page.url.href, { ...$page.state, openFilters: false });
		openFilters = false;
		history.back();
	}

	function getFilterCount(searchResult) {
		if (searchResult) {
			return searchResult.mapping?.find((mappingItem) => mappingItem.children).children.length;
		}
	}
</script>

<slot />
{#if $page.data.searchResult}
	{#await $page.data.searchResult}
		<p class="px-8">Laddar...</p>
	{:then searchResult}
		{#if searchResult}
			{@const facets = searchResult.facetGroups}
			{@const numHits = searchResult.totalItems}
			<div class="find">
				<nav class="mappings" aria-label="Valda filter">
					<SearchMapping mapping={searchResult.mapping} />
				</nav>
				{#if openFilters}
					<Modal position="left" close={handleCloseFilters}>
						<span slot="title">Sökfilter ({getFilterCount(searchResult)} valda)</span>
						<Filters {facets} />
					</Modal>
				{/if}
				<div class="filters">
					<Filters {facets} />
				</div>

				<div class="results">
					<div class="toolbar mb-4 flex justify-between">
						<div class="flex items-center">
							<a
								href={`${$page.url.pathname}?${$page.url.searchParams.toString()}#find`}
								class="md:none icon-link"
								on:click={handleShowFilters}
								aria-label="Sökfilter"
							>
								<IconSliders width={20} height={20} />
								<div class="indicator">{getFilterCount(searchResult)}</div>
							</a>
							<span class="text-sm" role="status" data-testid="result-info">
								{#if numHits && numHits > 0}
									{numHits.toLocaleString($page.data.locale)} träffar
								{:else}
									Inga träffar
								{/if}
							</span>
						</div>

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
				</div>
			</div>
		{/if}
	{:catch error}
		<p>error loading search: {error.message}</p>
	{/await}
{/if}

<style lang="postcss">
	.find {
		position: relative;
	}

	.toolbar {
		grid-area: toolbar;
		display: flex;
		align-items: center;
		min-height: 44px;
	}

	.filters {
		grid-area: filters;
		display: none;
	}

	.mappings {
		grid-area: mappings;
		display: none;
	}

	@media screen and (min-width: theme('screens.md')) {
		.find {
			display: grid;
			grid-template-columns: 320px 1fr;
			grid-template-areas:
				'toolbar toolbar'
				'mappings mappings'
				'filters results';

			gap: 16px;
		}

		.filters {
			display: block;
		}

		.mappings {
			display: block;
		}

		.show-filters-button {
			display: none;
		}
	}
	/*
	.with-filters .show-filter-button,
	#find:target .show-filter-button {
		display: none;
	}
	*/

	.toolbar {
		min-height: 56px;
	}

	.results {
		grid-area: results;
	}
</style>
