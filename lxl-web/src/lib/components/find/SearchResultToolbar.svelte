<script lang="ts">
	import { page } from '$app/state';
	import type { DisplayMapping, SearchResult } from '$lib/types/search';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import { fade } from 'svelte/transition';
	import Modal from '../Modal.svelte';
	import Toolbar from '../Toolbar.svelte';
	import Filters from './Filters.svelte';
	import SearchResultSort from './SearchResultSort.svelte';
	import IconSliders from '~icons/bi/sliders';
	import BiLayoutSidebar from '~icons/bi/layout-sidebar';

	type SearchResultToolbarProps = {
		searchResult: SearchResult;
	};

	const { searchResult }: SearchResultToolbarProps = $props();
	const userSettings = getUserSettings();

	let showFiltersModal = $state(false);
	const numHits = $derived(searchResult.totalItems);
	const filterCount = $derived(getFiltersCount(searchResult.mapping));

	function getFiltersCount(mapping: DisplayMapping[]) {
		const _q = mapping.find((item) => item.variable === '_q');
		if (!_q) return 0;

		let count = 0;
		function _iter(n: DisplayMapping) {
			if (n.children) {
				n.children.forEach(_iter);
			} else if (n?.display !== '*') count++;
		}
		_iter(_q);
		return count;
	}

	function toggleFiltersModal() {
		showFiltersModal = !showFiltersModal;
	}
</script>

<div class="bg-page sticky top-0 z-10 sm:static">
	<Toolbar>
		{#snippet leadingActions()}
			<!-- mobile modal filter btn -->
			<a
				href={page.data.localizeHref(
					`${page.url.pathname}?${page.url.searchParams.toString()}#filters`
				)}
				class="filter-modal-toggle btn btn-primary max-w-44 sm:hidden"
				aria-label={page.data.t('search.filters')}
				onclick={(e) => {
					e.preventDefault();
					toggleFiltersModal();
				}}
			>
				<IconSliders class="text-base" />
				{page.data.t('search.filters')}
				{#if filterCount}
					<span class="badge badge-accent">
						{filterCount}
					</span>
				{/if}
			</a>
			<!-- expand leadingPane btn -->
			{#if !userSettings.leadingPane?.open}
				<button
					class="btn btn-primary hidden sm:block"
					aria-label={page.data.t('panes.show')}
					in:fade={{ duration: 200 }}
					onclick={() => userSettings.openLeadingPane()}
				>
					<BiLayoutSidebar class="size-4" />
				</button>
			{/if}
		{/snippet}
		{#snippet trailingActions()}
			{#if numHits > 0}
				<SearchResultSort />
			{/if}
		{/snippet}
	</Toolbar>
</div>

{#if showFiltersModal}
	<Modal position="left" close={toggleFiltersModal}>
		{#snippet title()}
			<span>
				{page.data.t('search.filters')} ({numHits.toLocaleString(page.data.locale)}
				{numHits == 1 ? page.data.t('search.hitsOne') : page.data.t('search.hits')})
			</span>
		{/snippet}
		<Filters facets={searchResult.facets || []} mapping={searchResult.mapping} />
	</Modal>
{/if}
