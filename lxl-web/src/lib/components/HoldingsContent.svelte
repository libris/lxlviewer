<script lang="ts">
	import { page } from '$app/state';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import type { BibIdByInstanceId, HoldingsData } from '$lib/types/holdings';
	import type { ResourceData } from '$lib/types/resourceData';
	import isFnurgel from '$lib/utils/isFnurgel';
	import HoldingsResourceCard from './HoldingsResourceCard.svelte';
	import Holder from './Holder.svelte';
	import BiSearch from '~icons/bi/search';
	import BiHouseHeart from '~icons/bi/house-heart';

	type Props = { holdings: HoldingsData; refinedLibraries?: string[]; showSummary?: boolean };
	let { holdings, refinedLibraries = [], showSummary = true }: Props = $props();
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

	const sortedHolders = $derived(
		displayedHolders.sort((a, b) => a.str.localeCompare(b.str, page.data.locale))
	);
	const filteredHolders = $derived(
		sortedHolders
			.filter((holder) => {
				return holder.str?.toLowerCase().indexOf(searchPhrase.toLowerCase()) > -1;
			})
			.filter((h) => h.str)
	);

	const myLibsHolders = $derived(
		sortedHolders.filter((holder) => {
			if (userSettings?.myLibraries) {
				return Object.values(userSettings.myLibraries).some((lib) => lib.sigel === holder.sigel);
			} else return false;
		})
	);

	const refinedHolders = $derived(
		displayedHolders.filter((holder) => {
			return refinedLibraries.some((lib) => lib === holder.sigel);
		})
	);

	const specialSections = $derived([
		{
			id: 'refined-libraries-section',
			title: page.data.t(`holdings.refinedLibraries`),
			data: refinedHolders,
			icon: BiSearch
		},
		{
			id: 'my-libraries-section',
			title: page.data.t('myPages.favouriteLibraries'),
			data: myLibsHolders,
			icon: BiHouseHeart
		}
	]);

	// pick an instance instance or the work overview
	const cardData = $derived.by(() => {
		if (holdingSelection === 'instance') {
			return (
				holdingId &&
				holdings.instances.find((instance) => (instance['@id'] as string).includes(holdingId))
			);
		} else return holdings.overview;
	});

	const numHolders = $derived(sortedHolders?.length);

	// subset of instances applicable for the current holder/selection
	function getInstancesForSigelAndSelection(sigel: string): BibIdByInstanceId {
		if (sigel && holdingId) {
			switch (holdingSelection) {
				case 'instance': {
					return { [holdingId]: holdings.bibIdsByInstanceId?.[holdingId] };
				}

				case 'type': {
					let instances: BibIdByInstanceId = {};
					for (const [key, value] of Object.entries(holdings.bibIdsByInstanceId)) {
						if (value && value['@type'] === holdingId && value.holders?.includes(sigel)) {
							instances[key] = value;
						}
					}
					return instances;
				}

				case 'work':
				default: {
					let instances: BibIdByInstanceId = {};
					for (const [key, value] of Object.entries(holdings.bibIdsByInstanceId)) {
						if (value.holders && value.holders?.includes(sigel)) {
							instances[key] = value;
						}
					}
					return instances;
				}
			}
		}
		return holdings.bibIdsByInstanceId;
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
	<!-- refined libraries & my libraries -->
	{#each specialSections as section (section.id)}
		{#if section.data.length}
			{@const Icon = section.icon}
			<div
				class="border-neutral bg-accent-50 mb-2 flex flex-col gap-2 rounded-sm border-b p-4 pb-1"
			>
				<h2 class="flex items-center gap-2">
					<span aria-hidden="true" class="text-subtle text-base">
						<Icon />
					</span>
					<span class="font-medium">{section.title}</span>
				</h2>
				<ul class="flex flex-col gap-2 text-xs">
					{#each section.data as holder, i (`mylibs-${holder.sigel}-${i}`)}
						{@const instances = getInstancesForSigelAndSelection(holder.sigel)}
						<Holder {holder} {instances} />
					{/each}
				</ul>
			</div>
		{/if}
	{/each}
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
		{#each sortedHolders as holder (holder.obj['@id'])}
			{@const instances = getInstancesForSigelAndSelection(holder.sigel)}
			<Holder
				{holder}
				{instances}
				hidden={!filteredHolders.find((h) => h.sigel === holder.sigel)}
			/>
		{/each}
		{#if filteredHolders.length === 0}
			<li>
				<span role="alert">{page.data.t('search.noResults')}</span>
			</li>
		{/if}
	</ul>
</div>
