<script lang="ts">
	import { page } from '$app/state';
	import type { Facet, FacetGroup } from '$lib/types/search';
	import { ExpandedState } from '$lib/types/userSettings';
	import {
		CUSTOM_FACET_SORT,
		DEFAULT_FACET_SORT,
		DEFAULT_FACET_VALUES_SHOWN,
		MY_LIBRARIES_FILTER_ALIAS
	} from '$lib/constants/facets';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import { getMatomoTracker } from '$lib/contexts/matomo';
	import { popover } from '$lib/actions/popover';
	import FacetValue from '$lib/components/find/FacetValue.svelte';
	import FacetRange from '$lib/components/find/FacetRange.svelte';
	import BiChevronRight from '~icons/bi/chevron-right';
	import BiSortDown from '~icons/bi/sort-down';
	import BiInfo from '~icons/bi/info-circle';
	import BiPencil from '~icons/bi/pencil';

	// Todo: Rename FacetGroup -> Facet (facets -> items/facetItems)

	type FacetGroupProps = {
		group: FacetGroup;
		searchPhrase: string;
		isDefaultExpanded: boolean;
		parentFacet?: Facet;
	};

	let { group, searchPhrase, isDefaultExpanded, parentFacet }: FacetGroupProps = $props();

	const matomoTracker = getMatomoTracker();
	const userSettings = getUserSettings();

	let detailsEl: HTMLDetailsElement | undefined = undefined;

	const maxItems = group.maxItems;
	const totalItems = group.facets.length;
	let defaultItemsShown = $state(DEFAULT_FACET_VALUES_SHOWN);

	let currentSort = $state(
		userSettings.facetSort?.[group.dimension] ||
			CUSTOM_FACET_SORT[group.dimension as keyof typeof CUSTOM_FACET_SORT] ||
			DEFAULT_FACET_SORT
	);

	let isUserOrDefaultExpanded = $derived(
		userSettings.facetExpanded?.[group.dimension]
			? userSettings.facetExpanded?.[group.dimension] === ExpandedState.OPEN
			: isDefaultExpanded
	);

	const sortOptions = [
		{ value: 'hits.desc', label: page.data.t('sort.hitsDesc') },
		{ value: 'hits.asc', label: page.data.t('sort.hitsAsc') },
		{ value: 'alpha.asc', label: getAlphaLabel('Asc') },
		{ value: 'alpha.desc', label: getAlphaLabel('Desc') }
	];

	function getAlphaLabel(dir: 'Asc' | 'Desc' = 'Desc'): string {
		let key = group.dimension === 'yearPublished' ? `sort.year${dir}` : `sort.alpha${dir}`;
		return page.data.t(key);
	}

	const sortedItems = $derived(
		[...group.facets].sort((a, b) => {
			if (currentSort === 'hits.asc') {
				return b.totalItems > a.totalItems ? -1 : 1;
			}
			if (currentSort === 'alpha.desc') {
				return b.str.localeCompare(a.str, page.data.locale);
			}
			if (currentSort === 'alpha.asc') {
				return a.str.localeCompare(b.str, page.data.locale);
			}
			if (a.totalItems === b.totalItems) {
				return 0;
			}
			return b.totalItems < a.totalItems ? -1 : 1; // hits.desc
		})
	);

	const filteredItems = $derived(
		sortedItems.filter((facet) => {
			return facet.str
				.toLowerCase()
				.split(/\s|--/)
				.find((s) => s.startsWith(searchPhrase.toLowerCase()));
		})
	);

	const shownItems = $derived(filteredItems.filter((facet, index) => index < defaultItemsShown));
	let hasHits = $derived(filteredItems.length > 0);
	let expanded = $derived(isUserOrDefaultExpanded || (searchPhrase && hasHits));
	const canShowMoreItems = $derived(filteredItems.length > defaultItemsShown);
	const canShowFewerItems = $derived(
		!canShowMoreItems && filteredItems.length > DEFAULT_FACET_VALUES_SHOWN
	);
	const maxItemsReached = $derived(totalItems === maxItems);

	function saveUserSort(e: Event): void {
		const target = e.target as HTMLSelectElement;
		userSettings.saveFacetSort(group.dimension, target.value);

		// testing analytics event tracker
		if ($matomoTracker) {
			$matomoTracker.trackEvent('Facet sort', group.dimension, target.value);
		}
	}

	function saveUserExpanded(e: Event): void {
		e.preventDefault();
		if (detailsEl) {
			userSettings.saveFacetExpanded(group.dimension, !detailsEl.open);
		}
	}
</script>

<li
	class="w-full"
	class:hidden={searchPhrase && !hasHits}
	class:has-hits={hasHits}
	data-dimension={group.dimension}
