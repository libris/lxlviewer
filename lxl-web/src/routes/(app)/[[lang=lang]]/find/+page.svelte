<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import { MediaQuery, SvelteURLSearchParams } from 'svelte/reactivity';
	import type { SearchResult } from '$lib/types/search';
	import type { HoldingsData } from '$lib/types/holdings';
	import SiteFooter from '../SiteFooter.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import LeadingPane from '$lib/components/find/LeadingPane.svelte';
	import Filters from '$lib/components/find/Filters.svelte';
	import SearchResultToolbar from '$lib/components/find/SearchResultToolbar.svelte';
	import SearchResultInfo from '$lib/components/find/SearchResultInfo.svelte';
	import SearchCard from '$lib/components/find/SearchCard.svelte';
	import Pagination from '$lib/components/find/Pagination.svelte';
	import HoldingsContent from '$lib/components/HoldingsContent.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import TrailingPane from '$lib/components/find/TrailingPane.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Meta from '$lib/components/Meta.svelte';
	import { USE_HOLDING_PANE } from '$lib/constants/panels';
	import { getSigelsFromMapping } from '$lib/utils/getSigelsFromMapping';

	const searchResult: SearchResult = $derived(page.data.searchResult);

	const searchQuery = $derived(page.url.searchParams.get('q') || page.url.searchParams.get('_q'));
	const description = $derived(
		searchQuery
			? `${page.data.t('search.searchResults')} ${searchQuery} - ${page.data.siteName}`
			: `${page.data.t('search.searchResults')} - ${page.data.siteName}`
	);
	const holdings: Promise<HoldingsData> | undefined = $derived(page.data?.holdings);
	const refinedLibraries = $derived(
		getSigelsFromMapping([searchResult.mapping, page.data.subsetMapping])
	);
	const isSmallScreen = new MediaQuery('max-width: 640px', false);

	const HoldingsComponent = $derived(
		USE_HOLDING_PANE ? (isSmallScreen.current ? Modal : TrailingPane) : Modal
	);

	let previousURL: URL;

	afterNavigate(({ from }) => {
		if (from) {
			previousURL = from.url;
		}
	});

	function handleCloseHoldings() {
		if (!previousURL?.searchParams.has('holdings')) {
			history.back();
		} else {
			const newSearchParams = new SvelteURLSearchParams([
				...Array.from(page.url.searchParams.entries())
			]);
			newSearchParams.delete('holdings');
			goto(page.url.pathname + `?${newSearchParams.toString()}`, { replaceState: true });
		}
	}
</script>

<svelte:head>
	<title>{page.data.pageTitle}</title>
</svelte:head>

<Meta title={page.data.pageTitle} {description} url={page.url.href} />

{#if searchResult}
	<div
		class={[
			'search-result flex w-full flex-1 [&_[id]]:scroll-mt-18 sm:[&_[id]]:scroll-mt-32',
			holdings && USE_HOLDING_PANE && 'has-trailing-pane'
		]}
	>
		<LeadingPane>
			<div id="panel-filters" role="tabpanel" aria-labelledby="tab-filters">
				<Filters facets={searchResult.facetGroups || []} />
			</div>
		</LeadingPane>
		<div class="search-result-content @container/content flex flex-1 flex-col">
			<div class="flex flex-1 flex-col @5xl/content:flex-row">
				<main id="content" class="flex-1">
					<h1 class="sr-only">{page.data.t('search.searchResults')}</h1>
					<SearchResultToolbar {searchResult} />
					<SearchResultInfo {searchResult} />
					<ol class="flex flex-col">
						{#each searchResult.items as item (item['@id'])}
							<li>
								<SearchCard {item} />
							</li>
						{/each}
					</ol>
					<Pagination data={searchResult} />
				</main>
				<aside class="search-result-aside min-w-[300px]">
					<div class="hidden @5xl/content:block">
						<Toolbar />
					</div>
					<div class="aside-content sticky h-px"></div>
				</aside>
			</div>
			<SiteFooter />
		</div>
		{#if holdings && page.url.searchParams.get('holdings')}
			<HoldingsComponent close={handleCloseHoldings}>
				{#snippet title()}
					<span>{page.data.t('holdings.findAtYourNearestLibrary')}</span>
				{/snippet}
				{#await holdings}
					<div class="m-6 flex h-full items-center justify-center">
						<span class="size-6">
							<Spinner />
						</span>
					</div>
				{:then holdings}
					<HoldingsContent
						{holdings}
						{refinedLibraries}
						showSummary={isSmallScreen.current || !USE_HOLDING_PANE ? true : false}
					/>
				{:catch err}
					<p>{err}</p>
				{/await}
			</HoldingsComponent>
		{/if}
	</div>
{/if}

<style>
	.aside-content {
		top: calc(var(--app-bar-height) + (var(--spacing) * 4));
	}

	.search-result {
		&.has-trailing-pane {
			max-height: calc(100vh - (var(--app-bar-height) + var(--banner-height, 0)));
			overflow: hidden;

			& .search-result-content {
				overflow-y: auto;
				scrollbar-width: thin;
			}

			& aside {
				display: none;
			}
		}
	}
</style>
