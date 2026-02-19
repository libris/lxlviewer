<script lang="ts">
	import { page } from '$app/state';
	import type { SearchResult } from '$lib/types/search';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import { MY_LIBRARIES_FILTER_ALIAS } from '$lib/constants/facets';
	import BiInfo from '~icons/bi/info-circle';
	import { displayMappingToString } from '$lib/utils/displayMappingToString';

	type SearchResultInfoProps = {
		searchResult: SearchResult;
	};

	const { searchResult }: SearchResultInfoProps = $props();
	const userSettings = getUserSettings();
	const numHits = $derived(searchResult.totalItems);
	const showMyLibrariesWarning = $derived(
		numHits === 0 &&
			page.url.search.includes(MY_LIBRARIES_FILTER_ALIAS) &&
			(!userSettings.myLibraries || Object.keys(userSettings.myLibraries).length === 0)
	);

	const retried = $derived(page.url.searchParams.get('_retried'));
</script>

<div
	class="search-result-info text-2xs flex flex-col justify-center px-3 py-1.5"
	role="status"
	aria-atomic="true"
	data-testid="result-info"
>
	{#if retried && numHits && numHits > 0}
		{@const searchStr = displayMappingToString(page.data.searchResult.mapping)}
		<p>
			{page.data.t('search.noExactMatches')}. {page.data.t('search.showingResultsFor')}
			<span class="italic">{searchStr}.</span>
		</p>
	{/if}
	<div class="flex gap-1">
		{#if numHits && numHits > 0}
			<p class="hits-count">
				{#if numHits > searchResult.itemsPerPage}
					<span class="font-medium">
						{(searchResult.itemOffset + 1).toLocaleString(page.data.locale)}
						-
						{Math.min(numHits, searchResult.itemOffset + searchResult.itemsPerPage).toLocaleString(
							page.data.locale
						)}
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
		{:else}
			<p class="hits-count">{page.data.t('search.noResults')}</p>
		{/if}
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
	</div>
	<!-- no fav libraries + myLibraries filter warning -->
	{#if showMyLibrariesWarning}
		<div role="alert" data-testid="my-libraries-warning">
			<BiInfo aria-hidden="true" class="text-subtle mb-0.5 inline align-middle" />
			<p class="inline">{page.data.t('search.noAddedLibrariesText')}.</p>
			<a class="link inline" href={page.data.localizeHref('/my-pages')}
				>{page.data.t('search.addLibraries')}</a
			>
		</div>
	{/if}
</div>

<style>
	.search-result-info {
		min-height: var(--toolbar-height);
	}

	.search-result-info:has(.suggest) {
		& .hits-count::after {
			content: '.';
		}
	}
</style>
