<script lang="ts">
	import { page } from '$app/state';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import { JsonLd } from '$lib/types/xl';
	import { type LibraryResult } from '$lib/types/search';
	import { useSearchRequest } from 'supersearch';
	import Suggestion from '$lib/components/supersearch/Suggestion.svelte';
	import BiSearch from '~icons/bi/search';
	import BiHeart from '~icons/bi/heart-fill';
	import BiTrash from '~icons/bi/trash';

	let searchPhrase = $state('');
	let endpoint = '/api/my-pages';
	let queryFn = (query: string) =>
		new URLSearchParams({
			_q: query,
			_limit: '6',
			_stats: 'false',
			_spell: 'false'
		});
	const debouncedWait = 300;

	let search = useSearchRequest({
		endpoint,
		queryFn,
		debouncedWait
	});

	const userSettings = getUserSettings();
	const myLibraries = $derived(userSettings.myLibraries || {});

	function handleInputChange() {
		search.debouncedFetchData(searchPhrase);
	}
</script>

<h2 class="mt-4 font-medium">{page.data.t('myPages.findAndAdd')}</h2>
<div class="flex flex-col justify-between gap-6 py-2 lg:flex-row">
	<div class="w-full max-w-xl shrink-0 lg:w-7/12">
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
		{#if searchPhrase && search.data}
			{@const searchResult = search.data as LibraryResult}
			<span class="my-3 block text-xs font-medium" role="status">
				{#if search.isLoading}
					{page.data.t('search.loading')}
				{:else if searchResult?.totalItems && searchResult?.totalItems !== 0}
					{searchResult?.totalItems}
					{page.data.t('myPages.hitsFor')} "{searchPhrase}"
				{:else}
					{page.data.t('myPages.noResultsFor')} "{searchPhrase}"
				{/if}
			</span>
			{#if searchResult?.items && searchResult?.items.length !== 0}
				<ol class="border-neutral flex flex-col gap-1 rounded-sm border p-1 text-xs">
					{#each searchResult.items as resultItem (resultItem[JsonLd.ID])}
						{@const alreadyAdded = myLibraries?.[resultItem.thingId]}
						<li class="hover:bg-primary-50 flex flex-1 items-center gap-1">
							<div class="flex-1" id="library-search-item-{resultItem[JsonLd.ID]}">
								<Suggestion item={resultItem} />
							</div>
							<div class="px-4">
								<button
									class="btn btn-primary text-nowrap"
									aria-describedby="library-search-item-{resultItem[JsonLd.ID]}"
									type="button"
									onclick={() =>
										alreadyAdded
											? userSettings.removeLibrary(resultItem.thingId)
											: userSettings.addLibrary(resultItem.thingId, resultItem.str)}
								>
									{#if alreadyAdded}
										<BiTrash />
										<span>{page.data.t('myPages.remove')}</span>
									{:else}
										<BiHeart class="text-primary-600" />
										<span>{page.data.t('myPages.add')}</span>
									{/if}
								</button>
							</div>
						</li>
					{/each}
				</ol>
			{/if}
		{/if}
	</div>
	<div class="w-full shrink-0 lg:w-5/12">
		<span id="my-libraries" class="mb-2 block text-sm font-medium"
			>{page.data.t('myPages.favouriteLibraries')}</span
		>
		<!-- favourite libraries -->
		<ol class="flex flex-col gap-1 text-xs" aria-labelledby="my-libraries">
			{#each Object.entries(myLibraries) as [key, value] (key)}
				<li class="flex flex-1 items-center gap-1" id="added-library-item-{key}">
					<div class="flex-1">
						<span>{value}</span>
					</div>
					<button
						class="btn btn-primary text-nowrap"
						aria-describedby="added-library-item-{key}"
						type="button"
						onclick={() => userSettings.removeLibrary(key)}
					>
						<BiTrash />
						<span>{page.data.t('myPages.remove')}</span>
					</button>
				</li>
			{/each}
		</ol>
	</div>
</div>
