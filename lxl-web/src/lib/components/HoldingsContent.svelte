<script lang="ts">
	import { page } from '$app/state';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import type { HolderLinks, HoldingsData } from '$lib/types/holdings';
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

	// pick an instance instance or the work overview
	const cardData = $derived.by(() => {
		if (holdingSelection === 'instance') {
			return (
				holdingId &&
				holdings.instances.find((instance) => (instance['@id'] as string).includes(holdingId))
			);
		} else return holdings.overview;
	});

	const numHolders = $derived(displayedHolders?.length);

	// only include instance links applicable for the current holding selection
	function getHolderLinksForType(holderlinks: HolderLinks): HolderLinks {
		if (!holderlinks || Object.keys(holderlinks.bibIds).length <= 1) {
			return holderlinks;
		}

		switch (holdingSelection) {
			case 'instance': {
				let bibId = holdingId && holdings.bibIdsByInstanceId?.[holdingId].bibId;
				return bibId
					? { ...holderlinks, ...{ bibIds: { [bibId]: holderlinks.bibIds?.[bibId] } } }
					: holderlinks;
			}

			case 'type': {
				let bibIds: Record<string, HolderLinks['bibIds'][string]> = {};
				const bibIdsOfType = Object.values(holdings.bibIdsByInstanceId)
					.filter((i) => i['@type'] === holdingId)
					.map((i) => i.bibId);

				bibIdsOfType.forEach((b) => {
					if (holderlinks.bibIds?.[b]) {
						bibIds[b] = holderlinks.bibIds?.[b];
					}
				});
				return bibIds ? { ...holderlinks, ...{ bibIds } } : holderlinks;
			}

			default:
				return holderlinks;
		}
	}
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
		<div class="border-neutral bg-accent-50 mb-2 flex flex-col gap-2 rounded-sm border-b p-4 pb-1">
			<h2 class="flex items-center gap-2">
				<span aria-hidden="true" class="text-primary-700 text-base">
					<BiHouseHeart />
				</span>
				<span class="font-medium">{page.data.t('myPages.favouriteLibraries')}</span>
			</h2>
			<ul class="flex flex-col gap-2 text-xs">
				{#each myLibsHolders as holder, i (`mylibs-${holder.sigel}-${i}`)}
					{@const holderLinks = getHolderLinksForType(holdings.itemLinksBySigel?.[holder.sigel])}
					<Holder holderData={{ ...holder, ...holderLinks }} bibIds={holdings.bibIdsByInstanceId} />
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
		{#each filteredHolders as holder, i (`holder-${holder.sigel}-${i}`)}
			{@const holderLinks = getHolderLinksForType(holdings.itemLinksBySigel?.[holder.sigel])}
			<Holder holderData={{ ...holder, ...holderLinks }} bibIds={holdings.bibIdsByInstanceId} />
		{/each}
		{#if filteredHolders.length === 0}
			<li>
				<span role="alert">{page.data.t('search.noResults')}</span>
			</li>
		{/if}
	</ul>
</div>
