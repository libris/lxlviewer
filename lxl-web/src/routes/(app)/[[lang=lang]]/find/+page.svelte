<script lang="ts">
	import SeachMapping from './SeachMapping.svelte';
	import FacetSidebar from './FacetSidebar.svelte';
	import SearchCard from './SearchCard.svelte';
	import Pagination from './Pagination.svelte';
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
		get prev() {
			return {
				elem: itemOffset > 0 ? 'a' : null,
				href: setOffsetParam(itemOffset - itemsPerPage > 0 ? itemOffset - itemsPerPage : 0),
				label: '←',
				ariaLabel: 'föregående'
			};
		},
		get firstPage() {
			return {
				elem: first && this.currentPage.number > 1 ? 'a' : null,
				href: first?.['@id'],
				number: 1
			};
		},
		get ellipsisFirst() {
			return {
				elem: this.currentPage.number > 2 ? 'span' : null,
				label: '...'
			};
		},
		get prevPage() {
			return {
				...this.prev,
				elem:
					this.currentPage.number === this.lastPage.number && this.currentPage.number > 2
						? 'a'
						: null,
				href: setOffsetParam(itemOffset - itemsPerPage),
				number: this.currentPage.number - 1
			};
		},
		get currentPage() {
			return {
				elem: 'span',
				number: Math.floor(itemOffset / itemsPerPage) + 1
			};
		},
		get nextPage() {
			return {
				elem: next ? 'a' : null,
				href: next?.['@id'],
				number: this.currentPage.number + 1
			};
		},
		get secondNextPage() {
			return {
				elem: this.currentPage.number === 1 && totalItems > itemsPerPage * 2 ? 'a' : null,
				href: setOffsetParam(itemOffset + itemsPerPage * 2),
				number: this.nextPage.number + 1
			};
		},
		get ellipsisLast() {
			return {
				...this.ellipsisFirst,
				elem: this.lastPage.number - this.nextPage.number > 1 ? 'span' : null
			};
		},
		get lastPage() {
			return {
				elem:
					last &&
					this.currentPage.number !== Math.ceil(totalItems / itemsPerPage) &&
					this.nextPage.number !== Math.ceil(totalItems / itemsPerPage)
						? 'a'
						: null,
				href: last?.['@id'],
				number: Math.ceil(totalItems / itemsPerPage)
			};
		},
		get next() {
			return {
				elem: next ? 'a' : null,
				href: next?.['@id'],
				label: '→',
				ariaLabel: 'Nästa'
			};
		}
	};

	function setOffsetParam(offset: number) {
		const params = $page.url.searchParams;
		params.set('_offset', offset.toString());
		return `find?${params.toString()}`;
	}
	console.log($page.url);
	console.log($page.data.searchResult);
	$: searchResult = $page.data.searchResult;
</script>

<SeachMapping mapping={searchResult.mapping} />
<div class="container-fluid">
	<div class="flex gap-16 py-4 sm:py-8">
		<div class="hidden w-80 shrink-0 md:flex">
			<FacetSidebar facets={searchResult.facetGroups} />
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
				{#each searchResult.items as item (item['@id'])}
					<SearchCard {item} />
				{/each}
			</ol>
			<Pagination data={searchResult} />
		</main>
	</div>
</div>
