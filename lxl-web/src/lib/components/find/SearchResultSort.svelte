<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BiSortDown from '~icons/bi/sort-down';
	import BiChevronDown from '~icons/bi/chevron-down';

	const sortOrder = $derived(page.url.searchParams.get('_sort'));
	const sortOptions = [
		{ value: '', label: page.data.t('sort.relevancy') },
		{ value: `_sortKeyByLang.${page.data.locale}`, label: page.data.t('sort.alphaAsc') },
		{ value: `-_sortKeyByLang.${page.data.locale}`, label: page.data.t('sort.alphaDesc') },
		{ value: '-@reverse.instanceOf.publication.year', label: page.data.t('sort.publicationDesc') },
		{ value: '@reverse.instanceOf.publication.year', label: page.data.t('sort.publicationAsc') },
		{
			value: '-reverseLinks.totalItemsByRelation.itemOf.instanceOf',
			label: page.data.t('sort.holdingsDesc')
		}
	];

	function handleSortChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		let searchParams = page.url.searchParams;
		searchParams.set('_sort', value);
		if (searchParams.has('_offset')) {
			searchParams.set('_offset', '0');
		}
		goto(`${page.url.pathname}?${searchParams.toString()}`, { invalidateAll: true });
	}
</script>

<div class="sort-select flex flex-col items-end justify-self-end" data-testid="sort-select">
	<label class="sr-only" for="search-sort">
		{page.data.t('sort.sort')}
	</label>
	<div class="relative">
		<span class="text-subtle pointer-events-none absolute top-0 p-2">
			<BiSortDown aria-hidden="true" />
		</span>
		<select
			id="search-sort"
			class="btn btn-primary w-px sm:w-auto"
			form="search"
			onchange={handleSortChange}
		>
			{#each sortOptions as option (option.value)}
				<option value={option.value} selected={option.value === sortOrder}>{option.label}</option>
			{/each}
		</select>
		<span class="text-subtle pointer-events-none absolute top-0 right-1.5 py-2.5 text-xs">
			<BiChevronDown aria-hidden="true" />
		</span>
	</div>
</div>

<style>
	.sort-select select {
		appearance: none;
		padding-inline: calc(var(--spacing) * 8);
	}
</style>
