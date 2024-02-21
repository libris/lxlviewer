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

	$: ({ first, last, next, totalItems, itemsPerPage, itemOffset } = $page.data.searchResult);
	$: pagination = {
		currentPage: Math.floor(itemOffset / itemsPerPage) + 1,
		nextPage: Math.floor(itemOffset / itemsPerPage) + 2,
		lastPage: Math.ceil(totalItems / itemsPerPage)
	};

	function setSortParam(offset: number) {
		const params = $page.url.searchParams;
		params.set('_offset', offset.toString());
		return `find?${params.toString()}`;
	}
	console.log($page.url);
	console.log($page.data.searchResult);
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
				{#each $page.data.searchResult.items as item (item['@id'])}
					<SearchCard {item} />
				{/each}
			</ol>
			{#if $page.data.searchResult.items.length > 0 && totalItems > itemsPerPage}
				<nav aria-label="paginering" class="my-4 flex justify-center gap-2">
					<!-- prev -->
					{#if itemOffset > 0}<a
							href={setSortParam(itemOffset - itemsPerPage > 0 ? itemOffset - itemsPerPage : 0)}
							>←</a
						>{/if}
					<!-- first -->
					{#if first && pagination.currentPage !== 1}<a id="first" href={first['@id']}>1</a>{/if}
					<!-- divider -->
					{#if pagination.currentPage > 2}<span>...</span>{/if}
					<!-- prev (if last) -->
					{#if pagination.currentPage === pagination.lastPage && pagination.currentPage > 2}<a
							id="prev"
							href={setSortParam(itemOffset - itemsPerPage)}>{pagination.currentPage - 1}</a
						>{/if}
					<!-- current -->
					<span class="rounded-md border border-primary px-1">{pagination.currentPage}</span>
					<!-- next -->
					{#if next}<a id="next" href={next['@id']}>{pagination.nextPage}</a>{/if}
					<!-- second next (if first) -->
					{#if pagination.currentPage === 1 && totalItems > itemsPerPage * 2}<a
							id="second-next"
							href={setSortParam(itemOffset + itemsPerPage * 2)}>{pagination.nextPage + 1}</a
						>{/if}
					<!-- divider -->
					{#if pagination.lastPage - pagination.nextPage > 1}<span>...</span>{/if}
					<!-- last -->
					{#if last && pagination.currentPage !== pagination.lastPage && pagination.nextPage !== pagination.lastPage}<a
							id="last"
							href={last['@id']}>{pagination.lastPage}</a
						>{/if}
					<!-- next -->
					{#if next}<a href={next['@id']}>→</a>{/if}
				</nav>
			{/if}
		</main>
	</div>
</div>
