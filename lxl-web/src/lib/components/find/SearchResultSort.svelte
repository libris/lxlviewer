<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import BiSortDown from '~icons/bi/sort-down';
	import BiChevronDown from '~icons/bi/chevron-down';

	let sortOrder = $derived(page.url.searchParams.get('_sort') || '');

	const sortOptions = $derived([
		{ value: '', label: page.data.t('sort.relevancy') },
		{ value: `_sortKeyByLang.${page.data.locale}`, label: page.data.t('sort.alphaAsc') },
		{ value: `-_sortKeyByLang.${page.data.locale}`, label: page.data.t('sort.alphaDesc') },
		{
			value: '-@reverse.instanceOf.publication.librissearch:year',
			label: page.data.t('sort.publicationDesc')
		},
		{
			value: '@reverse.instanceOf.publication.librissearch:year',
			label: page.data.t('sort.publicationAsc')
		},
		...(page.data.features.holdings
			? [
					{
						value: '-reverseLinks.totalItemsByRelation.itemOf.instanceOf',
						label: page.data.t('sort.holdingsDesc')
					}
				]
			: [])
	]);

	function handleSortChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		let searchParams = new SvelteURLSearchParams(page.url.searchParams.toString());
		searchParams.set('_sort', value);
		if (searchParams.has('_offset')) {
			searchParams.set('_offset', '0');
		}
		goto(resolve(`${page.url.pathname}?${searchParams.toString()}`), {
			reset: false,
			invalidate: ['app:search']
		});
	}
</script>

<div class="sort-select flex gap-2 items-center" data-testid="sort-select">
	<label for="search-sort" class="text-xs">
		{page.data.t('sort.sort')}:
	</label>
	<div class="relative">
		<span class="text-subtle pointer-events-none absolute top-0 p-2">
			<BiSortDown aria-hidden="true" />
		</span>
		<select
			id="search-sort"
			bind:value={sortOrder}
			class="btn btn-primary w-px sm:w-auto"
			form="search-form"
			onchange={handleSortChange}
		>
			{#each sortOptions as option (option.value)}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
		<span class="text-subtle pointer-events-none absolute top-0 right-1.5 py-2.5 text-sm">
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
