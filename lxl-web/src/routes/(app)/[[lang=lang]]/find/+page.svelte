<script lang="ts">
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import { resolve } from '$app/paths';
	import { afterNavigate, goto } from '$app/navigation';
	// import { MediaQuery, SvelteURLSearchParams } from 'svelte/reactivity';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { Facet, SearchResult } from '#lib/types/search.js';
	import { HeadingElem } from '#lib/types/decoratedData.js';
	import type { HoldingsData } from '#lib/types/holdings.js';
	import { getTrailingPaneContext } from '#lib/contexts/trailingPane.svelte.ts';
	import { getUserSettings } from '#lib/contexts/userSettings.ts';
	import getPageTitle from '#lib/utils/getPageTitle.js';
	import { relativizeUrl, stripAnchor, trimSlashes } from '#lib/utils/http.js';
	import SiteFooter from '../SiteFooter.svelte';
	import Toolbar from '#lib/components/Toolbar.svelte';
	import LeadingPane from '#lib/components/find/LeadingPane.svelte';
	import Filters from '#lib/components/find/Filters.svelte';
	import SearchResultToolbar from '#lib/components/find/SearchResultToolbar.svelte';
	import SearchResultInfo from '#lib/components/find/SearchResultInfo.svelte';
	import SearchCard from '#lib/components/find/SearchCard.svelte';
	import Pagination from '#lib/components/find/Pagination.svelte';
	import HoldingsContent from '#lib/components/HoldingsContent.svelte';
	import Spinner from '#lib/components/Spinner.svelte';
	import Modal from '#lib/components/Modal.svelte';
	import Meta from '#lib/components/Meta.svelte';

	const searchResult: SearchResult = $derived(page.data.searchResult);
	const facets: Promise<Facet[]> = $derived(page.data.facets);
	const userSettings = getUserSettings();
	const trailingPane = getTrailingPaneContext();

	const siteName = $derived(getPageTitle(undefined, page.data.siteName));
	const searchQuery = $derived(page.url.searchParams.get('q') || page.url.searchParams.get('_q'));
	const description = $derived(
		searchQuery
			? `${page.data.t('search.searchResults')} ${searchQuery} - ${siteName}`
			: `${page.data.t('search.searchResults')} - ${siteName}`
	);
	const holdings: Promise<HoldingsData> | undefined = $derived(page.data?.holdings);
	// const isSmallScreen = new MediaQuery('max-width: 640px', false);
	// const HoldingsComponent = $derived(
	// 	USE_HOLDING_PANE ? (isSmallScreen.current ? Modal : TrailingPane) : Modal
	// );
	const holdingsParam = $derived(page.url.searchParams.get('holdings'));
	const modalCard = $derived(
		holdingsParam &&
			searchResult.items.filter(
				(item) => `${stripAnchor(trimSlashes(relativizeUrl(item['@id'])))}` === holdingsParam
			)[0]
	);

	let previousURL: URL;
	const expandLeadingPaneBtnId = 'expand-leading-pane-btn';
	const collapseLeadingPaneBtnId = 'collapse-leading-pane-btn';

	const offset = $derived(parseInt(page.url.searchParams.get('_offset') || '0'));

	afterNavigate(({ from, shallow, type }) => {
		if (shallow && type === 'goto') return;

		if (from) {
			previousURL = from.url;
		}
	});

	function handleCloseHoldings() {
		if (
			previousURL &&
			previousURL.pathname === page.url.pathname &&
			!previousURL?.searchParams.has('holdings')
		) {
			history.back();
		} else {
			const newSearchParams = new SvelteURLSearchParams([
				...Array.from(page.url.searchParams.entries())
			]);
			newSearchParams.delete('holdings');
			goto(resolve(page.url.pathname + `?${newSearchParams.toString()}`), { replace: true });
		}
	}

	function onOpenLeadingPane() {
		userSettings.openLeadingPane();
		tick().then(() => {
			document.getElementById(collapseLeadingPaneBtnId)?.focus();
		});
	}

	function onCloseLeadingPane() {
		userSettings.closeLeadingPane();
		tick().then(() => {
			document.getElementById(expandLeadingPaneBtnId)?.focus();
		});
	}
</script>

<svelte:head>
	<title>{page.data.pageTitle}</title>
</svelte:head>

<Meta title={page.data.pageTitle} {description} url={page.url.href} {siteName} />

{#if searchResult}
	<div class={['search-result flex w-full flex-1', userSettings.selectableResults && 'selectable']}>
		<LeadingPane onClose={onCloseLeadingPane} {collapseLeadingPaneBtnId}>
			<div id="panel-filters" role="tabpanel" aria-labelledby="tab-filters">
				<Filters {facets} />
			</div>
		</LeadingPane>
		<div class="search-result-content @container/content flex flex-1 flex-col">
			<div class={['flex flex-1 flex-col', !trailingPane.visible && '@5xl/content:flex-row']}>
				<div class="flex-1">
					<h1 id="search-results" class="sr-only">{page.data.t('search.searchResults')}</h1>
					<SearchResultToolbar
						{searchResult}
						{expandLeadingPaneBtnId}
						onOpenPane={onOpenLeadingPane}
					/>
					<SearchResultInfo {searchResult} selectableResults={userSettings.selectableResults} />

					<ol aria-labelledby="search-results" class="flex flex-col">
						{#each searchResult.items as item, index (item['@id'] + index)}
							<li>
								<SearchCard
									{item}
									headingElement={HeadingElem.H2}
									itemNo={offset + (index + 1)}
									selectable={userSettings.selectableResults}
								/>
							</li>
						{/each}
					</ol>
					<Pagination data={searchResult} />
				</div>
				<!-- trailing pane toolbar -->
				<div class="search-result-aside min-w-75">
					<div class="sticky-toolbar hidden @5xl/content:block">
						<Toolbar />
					</div>
					<div class="aside-content sticky h-px"></div>
				</div>
			</div>
			<SiteFooter />
		</div>
		{#if holdings && holdingsParam}
			<Modal close={handleCloseHoldings}>
				{#snippet title()}
					<span>{page.data.t('holdings.findAtLibrary')}</span>
				{/snippet}
				{#await holdings}
					<div class="m-6 flex h-full items-center justify-center">
						<span class="size-6">
							<Spinner />
						</span>
					</div>
				{:then holdings}
					<HoldingsContent {holdings}>
						{#snippet card()}
							{#if modalCard}
								<SearchCard item={modalCard} headingIsLink={false} allowPopovers={false} />
							{/if}
						{/snippet}
					</HoldingsContent>
				{:catch err}
					<p>{err}</p>
				{/await}
			</Modal>
		{/if}
	</div>
{/if}

<style lang="postcss">
	@reference "tailwindcss";
	.aside-content {
		top: calc(var(--appbar-height) + (var(--spacing) * 4));
	}
</style>
