<script lang="ts">
	import { page } from '$app/state';
	import type { DisplayMapping, Facet, SearchResult } from '#lib/types/search.js';
	import { getUserSettings } from '#lib/contexts/userSettings.js';
	import { getModalContext } from '#lib/contexts/modal.svelte.ts';
	import { MAPPING_IGNORE_VARIABLE } from '#lib/constants/mapping.js';
	import { FILTERS_HASH } from '#lib/constants/modals.ts';
	import { fade } from 'svelte/transition';
	import Modal from '#lib/components/Modal.svelte';
	import Toolbar from '#lib/components/Toolbar.svelte';
	import Filters from '#lib/components/find/Filters.svelte';
	import ToggleSelectModeBtn from '#lib/components/ToggleSelectModeBtn.svelte';
	import ToggleTrailingPaneBtn from '#lib/components/ToggleTrailingPaneBtn.svelte';
	import BiLayoutSidebar from '~icons/bi/layout-sidebar';
	import IconSliders from '~icons/bi/sliders';

	type SearchResultToolbarProps = {
		searchResult: SearchResult;
		expandLeadingPaneBtnId: string;
		onOpenPane: () => void;
	};

	const { searchResult, expandLeadingPaneBtnId, onOpenPane }: SearchResultToolbarProps = $props();
	const userSettings = getUserSettings();
	const modal = getModalContext();
	const filtersModalOpen = $derived(modal.isOpen === 'filters');

	const numHits = $derived(searchResult.totalItems);
	const mapping = $derived(searchResult.mapping.filter((m) => m.variable === '_q'));
	const filterCount = $derived(getFiltersCount(mapping));
	const facets: Promise<Facet[]> = $derived(page.data.facets);

	function getFiltersCount(mapping: DisplayMapping[]) {
		const root = mapping.filter(
			(item) => item.variable !== undefined && !MAPPING_IGNORE_VARIABLE.includes(item.variable)
		);
		let count = 0;

		function _iter(n: DisplayMapping[] | DisplayMapping) {
			if (Array.isArray(n)) {
				n.forEach(_iter);
			} else if (n.children) {
				n.children.forEach(_iter);
			} else if (n?.display !== '*') count++;
		}
		_iter(root);
		return count;
	}
</script>

<div class="bg-page z-1 sticky-toolbar">
	<Toolbar>
		{#snippet leadingActions()}
			<!-- mobile modal filter btn -->
			<button
				type="button"
				class="filter-modal-toggle btn btn-primary max-w-44 sm:hidden"
				aria-label={`${page.data.t('general.show')} ${page.data.t('search.filters')}. ${page.data.t('search.selectedFilters')}: ${filterCount}`}
				onclick={() =>
					modal.onOpen({
						hash: FILTERS_HASH,
						type: 'filters'
					})}
			>
				<IconSliders class="text-base" />
				{page.data.t('search.filters')}
				{#if filterCount}
					<span class="badge badge-accent">
						{filterCount}
					</span>
				{/if}
			</button>
			<!-- expand leadingPane btn -->
			{#if !userSettings.leadingPane?.open}
				<button
					id={expandLeadingPaneBtnId}
					class="btn btn-primary hidden sm:block"
					aria-label={page.data.t('panes.show')}
					aria-expanded={userSettings.leadingPane?.open}
					aria-controls="leading-pane"
					in:fade={{ duration: 200 }}
					onclick={onOpenPane}
				>
					<BiLayoutSidebar class="size-4" />
				</button>
			{/if}
			<div class="ml-auto flex gap-1">
				<ToggleSelectModeBtn />
			</div>
		{/snippet}
		{#snippet trailingActions()}
			<ToggleTrailingPaneBtn />
		{/snippet}
	</Toolbar>
</div>

{#if filtersModalOpen}
	<Modal position="left" close={() => modal.onClose('filters')}>
		{#snippet title()}
			<span>
				{page.data.t('search.filters')} ({numHits.toLocaleString(page.data.locale)}
				{numHits == 1 ? page.data.t('search.hitsOne') : page.data.t('search.hits')})
			</span>
		{/snippet}
		<Filters {facets} {mapping} />
	</Modal>
{/if}
