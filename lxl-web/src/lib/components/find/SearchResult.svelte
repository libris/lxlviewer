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
			class="border-b border-primary/16 px-4 md:flex lg:px-6"
			aria-label={$page.data.t('search.selectedFilters')}
		>
			<ul class="flex flex-wrap items-center gap-2">
				<li class="tab-header max-w-80 truncate font-bold">{$page.data.title}</li>
				<span class="tab-header">{$page.data.t('search.occursAs')}</span>

				{#each predicates as p}
					<li>
						<a
							class="tab"
							class:active={true}
							class:tab-selected={p.selected}
							data-sveltekit-replacestate
							href={p.view['@id']}
						>
							{p.str}
							<span
								class="mb-px rounded-sm bg-pill/4 px-1 text-sm text-secondary md:text-xs lg:text-sm"
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
				class="toolbar flex min-h-14 items-center justify-between page-padding md:min-h-fit md:p-0 md:pb-4"
				class:has-search={$page.params.fnurgel}
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
				<span class="hits pt-4 text-secondary md:pt-0" role="status" data-testid="result-info">
					{#if numHits && numHits > 0}
						<span class="hits-count">
							{#if numHits > searchResult.itemsPerPage}
								<span class="text-3-cond-bold">
									{(searchResult.itemOffset + 1).toLocaleString($page.data.locale)}
									-
									{Math.min(
										numHits,
										searchResult.itemOffset + searchResult.itemsPerPage
									).toLocaleString($page.data.locale)}
								</span>
								{$page.data.t('search.hitsOf')}
							{/if}
							<span class="text-3-cond-bold">
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
								<a href={suggestion.view['@id'].replace('_spell=true', '_spell=false')}>
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
						<label class="pr-6 text-secondary text-2-regular" for="search-sort">
							{$page.data.t('sort.sort')}
						</label>
						<div class="relative">
							<select id="search-sort" form="main-search" on:change={handleSortChange}>
								{#each sortOptions as option}
									<option value={option.value} selected={option.value === sortOrder}
										>{option.label}</option
									>
								{/each}
							</select>
							<span class="pointer-events-none absolute right-0 top-[5px]">
								<BiChevronDown aria-hidden="true" class="text-icon" />
							</span>
						</div>
					</div>
				{/if}
			</div>
			<ol class="flex flex-col gap-0.5 md:px-0">
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
			@apply appearance-none pr-6 text-right;
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

	@media screen and (min-width: theme('screens.sm')) {
		.toolbar {
			grid-template-areas:
				'filter-modal-toggle search-related'
				'hits sort-select';
			grid-template-columns: auto 1fr;
		}
	}

	@media screen and (min-width: theme('screens.md')) {
		.filters {
			display: block;
		}

		.filter-modal-toggle {
			display: none;
		}

		.toolbar {
			grid-template-areas:
				'search-related search-related'
				'hits sort-select';
		}
	}
	.tab-header {
		@apply block py-4;
	}

	.tab {
		@apply block py-4 pl-4 pr-3.5 lowercase no-underline;
		transition: filter 0.1s ease;
	}

	.tab-selected {
		@apply border-primary pb-3.5;
		border-bottom-width: 0.125rem;
	}
</style>
