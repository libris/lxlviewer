<script lang="ts">
	import { page } from '$app/state';
	const { searchResult } = $props();
	const numHits = searchResult.totalItems;
</script>

<div
	class="search-result-info text-2xs flex items-center gap-1 px-4"
	role="status"
	data-testid="result-info"
>
	{#if numHits && numHits > 0}
		<span class="hits-count">
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
		</span>
	{:else}
		<span class="hits-count">{page.data.t('search.noResults')}</span>
	{/if}
	{#if searchResult._spell.length}
		<span class="suggest">
			{#each searchResult._spell as suggestion (suggestion.label)}
				{page.data.t('search.didYouMean')}
				<a href={suggestion.view['@id'].replace('_spell=true', '_spell=false')} class="link-subtle">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html suggestion.labelHtml}</a
				>?
			{/each}
		</span>
	{/if}
</div>

<style>
	.search-result-info {
		height: var(--toolbar-height);
	}

	.search-result-info:has(.suggest) {
		& .hits-count::after {
			content: '.';
		}
	}
</style>
