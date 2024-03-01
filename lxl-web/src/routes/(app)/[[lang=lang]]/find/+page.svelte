<script lang="ts">
	import SeachMapping from './SeachMapping.svelte';
	import SearchCard from './SearchCard.svelte';
	import Pagination from './Pagination.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import FacetGroup from './FacetGroup.svelte';

	$: searchResult = $page.data.searchResult;
	$: numHits = searchResult.totalItems;
	$: facets = searchResult.facetGroups;

	const sortOrder = $page.url.searchParams.get('_sort');
	const sortOptions = [
		{ value: '', label: 'Relevans' },
		{ value: `_sortKeyByLang.${$page.data.locale}`, label: 'A-Ö' },
		{ value: `-_sortKeyByLang.${$page.data.locale}`, label: 'Ö-A' }
	];

	function handleSortChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		let searchParams = $page.url.searchParams;
		searchParams.set('_sort', value);
		if (searchParams.has('_offset')) {
			searchParams.set('_offset', '0');
		}
		goto(`find?${searchParams.toString()}`, { invalidateAll: true });
	}
</script>

<SeachMapping mapping={searchResult.mapping} />
<div class="container-fluid">
	<div class="flex gap-16 py-4 sm:py-8">
		<nav class="hidden w-80 shrink-0 flex-col md:flex" aria-labelledby="facet-sidebar-header">
			{#if facets && facets.length > 0}
				<header id="facet-sidebar-header" class="font-bold">Filter</header>
				<ol>
					{#each facets as group (group.dimension)}
						<FacetGroup {group} locale={$page.data.locale} />
					{/each}
				</ol>
			{/if}
		</nav>
		<main class="w-full max-w-content">
			<div class="mb-4 flex justify-between">
				<p role="status">
					{#if numHits && numHits > 0}
						{numHits.toLocaleString($page.data.locale)} träffar
					{:else}
						Inga träffar
					{/if}
				</p>
				{#if numHits > 0}
					<div>
						<label for="search-sort">Sortera efter</label>
						<select id="search-sort" form="main-search" on:change={handleSortChange}>
							{#each sortOptions as option}
								<option value={option.value} selected={option.value === sortOrder}
									>{option.label}</option
								>
							{/each}
						</select>
					</div>
				{/if}
			</div>
			<ol class="flex flex-col gap-2">
				{#each searchResult.items as item (item['@id'])}
					<SearchCard {item} />
				{/each}
			</ol>
			<Pagination data={searchResult} />
		</main>
	</div>
</div>
