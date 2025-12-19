<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import { JsonLd } from '$lib/types/xl';
	import { type LibraryResult, type LibraryResultItem } from '$lib/types/search';
	import { useSearchRequest } from 'supersearch';
	import SearchCard from '$lib/components/find/SearchCard.svelte';
	import BiSearch from '~icons/bi/search';
	import BiHouseHeart from '~icons/bi/house-heart';

	type Props = {
		q: string | null;
	};
	const { q }: Props = $props();

	const myLibraries: LibraryResultItem[] | undefined = $derived(page.data.myLibraries);
	const myLibsError: string | undefined = $derived(page.data.error);

	let searchPhrase = $state(q || '');
	let endpoint = '/api/my-pages';
	let queryFn = (query: string) =>
		new URLSearchParams({
			_q: query,
			_limit: '20',
			_stats: 'false',
			_spell: 'false'
		});
	const debouncedWait = 300;

	const myLibsCookie = $derived(Object.keys(getUserSettings().myLibraries || {}));
	const addedFromSearch: LibraryResultItem[] = $state([]);

	// "current state" of myLibs is page data + newly added search results
	const mergedLibraries = $derived.by(() => {
		return myLibsCookie
			.map(
				(id) =>
					(myLibraries ?? []).find((m) => m.libraryId === id) ||
					addedFromSearch.find((a) => a.libraryId === id)
			)
			.filter((lib) => !!lib);
	});

	function onResponse() {
		const params = new SvelteURLSearchParams();
		params.set('q', searchPhrase);
		goto(page.url.pathname + `?${params.toString()}`, { replaceState: true, keepFocus: true });
	}

	let search = useSearchRequest({
		endpoint,
		queryFn,
		transformFn: onResponse,
		debouncedWait
	});

	function handleInputChange() {
		if (searchPhrase) {
			search.debouncedFetchData(searchPhrase);
		}
	}

	onMount(() => {
		if (searchPhrase) {
			search.debouncedFetchData(searchPhrase);
		}
	});

	$effect(() => {
		const items: LibraryResultItem[] = search?.data?.items || [];
		const matches = items.filter((i) => myLibsCookie.includes(i.libraryId));

		for (const m of matches) {
			if (!addedFromSearch.find((x) => x.libraryId === m.libraryId)) {
				// when adding a lib from the search results, display that card in list on the right
				addedFromSearch.push(m);
			}
		}
	});
</script>

<div class="flex flex-col-reverse justify-between gap-6 py-2 md:flex-row">
	<div class="w-full max-w-xl lg:w-6/12">
		<h2 class="mt-4 font-medium">{page.data.t('myPages.findAndAdd')}</h2>
		<label for="my-libraries-search" class="sr-only text-sm font-medium"
			>{page.data.t('myPages.findAndAdd')}</label
		>
		<div class="relative mt-2">
			<input
				id="my-libraries-search"
				bind:value={searchPhrase}
				placeholder={page.data.t('myPages.findLibrary')}
				class="bg-input h-9 w-full max-w-xl rounded-sm border border-neutral-300 pr-2 pl-8 text-xs"
				oninput={handleInputChange}
				type="search"
			/>
			<BiSearch class="text-subtle absolute top-0 left-2.5 h-9" />
		</div>
		<span class="my-3 block text-xs font-medium" role="status">
			{#if search.isLoading}
				{page.data.t('search.loading')}
			{:else if search.error && !search.data}
				<span class="bg-severe-50 rounded-sm p-1.5">{page.data.t('errors.somethingWentWrong')}</span
				>
			{:else if searchPhrase && search.data}
				{@const searchResult = search.data as LibraryResult}
				{@const hasResults = searchResult?.totalItems && searchResult?.totalItems !== 0}
				{#if hasResults}
					{searchResult?.totalItems}
					{page.data.t('myPages.hitsFor')} "{searchPhrase}"
				{:else}
					{page.data.t('myPages.noResultsFor')} "{searchPhrase}"
				{/if}
			{/if}
		</span>
		{#if searchPhrase && search.data}
			{@const searchResult = search.data as LibraryResult}
			{#if searchResult?.items && searchResult?.items.length !== 0}
				<ol class="my-libraries-result flex flex-col rounded-sm p-1">
					{#each searchResult.items as resultItem (resultItem[JsonLd.ID])}
						<li>
							<SearchCard item={resultItem} />
						</li>
					{/each}
				</ol>
			{/if}
		{/if}
	</div>
	<!-- favourite libraries -->
	<div class="w-full lg:w-6/12">
		<h2 id="my-libraries" class="mt-4 flex items-center gap-2 font-medium">
			<BiHouseHeart class="libraries-indicator" aria-hidden="true" />
			<span>{page.data.t('myPages.favouriteLibraries')}</span>
		</h2>
		{#if mergedLibraries.length}
			<ol
				class="my-libraries-result border-neutral mt-2 rounded-sm border"
				aria-labelledby="my-libraries"
			>
				{#each mergedLibraries as myLib (myLib[JsonLd.ID])}
					<li>
						<SearchCard item={myLib} />
					</li>
				{/each}
			</ol>
		{:else if myLibsError}
			<p class="bg-severe-50 mt-2 rounded-sm p-1 text-xs">
				{page.data.t('errors.somethingWentWrong')}: {myLibsError}
			</p>
		{:else}
			<p class="mt-2 text-xs">{page.data.t('search.noAddedLibrariesText')}</p>
		{/if}
	</div>
</div>

<style>
	:global(.my-libraries-result li:first-of-type .search-card) {
		border-top: none;
	}
</style>