>
	<details class="relative" open={!!expanded} bind:this={detailsEl}>
		{#if !parentFacet}
			<summary
				class="hover:bg-primary-100 flex min-h-9 w-full cursor-pointer items-center gap-2 pr-12 pl-3 text-xs font-medium"
				data-testid="facet-toggle"
				onclick={saveUserExpanded}
			>
				<span class="arrow text-subtle transition-transform">
					<BiChevronRight />
				</span>
				<span class="flex-1 whitespace-nowrap">{group.label}</span>
			</summary>
		{:else}
			<summary
				class="hover:bg-primary-100 flex w-full cursor-pointer items-center gap-2 pr-3 pl-3 text-xs font-medium"
				data-testid="facet-toggle"
			>
				<span class="arrow text-subtle transition-transform">
					<button onclick={saveUserExpanded}>
						<BiChevronRight />
					</button>
				</span>
				<FacetValue facet={parentFacet} isEmbedded={true} />
			</summary>
		{/if}
		<!-- sorting -->
		<div class={['facet-sort absolute top-0 size-8', parentFacet ? 'right-15' : 'right-2']}>
			<select
				name={group.dimension}
				bind:value={currentSort}
				onchange={saveUserSort}
				class="btn btn-primary size-full appearance-none border-0 text-transparent"
				aria-label={page.data.t('sort.sort') + ' ' + page.data.t('search.filters')}
				data-testid={`facet-sort-${group.dimension}`}
			>
				{#each sortOptions as option (option.value)}
					<option selected={option.value == currentSort} value={option.value}>{option.label}</option
					>
				{/each}
			</select>
			<BiSortDown class="pointer-events-none absolute top-0 right-0 m-2 text-base" />
		</div>
		<div class="text-2xs">
			{#if group.search && !(searchPhrase && hasHits)}
				<!-- facet range inputs; hide in filter search results -->
				<FacetRange search={group.search} />
			{/if}
			<ol
				class="flex max-h-72 flex-col overflow-x-clip overflow-y-auto sm:max-h-[453px]"
				data-testid="facet-list"
			>
				{#each shownItems as facet (facet.str + facet.view['@id'])}
					{#if !facet.facetGroups}
						<li class="facet-group-list-value hover:bg-primary-100 flex">
							<FacetValue {facet} />
							{#if 'alias' in facet && facet.alias === MY_LIBRARIES_FILTER_ALIAS}
								<a
									href={page.data.localizeHref('/my-pages')}
									class="btn btn-primary mr-2 border-0"
									aria-label={page.data.t('search.changeLibraries')}
								>
									<BiPencil />
								</a>
							{/if}
						</li>
					{:else}
						<li class="flex w-full">
							<ol class="ml-4.5 flex w-full border-l border-l-neutral-200">
								{#each facet.facetGroups as group, index (group.dimension)}
									{#if index < 1}
										<!-- for now hide category @none directly under find -->
										<svelte:self
											{group}
											{searchPhrase}
											isDefaultExpanded={false}
											parentFacet={facet}
										/>
									{/if}
								{/each}
							</ol>
						</li>
					{/if}
				{/each}
			</ol>
			<div class="text-2xs flex flex-col justify-start">
				<!-- 'show more' btn -->
				{#if canShowMoreItems || canShowFewerItems}
					<button
						class="hover:bg-primary-100 w-full"
						onclick={() =>
							canShowMoreItems
								? (defaultItemsShown = totalItems)
								: (defaultItemsShown = DEFAULT_FACET_VALUES_SHOWN)}
					>
						<span class="ml-4.5 block border-l border-l-neutral-200 py-1.5 pr-3 pl-4 text-left">
							{canShowMoreItems
								? page.data.t('search.showMore')
								: page.data.t('search.showFewer')}...
						</span>
					</button>
				{/if}
				<!-- limit reached info -->
				{#if maxItemsReached && (canShowFewerItems || (!canShowMoreItems && searchPhrase))}
					<button
						class="text-error bg-severe-50 m-3 flex items-center gap-1 rounded-sm px-2 py-1"
						use:popover={{
							title: page.data.t('facet.limitText'),
							placeAsSibling: false
						}}
					>
						<span>{page.data.t('facet.limitInfo')}</span>
						<span class="sr-only">{page.data.t('facet.limitText')}</span>
						<BiInfo aria-hidden="true" />
					</button>
				{/if}
			</div>
		</div>
	</details>
</li>

<style lang="postcss">
	details[open] > summary {
		& .arrow {
			rotate: 90deg;
		}
		& .facet-sort {
			display: block;
		}

		& summary:hover {
			background-color: inherit;
		}
	}

	.facet-group-list-value:has(.btn:hover) {
		background-color: inherit;
	}

	/* hide sorting for bool filters */
	li[data-dimension='boolFilters'] details[open] .facet-sort {
		display: none;
	}

	li[data-dimension='accessFilters'] details[open] .facet-sort {
		display: none;
	}
</style>
