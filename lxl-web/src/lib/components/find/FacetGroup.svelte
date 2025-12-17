<script lang="ts">
	import { page } from '$app/state';
	import type { Facet, FacetValue as FacetValueType } from '$lib/types/search';
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
	import FacetGroup from './FacetGroup.svelte';
	import FacetValue from '$lib/components/find/FacetValue.svelte';
	import FacetRange from '$lib/components/find/FacetRange.svelte';
	import BiChevronRight from '~icons/bi/chevron-right';
	import BiSortDown from '~icons/bi/sort-down';
	import BiInfo from '~icons/bi/info-circle';
	import BiPencil from '~icons/bi/pencil';

	type Props = {
		data: Facet;
		searchPhrase: string;
		isDefaultExpanded: boolean;
		parent?: FacetValueType;
	};

	let { data, searchPhrase, isDefaultExpanded, parent }: Props = $props();

	const matomoTracker = getMatomoTracker();
	const userSettings = getUserSettings();

	let detailsEl: HTMLDetailsElement | undefined = undefined;

	const totalItems = $derived(data.values.length);
	let defaultItemsShown = $state(DEFAULT_FACET_VALUES_SHOWN);

	let currentSort = $state(
		userSettings.facetSort?.[data.dimension] ||
			CUSTOM_FACET_SORT[data.dimension as keyof typeof CUSTOM_FACET_SORT] ||
			DEFAULT_FACET_SORT
	);

	let isUserOrDefaultExpanded = $derived(
		userSettings.facetExpanded?.[data.dimension]
			? userSettings.facetExpanded?.[data.dimension] === ExpandedState.OPEN
			: isDefaultExpanded
	);

	const sortOptions = [
		{ value: 'hits.desc', label: page.data.t('sort.hitsDesc') },
		{ value: 'hits.asc', label: page.data.t('sort.hitsAsc') },
		{ value: 'alpha.asc', label: getAlphaLabel('Asc') },
		{ value: 'alpha.desc', label: getAlphaLabel('Desc') }
	];

	function getAlphaLabel(dir: 'Asc' | 'Desc' = 'Desc'): string {
		let key = data.dimension === 'yearPublished' ? `sort.year${dir}` : `sort.alpha${dir}`;
		return page.data.t(key);
	}

	const sortedItems = $derived(
		[...data.values].sort((a, b) => {
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
	const maxItemsReached = $derived(totalItems === data.maxItems);

	function saveUserSort(e: Event): void {
		const target = e.target as HTMLSelectElement;
		userSettings.saveFacetSort(data.dimension, target.value);

		// testing analytics event tracker
		if ($matomoTracker) {
			$matomoTracker.trackEvent('Facet sort', data.dimension, target.value);
		}
	}

	function saveUserExpanded(e: Event): void {
		e.preventDefault();
		if (detailsEl) {
			userSettings.saveFacetExpanded(data.dimension, !detailsEl.open);
		}
	}
</script>

<details
	class={['relative w-full', searchPhrase && !hasHits && 'hidden']}
	open={!!expanded}
	data-dimension={data.dimension}
	bind:this={detailsEl}
>
	{#if !parent}
		<summary
			role="menuitem"
			class="hover:bg-primary-100 flex min-h-9 w-full cursor-pointer items-center gap-2 pr-12 pl-3 text-xs font-medium"
			data-testid="facet-toggle"
			onclick={saveUserExpanded}
		>
			<span class="arrow text-subtle transition-transform">
				<BiChevronRight />
			</span>
			<span class="flex-1 whitespace-nowrap">{data.label}</span>
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
			<FacetValue data={parent} isEmbedded={true} />
		</summary>
	{/if}
	<!-- sorting -->
	<div class={['facet-sort absolute top-0 size-8', parent ? 'right-15' : 'right-2']}>
		<select
			name={data.dimension}
			bind:value={currentSort}
			onchange={saveUserSort}
			class="btn btn-primary size-full appearance-none border-0 text-transparent"
			aria-label={page.data.t('sort.sort') + ' ' + page.data.t('search.filters')}
			data-testid={`facet-sort-${data.dimension}`}
		>
			{#each sortOptions as option (option.value)}
				<option selected={option.value == currentSort} value={option.value}>{option.label}</option>
			{/each}
		</select>
		<BiSortDown class="pointer-events-none absolute top-0 right-0 m-2 text-base" />
	</div>
	<div class="text-2xs">
		{#if data.search && !(searchPhrase && hasHits)}
			<!-- facet range inputs; hide in filter search results -->
			<FacetRange search={data.search} />
		{/if}
		<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
		<menu
			role="menu"
			class="flex max-h-72 flex-col overflow-x-clip overflow-y-auto sm:max-h-[453px]"
			data-testid="facet-list"
		>
			{#each shownItems as value (value.str + value.view['@id'])}
				{#if !value.facets}
					<li class="facet-group-list-value hover:bg-primary-100 flex">
						<FacetValue data={value} />
						{#if 'alias' in value && value.alias === MY_LIBRARIES_FILTER_ALIAS}
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
							{#each value.facets as facet, index (facet.dimension)}
								<!-- for now hide category @none directly under find -->
								{#if index < 1}
									<FacetGroup
										data={facet}
										{searchPhrase}
										parent={value}
										isDefaultExpanded={false}
									/>
								{/if}
							{/each}
						</ol>
					</li>
				{/if}
			{/each}
		</menu>
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
						{canShowMoreItems ? page.data.t('search.showMore') : page.data.t('search.showFewer')}...
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
	[data-dimension='boolFilters'] .facet-sort {
		display: none;
	}

	[data-dimension='accessFilters'] .facet-sort {
		display: none;
	}
</style>
