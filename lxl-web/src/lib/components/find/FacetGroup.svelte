<script lang="ts">
	import { page } from '$app/state';
	import type { LocaleCode } from '$lib/i18n/locales';
	import type { FacetGroup } from '$lib/types/search';
	import {
		CUSTOM_FACET_SORT,
		DEFAULT_FACET_SORT,
		DEFAULT_FACETS_SHOWN
	} from '$lib/constants/facets';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import { getMatomoTracker } from '$lib/contexts/matomo';
	import { popover } from '$lib/actions/popover';
	import FacetRange from './FacetRange.svelte';
	import BiChevronRight from '~icons/bi/chevron-right';
	import BiSortDown from '~icons/bi/sort-down';
	import BiCheckSquareFill from '~icons/bi/check-square-fill';
	import BiSquare from '~icons/bi/square';
	import BiInfo from '~icons/bi/info-circle';
	import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';

	// Todo: Rename FacetGroup -> Facet (facets -> items/facetItems)

	type FacetGroupProps = {
		group: FacetGroup;
		locale: LocaleCode;
		searchPhrase: string;
	};

	let { group, locale, searchPhrase }: FacetGroupProps = $props();

	const matomoTracker = getMatomoTracker();
	const userSettings = getUserSettings();

	const maxItems = group.maxItems;
	const totalItems = group.facets.length;
	let defaultItemsShown = $state(DEFAULT_FACETS_SHOWN);

	let currentSort = $state(
		userSettings.facetSort?.[group.dimension] ||
			CUSTOM_FACET_SORT[group.dimension as keyof typeof CUSTOM_FACET_SORT] ||
			DEFAULT_FACET_SORT
	);

	const sortOptions = [
		{ value: 'hits.desc', label: page.data.t('sort.hitsDesc') },
		{ value: 'hits.asc', label: page.data.t('sort.hitsAsc') },
		{ value: 'alpha.asc', label: getAlphaLabel('Asc') },
		{ value: 'alpha.desc', label: getAlphaLabel('Desc') }
	];

	const excludeSort = ['boolFilters'];

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
			} else {
				// hits.desc
				return b.totalItems < a.totalItems ? -1 : 1;
			}
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
	const canShowMoreItems = $derived(filteredItems.length > defaultItemsShown);
	const canShowFewerItems = $derived(
		!canShowMoreItems && filteredItems.length > DEFAULT_FACETS_SHOWN
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
</script>

<li
	class:hidden={searchPhrase && !hasHits}
	class:has-hits={hasHits}
	data-dimension={group.dimension}
>
	<details class="relative" open>
		<summary
			class="hover:bg-primary-100 flex min-h-9 w-full cursor-pointer items-center gap-2 pr-12 pl-3 text-xs font-medium"
			data-testid="facet-toggle"
		>
			<span class="arrow text-subtle transition-transform">
				<BiChevronRight />
			</span>
			<span class="flex-1 whitespace-nowrap">{group.label}</span>
		</summary>
		<!-- sorting -->
		{#if !excludeSort.includes(group.dimension)}
			<div class="facet-sort absolute top-0 right-2 size-8" data-testid="facet-sort">
				<select
					name={group.dimension}
					bind:value={currentSort}
					onchange={saveUserSort}
					class="btn btn-primary size-full appearance-none border-0 text-transparent"
					aria-label={page.data.t('sort.sort') + ' ' + page.data.t('search.filters')}
				>
					{#each sortOptions as option (option.value)}
						<option selected={option.value == currentSort} value={option.value}
							>{option.label}</option
						>
					{/each}
				</select>
				<BiSortDown class="pointer-events-none absolute top-0 right-0 m-2 text-base" />
			</div>
		{/if}
		<div class="text-2xs">
			{#if group.search && !(searchPhrase && hasHits)}
				<!-- facet range inputs; hide in filter search results -->
				<FacetRange search={group.search} />
			{/if}
			<ol
				class="flex max-h-72 flex-col overflow-x-clip overflow-y-auto sm:max-h-[437px]"
				data-testid="facet-list"
			>
				{#each shownItems as facet (facet.view['@id'])}
					<li class="hover:bg-primary-100">
						<a
							class="facet-link ml-4.5 grid grid-cols-[auto_auto] items-end justify-between gap-2 border-l border-l-neutral-200 py-1.5 pr-3 pl-4 font-normal no-underline"
							href={facet.view['@id']}
						>
							<span class="truncate" title={facet.str}>
								{#if 'selected' in facet}
									<!-- checkboxes -->
									<span class="sr-only"
										>{facet.selected ? page.data.t('search.activeFilter') : ''}</span
									>
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
					</li>
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
								: (defaultItemsShown = DEFAULT_FACETS_SHOWN)}
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
						class="text-error bg-severe-50 m-6 flex items-center gap-1 rounded-sm px-2 py-1"
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
	details[open] {
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

	/* hide sorting for bool filters */
	li[data-dimension='boolFilters'] details[open] .facet-sort {
		display: hidden;
	}
</style>
