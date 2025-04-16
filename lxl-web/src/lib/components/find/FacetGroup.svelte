<script lang="ts">
	import { page } from '$app/state';
	import type { LocaleCode } from '$lib/i18n/locales';
	import type { FacetGroup } from '$lib/types/search';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import {
		DEFAULT_FACETS_SHOWN,
		DEFAULT_FACET_SORT,
		CUSTOM_FACET_SORT
	} from '$lib/constants/facets';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import { getMatomoTracker } from '$lib/contexts/matomo';
	import { popover } from '$lib/actions/popover';
	import FacetRange from './FacetRange.svelte';
	import DecoratedData from '../DecoratedData.svelte';
	import BiChevronRight from '~icons/bi/chevron-right';
	import BiSortDown from '~icons/bi/sort-down';
	import BiCheckSquareFill from '~icons/bi/check-square-fill';
	import BiSquare from '~icons/bi/square';
	import BiInfo from '~icons/bi/info-circle';

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
	class="border-b border-primary/16 first:border-t"
	class:hidden={searchPhrase && !hasHits}
	class:has-hits={hasHits}
	data-dimension={group.dimension}
>
	<details class="relative" open>
		<summary
			class="flex min-h-11 w-full cursor-pointer items-center gap-2 font-bold"
			data-testid="facet-toggle"
		>
			<span class="arrow transition-transform">
				<BiChevronRight class="text-icon" />
			</span>
			<span class="flex-1 whitespace-nowrap">{group.label}</span>
		</summary>
		<!-- sorting -->
		<div class="facet-sort absolute right-0 top-2 hidden" data-testid="facet-sort">
			<select
				bind:value={currentSort}
				onchange={saveUserSort}
				class="appearance-none px-6 py-1 text-2-regular"
				aria-label={page.data.t('sort.sort') + ' ' + page.data.t('search.filters')}
			>
				{#each sortOptions as option (option.value)}
					<option selected={option.value == currentSort} value={option.value}>{option.label}</option
					>
				{/each}
			</select>
			<BiSortDown class="pointer-events-none absolute top-0 m-1.5 text-icon-strong" />
			<BiChevronRight
				class="pointer-events-none absolute right-0 top-0 m-1.5 w-3 rotate-90 text-icon-strong"
			/>
		</div>
		<div class="text-md mb-4 md:text-sm">
			{#if group.search && !(searchPhrase && hasHits)}
				<!-- facet range inputs; hide in filter search results -->
				<FacetRange search={group.search} />
			{/if}
			<ol
				class="flex max-h-72 flex-col gap-1 overflow-y-auto overflow-x-clip pl-6 pr-0.5 sm:max-h-[437px]"
				data-testid="facet-list"
			>
				{#each shownItems as facet (facet.view['@id'])}
					<li>
						<a
							class="facet-link flex items-end justify-between gap-2 no-underline"
							href={facet.view['@id']}
						>
							<span class="overflow-hidden text-ellipsis whitespace-nowrap" title={facet.str}>
								{#if 'selected' in facet}
									<!-- checkboxes -->
									<span class="sr-only"
										>{facet.selected ? page.data.t('search.activeFilter') : ''}</span
									>
									<div class="mr-1 inline-block h-[13px] w-[13px]" aria-hidden="true">
										{#if facet.selected}
											<BiCheckSquareFill height="13px" />
										{:else}
											<BiSquare height="13px" />
										{/if}
									</div>
								{/if}
								<span>
									<DecoratedData data={facet.object} showLabels={ShowLabelsOptions.Never} />
									{#if facet.discriminator}
										<span class="text-sm text-secondary">({facet.discriminator})</span>
									{/if}
								</span>
							</span>
							{#if facet.totalItems > 0}
								<span
									class="facet-total mb-px rounded-sm bg-primary/4 px-1 text-sm text-secondary md:text-xs"
									aria-label="{facet.totalItems} {page.data.t('search.hits')}"
									>{facet.totalItems.toLocaleString(locale)}</span
								>
							{/if}
						</a>
					</li>
				{/each}
			</ol>
			<div class="flex">
				<!-- 'show more' btn -->
				{#if canShowMoreItems || canShowFewerItems}
					<button
						class="ml-6 mt-4 underline"
						onclick={() =>
							canShowMoreItems
								? (defaultItemsShown = totalItems)
								: (defaultItemsShown = DEFAULT_FACETS_SHOWN)}
					>
						{canShowMoreItems ? page.data.t('search.showMore') : page.data.t('search.showFewer')}
					</button>
				{/if}
				<!-- limit reached info -->
				{#if maxItemsReached && (canShowFewerItems || (!canShowMoreItems && searchPhrase))}
					<div class="ml-auto mt-4">
						<button
							class="flex items-center gap-1 rounded-sm bg-primary/4 px-2 py-1 text-xs text-error"
							use:popover={{
								title: page.data.t('facet.limitText'),
								placeAsSibling: true
							}}
						>
							<span>{page.data.t('facet.limitInfo')}</span>
							<span class="sr-only">{page.data.t('facet.limitText')}</span>
							<BiInfo aria-hidden="true" />
						</button>
					</div>
				{/if}
			</div>
		</div>
	</details>
</li>

<style lang="postcss">
	@reference "../../../app.css";

	details[open] {
		& .arrow {
			@apply rotate-90;
		}
		& .facet-sort {
			@apply block;
		}
	}

	/* hide sorting for bool filters */
	li[data-dimension='boolFilters'] details[open] .facet-sort {
		@apply hidden;
	}

	.facet-link:hover,
	.facet-link:focus {
		& .facet-total {
			@apply bg-primary/8;
		}
	}
</style>
