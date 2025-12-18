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
	import { toString } from '$lib/utils/xl';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import { getMatomoTracker } from '$lib/contexts/matomo';
	import { popover } from '$lib/actions/popover';
	import FacetGroup from './FacetGroup.svelte';
	import FacetValue from '$lib/components/find/FacetValue.svelte';
	import FacetRange from '$lib/components/find/FacetRange.svelte';
	import IconChevron from '~icons/bi/chevron-right';
	import BiSortDown from '~icons/bi/sort-down';
	import BiInfo from '~icons/bi/info-circle';
	import BiPencil from '~icons/bi/pencil';

	type Props = {
		data: Facet;
		level: number;
		searchPhrase: string;
		isDefaultExpanded: boolean;
		parent?: FacetValueType;
	};

	let { data, level, searchPhrase, isDefaultExpanded, parent }: Props = $props();

	const PERMANENTLY_EXPANDED_FACETS = ['accessFilters'];

	const matomoTracker = getMatomoTracker();
	const userSettings = getUserSettings();

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

	function saveUserExpanded(event: Event & { currentTarget: HTMLDetailsElement }) {
		userSettings.saveFacetExpanded(data.dimension, event.currentTarget.open);
	}

	function getValueVariant(facet: Facet, index: number) {
		if (facet.dimension.split('/')[0] === 'librissearch:findCategory') {
			if (index === 0) return 'radio';
			return 'checkbox';
		}
		if (facet.operator === 'OR') return 'checkbox';
	}
</script>

{#snippet values(items: FacetValueType[])}
	{#each items as value, index (value.label + value.view['@id'])}
		{#if value.facets}
			{#each value.facets as facet, facetIndex (facet.dimension)}
				<!-- for now hide category @none directly under find -->
				{#if facetIndex < 1}
					{@const label =
						`${page.data.t('search.allInFacet')} ` +
						(toString(value.label) as string).toLowerCase()}
					<FacetGroup
						data={{
							...facet,
							values: [
								{
									label,
									str: label,
									totalItems: value.totalItems,
									selected: value.selected,
									view: value.view,
									all: true
								},
								...facet.values
							]
						}}
						level={level + 1}
						{searchPhrase}
						parent={value}
						isDefaultExpanded={false}
					/>
				{/if}
			{/each}
		{:else if value.alias === MY_LIBRARIES_FILTER_ALIAS}
			<li role="presentation" class="flex">
				<FacetValue data={value} parentDimension={data.dimension} />
				<a
					href={page.data.localizeHref('/my-pages')}
					class="btn btn-primary mr-2 border-0"
					aria-label={page.data.t('search.changeLibraries')}
				>
					<BiPencil />
				</a>
			</li>
		{:else}
			<FacetValue
				data={value}
				parentDimension={data.dimension}
				variant={getValueVariant(data, index)}
			/>
		{/if}
	{/each}
{/snippet}

{#if PERMANENTLY_EXPANDED_FACETS.includes(data.dimension)}
	{@render values(data.values)}
{:else}
	<details
		class={['relative w-full', hasHits && 'has-hits', searchPhrase && !hasHits && 'hidden']}
		open={!!expanded}
		data-dimension={data.dimension}
		style={`--level:${level}`}
		ontoggle={saveUserExpanded}
	>
		<summary
			role="menuitem"
			class={[
				'focusable text-subtle flex min-h-8 cursor-pointer items-center',
				level === 1 && 'font-medium'
			]}
			data-testid="facet-toggle"
		>
			<span
				aria-hidden="true"
				class={[
					'chevron pointer-events-none flex h-8 w-8 shrink-0 origin-center items-center justify-center transition-transform'
				]}
			>
				<IconChevron class="text-subtle size-3.5" />
			</span>
			<span class="truncate">{parent?.label || data.label}</span>
		</summary>

		<!-- sorting -->
		<div class={['facet-sort absolute top-0 right-2 size-8']}>
			<select
				name={data.dimension}
				bind:value={currentSort}
				onchange={saveUserSort}
				class="btn btn-primary size-full appearance-none border-0 text-transparent"
				aria-label={page.data.t('sort.sort') + ' ' + page.data.t('search.filters')}
				data-testid={`facet-sort-${data.dimension}`}
			>
				{#each sortOptions as option (option.value)}
					<option selected={option.value == currentSort} value={option.value}>{option.label}</option
					>
				{/each}
			</select>
			<BiSortDown class="pointer-events-none absolute top-0 right-0 m-2 text-base" />
		</div>
		{#if data.search && !(searchPhrase && hasHits)}
			<!-- facet range inputs; hide in filter search results -->
			<FacetRange search={data.search} />
		{/if}
		<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
		<menu role="menu" data-testid="facet-list">
			{@render values(shownItems)}
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
					<span class="ml-4.5 block py-1.5 pr-3 pl-4 text-left">
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
	</details>
{/if}

<style lang="postcss">
	@reference 'tailwindcss';

	details {
		&[open] > summary,
		& > summary:hover {
			color: var(--color-body);
		}

		&[open] > summary .chevron {
			transform: rotate(90deg);
		}
	}

	summary {
		padding-left: calc((var(--level, 0) - 1) * var(--spacing) * 5);
	}

	.focusable {
		outline-offset: -2px;

		&:hover {
			background: var(--color-primary-100);
		}
		&:focus-visible,
		&:has(:focus) {
			background: var(--color-accent-50);
			outline-color: var(--color-active);
			@apply outline-2;
		}
	}
</style>
