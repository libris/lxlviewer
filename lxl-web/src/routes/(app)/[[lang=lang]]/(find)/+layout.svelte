<script lang="ts">
	import { page } from '$app/stores';
	import { goto, replaceState } from '$app/navigation';
	//import SearchMapping from './SearchMapping.svelte';
	import SearchCard from './SearchCard.svelte';
	import Pagination from './Pagination.svelte';
	import FacetGroup from './FacetGroup.svelte';

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

	let searchPhrase = '';

	function handleShowFilters(event) {
		event.preventDefault();
		replaceState($page.url.href, { ...$page.state, showFilters: true });
	}

	function handleHideFilters(event) {
		event.preventDefault();
		replaceState($page.url.href.replace('#find', ''), { ...$page.state, showFilters: false });
	}

	$: console.log('$page.filters', $page.state);
</script>

<slot />
{#if $page.data.searchResult}
	{#await $page.data.searchResult}
		<p class="px-8">Laddar...</p>
	{:then searchResult}
		{#if searchResult}
			{@const facets = searchResult.facetGroups}
			{@const numHits = searchResult.totalItems}
			<div
				id="find"
				class="find"
				class:with-filters={$page.state.showFilters}
				class:without-filters={Object.hasOwn($page.state, 'showFilters') &&
					!$page.state.showFilters}
			>
				<!--
				<div class="visible-with-filters">
					<nav aria-label="Valda filter">
						<SearchMapping mapping={searchResult.mapping} />
					</nav>
				</div>
				-->
				<div class="filters visible-with-filters">
					<div class="filters-content">
						<a
							class="hide-filter-button visible-with-filters"
							href={`${$page.url.pathname}?${$page.url.searchParams.toString()}#`}
							on:click={handleHideFilters}
						>
							Stäng
						</a>
						<nav class="facets" aria-labelledby="facet-sidebar-header" data-testid="facet-panel">
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
					</div>
				</div>
				<div class="results">
					<div class="toolbar mb-4 flex justify-between">
						<div>
							<a
								class="show-filter-button"
								href={`${$page.url.pathname}?${$page.url.searchParams.toString()}#find`}
								on:click={handleShowFilters}
							>
								Sökfilter ({searchResult.mapping.length})
							</a>
							<p role="status" data-testid="result-info">
								{#if numHits && numHits > 0}
									{numHits.toLocaleString($page.data.locale)} träffar
								{:else}
									Inga träffar
								{/if}
							</p>
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
		background: green;
	}

	.filters {
		grid-area: filters;
		display: flex;
		flex-direction: column;
	}

	.mapping {
		grid-area: mapping;
	}

	.visible-with-filters {
		display: none;
	}

	.with-filters .visible-with-filters,
	#find:target .visible-with-filters {
		display: flex;
	}

	@media screen and (max-width: theme('screens.md')) {
		.with-filters .filters {
			position: fixed;
			left: 0;
			width: 100vw;
			height: 100vh;
			background: rgba(0, 0, 0, 0.5);
		}

		.filters-content {
			height: 100%;
			width: 80vw;
			background: #fff;
			@apply bg-main shadow-2xl;
		}
	}
	@media screen and (min-width: theme('screens.md')) {
		.find {
			display: grid;
			grid-template-columns: 320px 1fr;
			grid-template-areas:
				'toolbar toolbar'
				'filters results';

			gap: 16px;
		}

		.visible-with-filters {
			display: revert;
		}

		.show-filter-button,
		.visible-with-filters .hide-filter-button {
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
		background: #ebebeb;
	}

	.results {
		grid-area: results;
	}
</style>
