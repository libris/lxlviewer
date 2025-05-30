<script lang="ts">
	import type { SearchResult } from '$lib/types/search';
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
			<SearchResultToolbar {searchResult} />
			<div class="flex flex-col @5xl/content:flex-row">
				<main class="flex-1">
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
				<aside>This is aside</aside>
			</div>
		</section>
		<TrailingPanes />
	</div>
{/if}
