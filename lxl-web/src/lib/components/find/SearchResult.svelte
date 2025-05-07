<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import SearchMapping from './SearchMapping.svelte';
	import SearchCard from './SearchCard.svelte';
	import Pagination from './Pagination.svelte';
	import Filters from './Filters.svelte';
	import SearchRelated from './SearchRelated.svelte';
	import IconSliders from '~icons/bi/sliders';
	import BiChevronDown from '~icons/bi/chevron-down';
	import BiSortDown from '~icons/bi/sort-down';
	import type { SearchResult, DisplayMapping } from '$lib/types/search';

	let showFiltersModal = false;
	export let searchResult: SearchResult;
	export let showMapping: boolean = false;

	$: sortOrder = $page.url.searchParams.get('_sort');
	const sortOptions = [
		{ value: '', label: $page.data.t('sort.relevancy') },
		{ value: `_sortKeyByLang.${$page.data.locale}`, label: $page.data.t('sort.alphaAsc') },
		{ value: `-_sortKeyByLang.${$page.data.locale}`, label: $page.data.t('sort.alphaDesc') },
		{ value: '-@reverse.instanceOf.publication.year', label: $page.data.t('sort.publicationDesc') },
		{ value: '@reverse.instanceOf.publication.year', label: $page.data.t('sort.publicationAsc') },
		{
			value: '-reverseLinks.totalItemsByRelation.itemOf.instanceOf',
			label: $page.data.t('sort.holdingsDesc')
		}
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
	{@const facets = searchResult.facetGroups || []}
	{@const predicates = searchResult.predicates || []}
	{@const numHits = searchResult.totalItems}
	{@const filterCount = getFiltersCount(searchResult.mapping)}
	{#if predicates.length}
		<nav
			class="border-neutral border-b px-4 lg:flex 2xl:px-6"
			aria-label={$page.data.t('search.selectedFilters')}
		>
			<ul class="flex flex-wrap items-center gap-2">
				<li class="block max-w-80 truncate py-4 text-sm whitespace-nowrap">
					<span class="font-medium">{$page.data.title}</span>
				</li>
				<li class="text-sm">{$page.data.t('search.occursAs')}</li>
				{#each predicates as p}
					<li>
						<a
							class="flex flex-nowrap items-center gap-1 py-4 pr-3.5 pl-4 lowercase no-underline"
							class:active={true}
							class:tab-selected={p.selected}
							data-sveltekit-replacestate
							href={p.view['@id']}
						>
							{p.str}
							<span
								class="badge badge-accent"
								aria-label="{p.totalItems} {$page.data.t('search.hits')}">{p.totalItems}</span
							>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}
	{#if showMapping}
		<nav
			class="hidden lg:flex lg:px-6 lg:pt-4 lg:pb-0"
			aria-label={$page.data.t('search.selectedFilters')}
		>
			<SearchMapping mapping={searchResult.mapping} />
		</nav>
	{/if}
	<div class="find-layout relative gap-y-4 p-4 sm:px-6">
		{#if showFiltersModal}
			<Modal position="left" close={toggleFiltersModal}>
				<span slot="title">
					{$page.data.t('search.filters')} ({numHits.toLocaleString($page.data.locale)}
					{numHits == 1 ? $page.data.t('search.hitsOne') : $page.data.t('search.hits')})
				</span>
				<Filters {facets} mapping={searchResult.mapping} />
			</Modal>
		{/if}
		<div class="filters hidden lg:block" id="filters">
			<Filters {facets} mapping={searchResult.mapping} />
		</div>

		<div class="results">
			<div
				class="toolbar flex items-center justify-between pb-2"
				class:has-search={$page.params.fnurgel}
			>
				<a
					href={`${$page.url.pathname}?${$page.url.searchParams.toString()}#filters`}
					class="filter-modal-toggle btn btn-primary lg:hidden"
					aria-label={$page.data.t('search.filters')}
					on:click|preventDefault={toggleFiltersModal}
				>
					<IconSliders class="text-base" />
					{$page.data.t('search.filters')}
					{#if filterCount}
						<span class="badge badge-accent">
							{filterCount}
						</span>
					{/if}
				</a>
				<span class="hits text-2xs pt-4 lg:pt-0" role="status" data-testid="result-info">
					{#if numHits && numHits > 0}
						<span class="hits-count">
							{#if numHits > searchResult.itemsPerPage}
								<span class="font-medium">
									{(searchResult.itemOffset + 1).toLocaleString($page.data.locale)}
									-
									{Math.min(
										numHits,
										searchResult.itemOffset + searchResult.itemsPerPage
									).toLocaleString($page.data.locale)}
								</span>
								{$page.data.t('search.hitsOf')}
							{/if}
							<span class="font-medium">
								{numHits.toLocaleString($page.data.locale)}
							</span>
							{#if $page.data.instances}
								{numHits == 1 ? $page.data.t('search.relatedOne') : $page.data.t('search.related')}
							{/if}
							{numHits == 1 ? $page.data.t('search.hitsOne') : $page.data.t('search.hits')}
						</span>
					{:else}
						<span class="hits-count">{$page.data.t('search.noResults')}</span>
					{/if}
					{#if searchResult._spell.length}
						<span class="suggest">
							{#each searchResult._spell as suggestion (suggestion.label)}
								{$page.data.t('search.didYouMean')}
								<a
									href={suggestion.view['@id'].replace('_spell=true', '_spell=false')}
									class="link-subtle"
								>
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
									{@html suggestion.labelHtml}</a
								>?
							{/each}
						</span>
					{/if}
				</span>
				<div class="search-related flex justify-start">
					{#if $page.params.fnurgel}
						{@const activePredicate = predicates.filter((p) => p.selected)}
						<SearchRelated view={activePredicate[0].view} />
					{/if}
				</div>
				{#if numHits > 0}
					<div
						class="sort-select flex flex-col items-end justify-self-end"
						data-testid="sort-select"
					>
						<label class="sr-only" for="search-sort">
							{$page.data.t('sort.sort')}
						</label>
						<div class="relative">
							<span class="text-subtle pointer-events-none absolute top-0 p-2">
								<BiSortDown aria-hidden="true" />
							</span>
							<select
								id="search-sort"
								class="btn btn-primary"
								form="main-search"
								on:change={handleSortChange}
							>
								{#each sortOptions as option}
									<option value={option.value} selected={option.value === sortOrder}
										>{option.label}</option
									>
								{/each}
							</select>
							<span class="text-subtle pointer-events-none absolute top-0 right-1.5 py-2.5 text-xs">
								<BiChevronDown aria-hidden="true" />
							</span>
						</div>
					</div>
				{/if}
			</div>
			<ol class="flex flex-col gap-0.5 lg:px-0">
				{#each searchResult.items as item (item['@id'])}
					<li>
						<SearchCard {item} />
					</li>
				{/each}
			</ol>
			<Pagination data={searchResult} />
		</div>
	</div>
{/if}

<style lang="postcss">
	@reference "../../../app.css";

	.toolbar {
		@apply grid;
		grid-template-areas:
			'filter-modal-toggle .'
			'search-related search-related'
			'hits sort-select';
	}

	.toolbar.has-search {
		@apply gap-4;
	}

	.toolbar:has(.suggest) {
		& .hits-count::after {
			content: '.';
		}
	}

	.find-layout {
		grid-template-areas: 'filters results';
	}

	.filter-modal-toggle {
		grid-area: filter-modal-toggle;
	}

	.filters {
		grid-area: filters;
	}

	#filters {
		&:target {
			display: block; /* TODO: fix better no-JS fallback styling */
		}
	}
	.results {
		grid-area: results;
	}

	.sort-select {
		grid-area: sort-select;

		& select {
			@apply appearance-none px-8 text-right;
			/* Safari text-align fix */
			text-align-last: right;
		}
	}

	.hits {
		grid-area: hits;
	}

	.search-related {
		grid-area: search-related;
	}

	.tab-selected {
		padding-bottom: cacl(--var(--spacing) * 3.5);
		border-bottom-color: var(--color-accent);
		border-bottom-width: 0.125rem;
	}

	@variant sm {
		.toolbar {
			grid-template-areas:
				'filter-modal-toggle search-related'
				'hits sort-select';
			grid-template-columns: auto 1fr;
		}
	}

	@variant lg {
		.filters {
			display: block;
		}

		.toolbar {
			grid-template-areas:
				'search-related search-related'
				'hits sort-select';
		}
	}
</style>
