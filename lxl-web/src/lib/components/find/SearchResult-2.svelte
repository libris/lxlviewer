<script lang="ts">
	import type { SearchResult } from '$lib/types/search';
	import LeadingPane from './LeadingPane.svelte';
	import Pagination from './Pagination.svelte';
	import SearchCard from './SearchCard.svelte';
	import SearchResultToolbar from './SearchResultToolbar.svelte';
	import TrailingPanes from './TrailingPanes.svelte';
	type SearchResultProps = {
		searchResult: SearchResult;
	};

	const { searchResult }: SearchResultProps = $props();
</script>

<div class="search-result flex w-full">
	<LeadingPane />
	<section class="@container/content flex-1">
		<SearchResultToolbar />
		<div class="flex flex-col @5xl/content:flex-row">
			<main class="flex-1">
				<ol class="flex flex-col gap-0.5 lg:px-0">
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
