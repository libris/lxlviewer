<script lang="ts">
	import { page } from '$app/stores';
	import BiSearch from '~icons/bi/search';
	import { useSearchRequest } from 'supersearch';
	import SuggestionCard from '$lib/components/SuggestionCard.svelte';
	import { saveUserSetting, removeUserSetting } from '$lib/utils/userSettings';
	import type { SearchResultItem } from '$lib/types/search';
	import { LxlLens } from '$lib/types/display';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';

	let searchPhrase = $state('');
	let endpoint = '/api/my-pages';
	let queryFn = (query: string) =>
		new URLSearchParams({
			_q: `${query} typ:Library`,
			_limit: '10',
			'@type': 'Library'
		});
	const debouncedWait = 300;

	let search = useSearchRequest({
		endpoint,
		queryFn,
		debouncedWait
	});

	let myLibraries = $page.data.userSettings?.myLibraries || [];

	function handleInputChange() {
		search.debouncedFetchData(searchPhrase);
	}

	function addFavorite(item: SearchResultItem) {
		const lib = { [item['@id']]: item[LxlLens.CardHeading]._display };
		saveUserSetting('myLibraries', lib);
	}

	function removeFavorite(id: string) {
		removeUserSetting('myLibraries', id);
	}
</script>

<div class="container-fluid mb-12 mt-8 max-w-5xl page-padding">
	<h1 class="mb-6 pl-2 text-6-cond-extrabold">Mina sidor</h1>
	<h1 class="mb-2 pl-2 text-3-cond-bold">Bibliotek</h1>
	<div class="container-fluid flex max-w-5xl rounded-md bg-primary/4 page-padding">
		<div class="w-1/2 flex-none">
			Hitta och lägg till favoritbibliotek
			<div class="relative">
				<BiSearch class="absolute left-2.5 top-6 text-sm text-icon" />
				<input
					bind:value={searchPhrase}
					placeholder={$page.data.t('myPages.findLibrary')}
					aria-label={$page.data.t('myPages.findLibrary')}
					class="mt-3 w-full pl-8"
					oninput={handleInputChange}
					type="search"
				/>
				<div>
					{#if search.data}
						{@const resultItemRows =
							(Array.isArray(search.paginatedData) &&
								search.paginatedData.map((page) => page.items).flat()) ||
							search.data?.items}
						<div class="my-5 rounded-md bg-cards py-2">
							{#each resultItemRows as resultItem}
								<div class="item-center flex min-h-12 w-full items-center bg-cards">
									<SuggestionCard item={resultItem} cellId={'0'} isFocused={false} />
									<button
										class="button-ghost mx-4"
										type="submit"
										onclick={() => addFavorite(resultItem)}>+</button
									>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
		<div class="ml-5">
			<div class="text-3-cond-bold">Mina favoritbibliotek</div>
			<div class="py-2">
				{#each Object.entries(myLibraries) as [id, data]}
					<div class="flex">
						* <DecoratedData {data} showLabels={ShowLabelsOptions.Never} />
						<button class="mx-1" type="submit" onclick={() => removeFavorite(id)}>x</button>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
</style>
