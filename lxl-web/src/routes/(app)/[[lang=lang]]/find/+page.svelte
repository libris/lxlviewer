<script lang="ts">
	import SeachMapping from './SeachMapping.svelte';
	import FacetSidebar from './FacetSidebar.svelte';
	import SearchCard from './SearchCard.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	$: numHits = $page.data.searchResult.totalItems;
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
		goto(`find?${searchParams.toString()}`, { invalidateAll: true });
	}
</script>

<SeachMapping mapping={$page.data.searchResult.mapping} />
<div class="container-fluid">
	<div class="flex gap-16 py-4 sm:py-8">
		<div class="hidden w-80 shrink-0 md:flex">
			<FacetSidebar facets={$page.data.searchResult.facetGroups} />
		</div>
		<main class="max-w-content">
			<div class="mb-4 flex justify-between">
				<p role="status">
					{#if numHits && numHits > 0}
						{numHits.toLocaleString($page.data.locale)} träffar
					{:else}
						Inga träffar
					{/if}
				</p>
				{#if numHits > 0}
					<form on:change={handleSortChange}>
						<label for="search-sort">Sortera efter</label>
						<select name="search-sort">
							{#each sortOptions as option}
								<option value={option.value} selected={option.value === sortOrder}
									>{option.label}</option
								>
							{/each}
						</select>
					</form>
				{/if}
			</div>
			<ol class="flex flex-col gap-2">
				{#each $page.data.searchResult.items as item (item['@id'])}
					<SearchCard {item} />
				{/each}
			</ol>
		</main>
	</div>
</div>
