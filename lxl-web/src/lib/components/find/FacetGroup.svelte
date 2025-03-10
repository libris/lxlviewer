<script lang="ts">
	import { page } from '$app/stores';
	import type { LocaleCode } from '$lib/i18n/locales';
	import type { FacetGroup, Facet, MultiSelectFacet } from '$lib/types/search';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import {
		DEFAULT_FACETS_SHOWN,
		DEFAULT_FACET_SORT,
		CUSTOM_FACET_SORT
	} from '$lib/constants/facets';
	import { saveUserSetting } from '$lib/utils/userSettings';
	import { getMatomoTracker } from '$lib/contexts/matomo';
	import { popover } from '$lib/actions/popover';
	import FacetRange from './FacetRange.svelte';
	import DecoratedData from '../DecoratedData.svelte';
	import BiChevronRight from '~icons/bi/chevron-right';
	import BiSortDown from '~icons/bi/sort-down';
	import BiCheckSquareFill from '~icons/bi/check-square-fill';
	import BiSquare from '~icons/bi/square';
	import BiInfo from '~icons/bi/info-circle';

	const matomoTracker = getMatomoTracker();

	export let group: FacetGroup;
	export let locale: LocaleCode;
	export let searchPhrase = '';

	let facetsShown = DEFAULT_FACETS_SHOWN;
	const maxFacets = group.maxItems;

	const userSort = $page.data.userSettings?.facetSort?.[group.dimension];
	let currentSort =
		userSort ||
		CUSTOM_FACET_SORT[group.dimension as keyof typeof CUSTOM_FACET_SORT] ||
		DEFAULT_FACET_SORT;

	const sortOptions = [
		{ value: 'hits.desc', label: $page.data.t('sort.hitsDesc') },
		{ value: 'hits.asc', label: $page.data.t('sort.hitsAsc') },
		{ value: 'alpha.asc', label: getAlphaLabel('Asc') },
		{ value: 'alpha.desc', label: getAlphaLabel('Desc') }
	];

	function getAlphaLabel(dir: 'Asc' | 'Desc' = 'Desc'): string {
		let key = group.dimension === 'yearPublished' ? `sort.year${dir}` : `sort.alpha${dir}`;
		return $page.data.t(key);
	}

	$: sortFn = (a: Facet | MultiSelectFacet, b: Facet | MultiSelectFacet): number => {
		let l = $page.data.locale;
		switch (currentSort) {
			case 'hits.asc':
				return b.totalItems > a.totalItems ? -1 : 1;
			case 'alpha.desc':
				return b.str.localeCompare(a.str, l);
			case 'alpha.asc':
				return a.str.localeCompare(b.str, l);
			default:
				// hits.desc
				return b.totalItems < a.totalItems ? -1 : 1;
		}
	};

	function saveUserSort(e: Event): void {
		const target = e.target as HTMLSelectElement;
		saveUserSetting('facetSort', { [group.dimension]: target.value });

		// testing analytics event tracker
		if ($matomoTracker) {
			$matomoTracker.trackEvent('Facet sort', group.dimension, target.value);
		}
	}

	$: numFacets = group.facets.length;
	$: hasHits = filteredFacets.length > 0;
	$: expanded = true;
	$: sortedFacets = group.facets.sort(sortFn);
	$: filteredFacets = sortedFacets.filter((facet) =>
		facet.str
			.toLowerCase()
			.split(/\s|--/)
			.find((s) => s.startsWith(searchPhrase.toLowerCase()))
	);
	$: shownFacets = filteredFacets.filter((facet, index) => index < facetsShown);
	$: canShowMoreFacets = filteredFacets.length > facetsShown;
	$: canShowLessFacets = !canShowMoreFacets && filteredFacets.length > DEFAULT_FACETS_SHOWN;
	$: maxFacetsReached = numFacets === maxFacets;
</script>

<li
	class="border-b border-primary/16 first:border-t"
	class:hidden={searchPhrase && !hasHits}
	class:has-hits={hasHits}
	data-dimension={group.dimension}
>
	<details class="relative" open={!!expanded}>
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
		<div class="facet-sort absolute right-0 top-2 hidden">
			<select
				bind:value={currentSort}
				on:change={saveUserSort}
				class="appearance-none px-6 py-1 text-2-regular"
				aria-label={$page.data.t('sort.sort') + ' ' + $page.data.t('search.filters')}
			>
				{#each sortOptions as option}
					<option value={option.value}>{option.label}</option>
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
				{#each shownFacets as facet (facet.view['@id'])}
					<li>
						<a
							class="facet-link flex items-end justify-between gap-2 no-underline"
							href={facet.view['@id']}
						>
							<span class="overflow-hidden text-ellipsis whitespace-nowrap" title={facet.str}>
								{#if 'selected' in facet}
									<!-- checkboxes -->
									<span class="sr-only"
										>{facet.selected ? $page.data.t('search.activeFilter') : ''}</span
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
									class="facet-total mb-px rounded-sm bg-pill/4 px-1 text-sm text-secondary md:text-xs"
									aria-label="{facet.totalItems} {$page.data.t('search.hits')}"
									>{facet.totalItems.toLocaleString(locale)}</span
								>
							{/if}
						</a>
					</li>
				{/each}
			</ol>
			<div class="flex">
				<!-- 'show more' btn -->
				{#if canShowMoreFacets || canShowLessFacets}
					<button
						class="ml-6 mt-4 underline"
						on:click={() =>
							canShowMoreFacets ? (facetsShown = numFacets) : (facetsShown = DEFAULT_FACETS_SHOWN)}
					>
						{canShowMoreFacets ? $page.data.t('search.showMore') : $page.data.t('search.showFewer')}
					</button>
				{/if}
				<!-- limit reached info -->
				{#if maxFacetsReached && (canShowLessFacets || (!canShowMoreFacets && searchPhrase))}
					<div class="ml-auto mt-4">
						<button
							class="flex items-center gap-1 rounded-sm bg-pill/4 px-2 py-1 text-xs text-error"
							use:popover={{
								title: $page.data.t('facet.limitText'),
								placeAsSibling: true
							}}
						>
							<span>{$page.data.t('facet.limitInfo')}</span>
							<span class="sr-only">{$page.data.t('facet.limitText')}</span>
							<BiInfo aria-hidden="true" />
						</button>
					</div>
				{/if}
			</div>
		</div>
	</details>
</li>

<style lang="postcss">
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
			@apply bg-pill/8;
		}
	}
</style>
