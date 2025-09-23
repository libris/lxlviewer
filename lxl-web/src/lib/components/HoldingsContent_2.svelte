<script lang="ts">
	import { page } from '$app/state';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import type { HoldingsData } from '$lib/types/holdings';
	import type { ResourceData } from '$lib/types/resourceData';
	import isFnurgel from '$lib/utils/isFnurgel';
	import HoldingsResourceCard from './HoldingsResourceCard.svelte';
	import Holder from './Holder.svelte';
	import BiSearch from '~icons/bi/search';
	import BiHouseHeart from '~icons/bi/house-heart';

	type Props = { holdings: HoldingsData; showSummary?: boolean };
	let { holdings, showSummary = true }: Props = $props();
	const userSettings = getUserSettings();
	let searchPhrase = $state('');

	// 'print' etc, workfnurgel, instance id
	const holdingId = $derived(page.state.holdings || page.url.searchParams.get('holdings'));

	const holdingSelection = $derived.by(() => {
		if (holdingId) {
			if (isFnurgel(holdingId) && holdings?.holdingsByInstanceId?.[holdingId]) {
				return 'instance';
			}
			if (holdings?.holdersByType?.[holdingId]) {
				return 'type';
			}
			if (isFnurgel(holdingId)) {
				return 'work';
			} else {
				return null;
			}
		}
		return null;
	});

	// const totalNumHolders = $derived.by(() => {
	//   if (holdingSelection && holdingId) {
	//     if (holdingSelection === 'instance') {
	//       return holdings?.holdingsByInstanceId?.[holdingId].length;
	//     }
	//     else if (holdingSelection === 'type') {
	//       return holdings?.holdersByType?.[holdingId].length
	//     }
	//     else if (holdingSelection === 'work') {
	//       const uniqueIds = Object.values(holdings?.holdingsByInstanceId).reduce((set, instance) => {
	//         instance?.forEach(item => set.add(item.heldBy.sigel));
	//         return set;
	//       }, new Set());
	//       return uniqueIds.size;
	//     }
	//   } return null;
	// })

	const displayedHolders = $derived.by(() => {
		if (holdingSelection && holdingId) {
			if (holdingSelection === 'instance') {
				return holdings?.holdingsByInstanceId[holdingId].map((holding) => holding.heldBy);
			} else if (holdingSelection === 'type' && holdings?.holdersByType) {
				return holdings?.holdersByType?.[holdingId];
			} else if (holdingSelection === 'work' && holdings?.holdersByType) {
				return [
					...new Map(
						Object.values(holdings.holdersByType)
							.flat()
							.map((holder) => [holder.sigel, holder])
					).values()
				];
			} else return [];
		}
		return [];
	});

	const filteredHolders = $derived(
		displayedHolders
			.filter((holder) => {
				return holder.str?.toLowerCase().indexOf(searchPhrase.toLowerCase()) > -1;
			})
			.filter((h) => h.str)
	);

	const myLibsHolders = $derived(
		displayedHolders.filter((holder) => {
			if (userSettings?.myLibraries) {
				return Object.values(userSettings.myLibraries).some((lib) => lib.sigel === holder.sigel);
			} else return false;
		})
	);

	// pick a decorated instance or the work overview
	const cardData = $derived(
		isFnurgel(holdingId || '')
			? holdings.instances.find((instance) => {
					return (
						(holdingId && (instance?.['@id'] as string).includes(holdingId)) || holdings.overview
					);
				})
			: holdings.overview
	);

	const numHolders = $derived(displayedHolders?.length);
</script>

<div class="flex flex-col gap-2 text-sm">
	{#if showSummary}
		<HoldingsResourceCard title={holdings.title} data={cardData as ResourceData} />
	{/if}
	{#if numHolders}
		<h2 class="font-medium">
			{page.data.t('holdings.availableAt')}
			{numHolders}
			{numHolders === 1 ? page.data.t('holdings.library') : page.data.t('holdings.libraries')}
		</h2>
	{/if}
	<!-- my libraries -->
	{#if myLibsHolders.length}
		<div class="border-neutral bg-accent-50 mb-2 flex flex-col gap-2 rounded-sm border-b p-4">
			<h2 class="flex items-center gap-2">
				<span aria-hidden="true" class="text-primary-700 text-base">
					<BiHouseHeart />
				</span>
				<span class="font-medium">{page.data.t('myPages.favouriteLibraries')}</span>
			</h2>
			<ul class="text-xs">
				{#each myLibsHolders as holder (holder.sigel)}
					<Holder
						holderData={{ ...holder, ...holdings.itemLinksBySigel?.[holder.sigel] }}
						bibIds={holdings.bibIdsByInstanceId}
					/>
				{/each}
			</ul>
		</div>
	{/if}
	<!-- search -->
	<div class="relative mb-2">
		<input
			bind:value={searchPhrase}
			placeholder={page.data.t('holdings.findLibrary')}
			aria-label={page.data.t('holdings.findLibrary')}
			class="bg-input h-9 w-full rounded-sm border border-neutral-300 pr-2 pl-8 text-xs"
			type="search"
		/>
		<BiSearch class="text-subtle absolute top-0 left-2.5 h-9" />
	</div>
	<!-- list holders -->
	<ul class="flex flex-col gap-2 text-xs">
		{#each filteredHolders as holder (holder.sigel)}
			<Holder
				holderData={{ ...holder, ...holdings.itemLinksBySigel?.[holder.sigel] }}
				bibIds={holdings.bibIdsByInstanceId}
			/>
		{/each}
		{#if filteredHolders.length === 0}
			<li>
				<span role="alert">{page.data.t('search.noResults')}</span>
			</li>
		{/if}
	</ul>
</div>
