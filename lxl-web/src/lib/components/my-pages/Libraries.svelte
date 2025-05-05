<script lang="ts">
	import { page } from '$app/state';
	import { useSearchRequest } from 'supersearch';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import BiSearch from '~icons/bi/search';
	import { type LibraryResult } from '$lib/types/search';

	let searchPhrase = $state('');
	let endpoint = '/api/my-pages';
	let queryFn = (query: string) =>
		new URLSearchParams({
			_q: query,
			_limit: '10'
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

<h2 class="mt-6 text-lg font-medium">{page.data.t('myPages.libraries')}</h2>
<div class="flex flex-col justify-between gap-6 py-4 md:flex-row">
	<div class="w-full shrink-0 md:w-1/2">
		<label for="my-libraries-search" class="text-sm font-medium"
			>{page.data.t('myPages.findAndAdd')}</label
		>
		<div class="relative mt-2">
			<input
				id="my-libraries-search"
				bind:value={searchPhrase}
				placeholder={page.data.t('myPages.findLibrary')}
				class="bg-input h-9 w-full max-w-md rounded-sm border border-neutral-300 pr-2 pl-8 text-xs"
				oninput={handleInputChange}
				type="search"
			/>
			<BiSearch class="text-subtle absolute top-0 left-2.5 h-9" />
		</div>
		{#if searchPhrase && search.data}
			{@const searchResult = search.data as LibraryResult}
			<span class="text-2xs my-3 block" role="status">
				{#if searchResult?.totalItems && searchResult?.totalItems !== 0}
					{searchResult?.totalItems}
					{page.data.t('myPages.hitsFor')} "{searchPhrase}"
				{:else}
					{page.data.t('myPages.noResultsFor')} "{searchPhrase}"
				{/if}
			</span>
			{#if searchResult?.items && searchResult?.items.length !== 0}
				<ol class="text-xs">
					{#each searchResult.items as resultItem (resultItem['@id'])}
						{@const alreadyAdded = myLibraries?.[resultItem['@id']]}
						<li
							class="flex items-center justify-between p-1"
							id="library-search-item-{resultItem.sigel}"
						>
							<span>{resultItem.label}</span>
							<button
								class="btn btn-primary text-nowrap"
								aria-describedby="library-search-item-{resultItem.sigel}"
								type="button"
								onclick={() =>
									alreadyAdded
										? userSettings.removeLibrary(resultItem['@id'])
										: userSettings.addLibrary(resultItem)}
								>{alreadyAdded ? page.data.t('myPages.remove') : page.data.t('myPages.add')}
							</button>
						</li>
					{/each}
				</ol>
			{/if}
		{/if}
	</div>
	<div class="w-full shrink-0 md:w-1/2">
		<span id="my-libraries" class="mb-2 block text-sm font-medium"
			>{page.data.t('myPages.favouriteLibraries')}</span
		>
		<ol class="text-xs" aria-labelledby="my-libraries">
			{#each Object.entries(myLibraries) as [id, item] (id)}
				<li class="mb-1 flex items-center justify-between" id="added-library-item-{item.sigel}">
					<span>{item.label}</span>
					<button
						class="btn btn-primary text-nowrap"
						aria-describedby="added-library-item-{item.sigel}"
						type="button"
						onclick={() => userSettings.removeLibrary(id)}>{page.data.t('myPages.remove')}</button
					>
				</li>
			{/each}
		</ol>
	</div>
</div>
