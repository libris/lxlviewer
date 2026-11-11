<script lang="ts">
	import { page } from '$app/state';
	import { JsonLd } from '#lib/types/xl.ts';
	import type { SearchResult } from '#lib/types/search.js';
	import { getUserSettings } from '#lib/contexts/userSettings.js';
	import { MY_LIBRARIES_FILTER_ALIAS } from '#lib/constants/facets.js';
	import { displayMappingToString } from '#lib/utils/displayMappingToString.js';
	import { getSelectionContext } from '#lib/contexts/selection.svelte.ts';
	import SearchResultSort from '#lib/components/find/SearchResultSort.svelte';
	import Toolbar from '#lib/components/Toolbar.svelte';
	import BiInfo from '~icons/bi/info-circle';
	import BiQuestionCircle from '~icons/bi/question-circle';

	type SearchResultInfoProps = {
		searchResult: SearchResult;
		selectableResults?: boolean;
	};

	const { searchResult, selectableResults = false }: SearchResultInfoProps = $props();
	const userSettings = getUserSettings();
	const selection = getSelectionContext();
	let selectAllEl: HTMLInputElement | undefined = $state();

	const numHits = $derived(searchResult.totalItems);
	const showMyLibrariesWarning = $derived(
		numHits === 0 &&
			page.url.search.includes(MY_LIBRARIES_FILTER_ALIAS) &&
			(!userSettings.myLibraries || Object.keys(userSettings.myLibraries).length === 0)
	);

	const relaxedSearch = $derived(page.url.searchParams.get('_relaxed'));

	const selectionStatus = $derived.by(() => {
		if (!selectableResults) return false;
		if (searchResult.items.every((i) => selection.isSelected(i[JsonLd.ID]))) {
			return true;
		}
		if (searchResult.items.some((i) => selection.isSelected(i[JsonLd.ID]))) {
			if (selectAllEl) {
				selectAllEl.indeterminate = true;
			}
			return true;
		}
		if (selectAllEl) {
			selectAllEl.indeterminate = false;
		}
		return false;
	});

	function toggleSelectAll(e: Event) {
		const checkbox = e.target as HTMLInputElement;
		searchResult.items.forEach((item) => {
			if (checkbox.checked) {
				selection.add(item[JsonLd.ID]);
			} else {
				selection.remove(item[JsonLd.ID]);
			}
		});
	}
</script>

<div class="search-result-info text-sm" data-testid="result-info">
	{#if numHits && numHits > 0}
		<Toolbar>
			{#snippet leadingActions()}
				{#if selectableResults}
					<label for="select-all-page-results" class="sr-only">Välj alla sökträffar på sidan</label>
					<input
						type="checkbox"
						bind:this={selectAllEl}
						id="select-all-page-results"
						class="mr-1.5"
						onchange={toggleSelectAll}
						checked={selectionStatus}
					/>
				{/if}
				<p class="hits-count">
					{#if numHits > searchResult.itemsPerPage && searchResult.itemsPerPage > 0}
						<span class="font-medium">
							{(searchResult.itemOffset + 1).toLocaleString(page.data.locale)}
							-
							{Math.min(
								numHits,
								searchResult.itemOffset + searchResult.itemsPerPage
							).toLocaleString(page.data.locale)}
						</span>
						{page.data.t('search.hitsOf')}
					{/if}
					<span class="font-medium">
						{numHits.toLocaleString(page.data.locale)}
					</span>
					{#if page.data.instances}
						{numHits == 1 ? page.data.t('search.relatedOne') : page.data.t('search.related')}
					{/if}
					{numHits == 1 ? page.data.t('search.hitsOne') : page.data.t('search.hits')}
				</p>
			{/snippet}
			{#snippet trailingActions()}
				<SearchResultSort />
			{/snippet}
		</Toolbar>
	{/if}
	<!-- additional info -->
	<div class="additional flex flex-col px-2 lg:px-3">
		<!-- showEquals / shoLike -->
		{#each page.data.searchResult.mapping as m (m)}
			{#if m.toEquals}
				<p class="print:hidden">
					<a href={page.data.localizeHref(m.toEquals['@id'])} class="link-subtle"
						>{page.data.t('search.showEquals')} <i>{m.displayStr}</i></a
					>
				</p>
			{/if}
			{#if m.toLike}
				<p class="print:hidden">
					<a href={page.data.localizeHref(m.toLike['@id'])} class="link-subtle"
						>{page.data.t('search.showLike')} <i>{m.displayStr}</i></a
					>
				</p>
			{/if}
		{/each}
		<!-- did you mean... -->
		{#if searchResult._spell.length}
			<p class="suggest">
				{#each searchResult._spell as suggestion (suggestion.label)}
					{page.data.t('search.didYouMean')}
					<a
						href={page.data.localizeHref(
							suggestion.view['@id'].replace('_spell=true', '_spell=false')
						)}
						class="link-subtle"
					>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html suggestion.labelHtml}</a
					>?
				{/each}
			</p>
		{/if}
		{#if numHits > 0}
			<!-- no exact matches -->
			{#if relaxedSearch}
				{@const searchStr = displayMappingToString(page.data.searchResult.mapping)}
				<p>
					{page.data.t('search.noExactMatches')}. {page.data.t('search.showingResultsFor')}
					<span class="italic">{searchStr}.</span>
				</p>
			{/if}
		{:else}
			<!-- no hits -->
			<p class="hits-count">{page.data.t('search.noResults')}</p>
			<!-- search help link -->
			{#if !showMyLibrariesWarning}
				<a href={page.data.localizeHref('/help')} class="link-subtle flex items-center">
					<BiQuestionCircle class="mr-1 size-3" />
					{page.data.t('search.searchHelp')}
				</a>
			{:else}
				<!-- no fav libraries + myLibraries filter warning -->
				<div data-testid="my-libraries-warning">
					<BiInfo aria-hidden="true" class="mb-0.5 inline size-3 align-middle" />
					<p class="inline">{page.data.t('search.noAddedLibrariesText')}.</p>
					<a class="link inline" href={page.data.localizeHref('/my-pages')}
						>{page.data.t('search.addLibraries')}</a
					>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.search-result-info:has(.suggest) {
		& .hits-count::after {
			content: '.';
		}
	}

	.search-result-info .additional > :first-child {
		padding-top: calc(var(--spacing) * 2);
	}
	.search-result-info .additional > :last-child {
		padding-bottom: calc(var(--spacing) * 2);
	}
</style>
