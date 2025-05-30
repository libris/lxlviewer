<script lang="ts">
	import { page } from '$app/state';
	import type { DisplayMapping, SearchResult } from '$lib/types/search';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import { fade } from 'svelte/transition';
	import Modal from '../Modal.svelte';
	import Toolbar from '../Toolbar.svelte';
	import IconSliders from '~icons/bi/sliders';
	import Filters from './Filters.svelte';
	import SearchResultSort from './SearchResultSort.svelte';

	type SearchResultToolbarProps = {
		searchResult: SearchResult;
	};

	const { searchResult }: SearchResultToolbarProps = $props();
	const userSettings = getUserSettings();

	let showFiltersModal = $state(false);
	const numHits = searchResult.totalItems;
	const filterCount = getFiltersCount(searchResult.mapping);

	function getFiltersCount(mapping: DisplayMapping[]) {
		return (mapping[0].children || mapping).filter(
			(filterItem) => !(filterItem.display === '*' && filterItem.operator === 'equals') // TODO: probably best to do wildcard-filtering in an earlier step (in search.ts)?
		).length;
	}

	function toggleFiltersModal() {
		showFiltersModal = !showFiltersModal;
	}
</script>

<div class="bg-page sticky top-[var(--app-bar-height)] z-10 sm:static">
	<Toolbar>
		{#snippet leadingActions()}
			<!-- mobile modal filter btn -->
			<a
				href={`${page.url.pathname}?$$page.url.searchParams.toString()}#filters`}
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
					class="hidden sm:block"
					in:fade={{ duration: 200 }}
					onclick={() => userSettings.openLeadingPane()}
				>
					➡️
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
		<span slot="title">
			{page.data.t('search.filters')} ({numHits.toLocaleString(page.data.locale)}
			{numHits == 1 ? page.data.t('search.hitsOne') : page.data.t('search.hits')})
		</span>
		<Filters facets={searchResult.facetGroups || []} mapping={searchResult.mapping} />
	</Modal>
{/if}
