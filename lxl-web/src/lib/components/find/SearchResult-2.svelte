<script lang="ts">
	import type { SearchResult } from '$lib/types/search';
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
		<section class="@container/content flex-1">
			<div class="flex flex-col @5xl/content:flex-row">
				<main class="flex-1">
					<SearchResultToolbar {searchResult} />
					<SearchResultInfo {searchResult} />
					<ol class="flex flex-col sm:px-4">
						{#each searchResult.items as item (item['@id'])}
							<li>
								<SearchCard {item} />
							</li>
						{/each}
					</ol>
					<Pagination data={searchResult} />
				</main>
				<aside>
					<div class="hidden @5xl/content:block">
						<Toolbar />
					</div>
					<div class="aside-content sticky p-3">
						<p>This is some aside content</p>
					</div>
				</aside>
			</div>
		</section>
		<TrailingPanes />
	</div>
{/if}

<style>
	.aside-content {
		top: calc(var(--app-bar-height) + (var(--spacing) * 8));
	}
</style>
