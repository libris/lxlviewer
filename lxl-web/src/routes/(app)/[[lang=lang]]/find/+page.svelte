<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { SearchResult } from '$lib/types/search';
	import getPageTitle from '$lib/utils/getPageTitle';
	import SiteFooter from '../SiteFooter.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import LeadingPane from '$lib/components/find/LeadingPane.svelte';
	import Filters from '$lib/components/find/Filters.svelte';
	import SearchResultToolbar from '$lib/components/find/SearchResultToolbar.svelte';
	import SearchResultInfo from '$lib/components/find/SearchResultInfo.svelte';
	import SearchCard from '$lib/components/find/SearchCard.svelte';
	import TrailingPane from '$lib/components/find/TrailingPane.svelte';
	import Pagination from '$lib/components/find/Pagination.svelte';
	import HoldingsList from '$lib/components/HoldingsList.svelte';

	const searchResult: SearchResult = $derived(page.data.searchResult);
	const holdings = $derived(page.data.holdings);

	function handleCloseHoldings() {
		// fixme
		// if (!previousURL?.searchParams.has('holdings')) {
		// 	history.back();
		// } else {
		const newSearchParams = new SvelteURLSearchParams([
			...Array.from(page.url.searchParams.entries())
		]);
		newSearchParams.delete('holdings');
		goto(page.url.pathname + `?${newSearchParams.toString()}`, {
			replaceState: true,
			noScroll: true
		});
		// }
	}
</script>

<svelte:head>
	<title>{getPageTitle(page.url.searchParams.get('_q')?.trim())}</title>
</svelte:head>
{#if searchResult}
	<div class="search-result flex w-full flex-1 [&_[id]]:scroll-mt-18 sm:[&_[id]]:scroll-mt-32">
		<LeadingPane>
			<div id="filters" role="tabpanel" aria-labelledby="tab-filters">
				<Filters facets={searchResult.facetGroups || []} />
			</div>
		</LeadingPane>
		<div class="@container/content flex flex-1 flex-col">
			<div class="flex flex-1 flex-col @5xl/content:flex-row">
				<main class="flex-1">
					<h1 class="sr-only">{page.data.t('search.searchResults')}</h1>
					<SearchResultToolbar {searchResult} />
					<SearchResultInfo {searchResult} />
					<ol class="flex flex-col px-4">
						{#each searchResult.items as item (item['@id'])}
							<li>
								<SearchCard {item} />
							</li>
						{/each}
					</ol>
					<Pagination data={searchResult} />
				</main>
				<aside class="min-w-[300px]">
					<div class="hidden @5xl/content:block">
						<Toolbar />
					</div>
					<div class="aside-content sticky h-px"></div>
				</aside>
			</div>
			<SiteFooter />
		</div>
		<!-- <HoldingsModal workFnurgel={page.state.holdings || page.url.searchParams.get('holdings')}
		></HoldingsModal> -->
		{#if holdings}
			<!-- <Modal close={handleCloseHoldings}>
			<span slot="title">{page.data.t('holdings.findAtYourNearestLibrary')}</span> -->
			<!-- <svelte:boundary>
				<HoldingsList {holdings} />
				{#snippet pending()}
					<p>loading...</p>
				{/snippet}
			</svelte:boundary>
			</Modal> -->

			<TrailingPane close={handleCloseHoldings}>
				{#snippet title()}
					{page.data.t('holdings.findAtYourNearestLibrary')}
				{/snippet}
				<HoldingsList {holdings} />
			</TrailingPane>
		{/if}
	</div>
{/if}

<style>
	.aside-content {
		top: calc(var(--app-bar-height) + (var(--spacing) * 4));
	}
</style>
