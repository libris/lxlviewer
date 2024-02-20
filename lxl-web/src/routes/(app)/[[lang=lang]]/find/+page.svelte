<script lang="ts">
	import SeachMapping from './SeachMapping.svelte';
	import FacetSidebar from './FacetSidebar.svelte';
	import SearchCard from './SearchCard.svelte';
	export let data;
</script>

<SeachMapping mapping={data.searchResult.mapping} />
<div class="container-fluid">
	<div class="flex gap-16 py-4 sm:py-8">
		<div class="hidden w-80 shrink-0 md:flex">
			<FacetSidebar facets={data.searchResult.facetGroups} />
		</div>
		<main class="w-full">
			<ol class="flex flex-col gap-2">
				{#each data.searchResult.items as item (item['@id'])}
					<SearchCard {item} />
				{/each}
			</ol>
		</main>
	</div>
</div>
