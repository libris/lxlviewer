<script lang="ts">
	import { page } from '$app/stores';
	import BiSearch from '~icons/bi/search';
	import { useSearchRequest } from 'supersearch';
	import { removeUserSetting, saveUserSetting } from '$lib/utils/userSettings';
	import type { LibraryItem } from '$lib/types/search';

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

	let myLibraries = $state($page.data.userSettings?.myLibraries || {});

	function handleInputChange() {
		search.debouncedFetchData(searchPhrase);
	}

	function addFavorite(item: LibraryItem) {
		const toAdd = { [item['@id']]: item };
		myLibraries = { ...toAdd, ...myLibraries };
		saveUserSetting('myLibraries', toAdd);
	}

	function removeFavorite(id: string) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { [id]: removed, ...newMyLibraries } = myLibraries;
		myLibraries = newMyLibraries;
		removeUserSetting('myLibraries', id);
	}
</script>

<div class="container-fluid mb-12 mt-8 w-screen max-w-full page-padding md:max-w-5xl">
	<h1 class="mb-4 pl-2 text-6-cond-extrabold">{$page.data.t('myPages.myPages')}</h1>
	<h1 class="mb-2 pl-2 text-3-cond-bold">{$page.data.t('myPages.libraries')}</h1>
	<div
		class="flex w-screen max-w-full flex-col justify-between rounded-md bg-primary/4 page-padding md:container md:max-w-5xl md:flex-row"
	>
		<div class="md:w-3/5">
			{$page.data.t('myPages.findAndAdd')}
			<div class="relative">
				<BiSearch class="absolute left-2.5 top-6 text-sm text-icon" />
				<input
					bind:value={searchPhrase}
					placeholder={$page.data.t('myPages.findLibrary')}
					aria-label={$page.data.t('myPages.findLibrary')}
					class="my-3 w-full pl-8"
					oninput={handleInputChange}
					type="search"
				/>
				<div>
					{#if search.data}
						{@const resultItems = search.data?.items}
						{@const totalHits = search.data?.totalItems}
						{#if totalHits && totalHits !== 0}
							<div class="mb-3">
								{totalHits}
								{$page.data.t('myPages.hitsFor')} "{searchPhrase}"
							</div>
						{/if}
						{#if totalHits === 0}
							<div class="mb-3">
								{$page.data.t('myPages.noResultsFor')} "{searchPhrase}"
							</div>
						{/if}
						{#if resultItems && resultItems.length !== 0}
							<div class="my-3 rounded-md bg-cards py-2">
								{#each resultItems as resultItem (resultItem['@id'])}
									<div
										class="flex min-h-12 w-full items-center justify-between bg-cards hover:bg-main"
									>
										<div class="truncate py-1 pl-3">
											{resultItem.label}
										</div>
										{#if !myLibraries?.[resultItem['@id']]}
											<button
												class="button-ghost mx-2 text-nowrap"
												type="submit"
												onclick={() => addFavorite(resultItem)}
												>{$page.data.t('myPages.add')}
											</button>
										{:else}
											<button
												class="button-ghost mx-2 text-nowrap"
												type="submit"
												onclick={() => removeFavorite(resultItem['@id'])}
												>{$page.data.t('myPages.remove')}
											</button>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					{/if}
				</div>
			</div>
		</div>
		<div class="md:ml-10 md:w-2/5">
			<div class="text-3-cond-bold">{$page.data.t('myPages.favoriteLibraries')}</div>
			<div class="py-2">
				{#each Object.entries(myLibraries) as [id, item] (id)}
					<div class="flex justify-between">
						<div class="truncate py-1">
							{item.label}
						</div>
						<div>
							<button class="ml-5 text-nowrap" type="submit" onclick={() => removeFavorite(id)}
								>{$page.data.t('myPages.remove')}</button
							>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
</style>
