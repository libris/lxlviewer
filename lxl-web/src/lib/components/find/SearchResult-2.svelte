<script lang="ts">
	import { page } from '$app/state';
	import type { SearchResult } from '$lib/types/search';
	import SiteFooter from '../../../routes/(app)/[[lang=lang]]/SiteFooter.svelte';
	import Toolbar from '../Toolbar.svelte';
	import Filters from './Filters.svelte';
	import LeadingPane from './LeadingPane.svelte';
	import Pagination from './Pagination.svelte';
	import SearchCard from './SearchCard.svelte';
	import SearchResultInfo from './SearchResultInfo.svelte';
	import SearchResultToolbar from './SearchResultToolbar.svelte';
	import TrailingPanes from './TrailingPanes.svelte';
	type SearchResultProps = {
		searchResult: SearchResult;
	};

	const { searchResult }: SearchResultProps = $props();
</script>

{#if searchResult}
	<div class="search-result flex w-full">
		<LeadingPane>
			<Filters facets={searchResult.facetGroups || []} />
		</LeadingPane>
		<div class="@container/content flex-1">
			<div class="flex flex-col @5xl/content:flex-row">
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
					<div class="aside-content sticky m-3 h-44 rounded-sm border border-neutral-200 p-3">
						<h2 class="text-sm font-medium">This is some aside content</h2>
					</div>
				</aside>
			</div>
			<SiteFooter />
		</div>
		<TrailingPanes />
	</div>
{/if}

<style>
	.aside-content {
		top: calc(var(--app-bar-height) + (var(--spacing) * 8));
	}
</style>
