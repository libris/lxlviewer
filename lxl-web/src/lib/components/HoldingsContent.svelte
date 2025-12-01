<script lang="ts">
	import { page } from '$app/state';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import type { BibIdData, HoldingsData, LibraryId } from '$lib/types/holdings';
	import isFnurgel from '$lib/utils/isFnurgel';
	import Holder from './Holder.svelte';
	import BiSearch from '~icons/bi/search';
	import BiHouseHeart from '~icons/bi/house-heart';
	import { JsonLd } from '$lib/types/xl';

	type Props = {
		holdings: HoldingsData;
		refinedLibraries?: string[];
	};

	let { holdings, refinedLibraries = [] }: Props = $props();
	let { byInstanceId, byType, bibIdData, holdingLibraries } = holdings;
	const userSettings = getUserSettings();
	let searchPhrase = $state('');

	// 'print' etc, workfnurgel, instance id
	const holdingId = $derived(page.state.holdings || page.url.searchParams.get('holdings'));

	const holdingSelection = $derived.by(() => {
		if (holdingId) {
			if (isFnurgel(holdingId) && byInstanceId?.[holdingId]) {
				return 'instance';
			}
			if (byType?.[holdingId]) {
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

	const derivedHolders = $derived.by(() => {
		if (holdingSelection && holdingId) {
			if (holdingSelection === 'instance') {
				return byInstanceId[holdingId];
			} else if (holdingSelection === 'type' && byType) {
				return byType?.[holdingId];
			} else if (holdingSelection === 'work' && byType) {
				return Array.from(new Set(Object.values(byType).flat()));
			}
			return [];
		}
		return [];
	});

	// filtering out null libraries, maybe we should show them?
	const derivedHoldersFull = $derived(
		derivedHolders.map((holder) => holdingLibraries[holder]).filter((holder) => !!holder)
	);

	const sortedHolders = $derived(
		derivedHoldersFull.sort((a, b) => a.name.localeCompare(b.name, page.data.locale))
	);

	const filteredHolders = $derived(
		sortedHolders.filter((holder) => {
			return holder.name.toLowerCase().indexOf(searchPhrase.toLowerCase()) > -1;
		})
	);

	const myLibsHolders = $derived(
		sortedHolders.filter((holder) => {
			if (userSettings?.myLibraries) {
				return Object.keys(userSettings.myLibraries).some((lib) => lib === holder[JsonLd.ID]);
			} else return false;
		})
	);

	// not working unil new refinedLibraries
	const refinedHolders = $derived(
		derivedHoldersFull.filter((holder) => {
			return refinedLibraries.some((lib) => lib === holder[JsonLd.ID]);
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

	const numHolders = $derived(sortedHolders?.length);

	// subset of instances applicable for the current holder/selection
	function getInstancesForLibAndSelection(libraryId: LibraryId): BibIdData {
		if (libraryId && holdingId) {
			switch (holdingSelection) {
				case 'instance': {
					return { [holdingId]: bibIdData?.[holdingId] };
				}

				case 'type': {
					let instances: BibIdData = {};
					for (const [key, value] of Object.entries(bibIdData)) {
						if (value && value['@type'] === holdingId && byInstanceId[key].includes(libraryId)) {
							instances[key] = value;
						}
					}
					return instances;
				}

				case 'work':
				default: {
					let instances: BibIdData = {};
					for (const [key, value] of Object.entries(bibIdData)) {
						if (value && byInstanceId[key].includes(libraryId)) {
							instances[key] = value;
						}
					}
					return instances;
				}
			}
		}
		return bibIdData;
	}
</script>

<div class="flex flex-col gap-2 text-sm">
	<!-- {#if showSummary}
		<HoldingsResourceCard title={holdings.title} data={cardData as ResourceData} />
	{/if} -->
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
					{#each section.data as holder, i (`mylibs-${holder[JsonLd.ID]}-${i}`)}
						{@const instances = getInstancesForLibAndSelection(holder[JsonLd.ID])}
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
		{#each sortedHolders as holder (holder[JsonLd.ID])}
			{@const instances = getInstancesForLibAndSelection(holder[JsonLd.ID])}
			<Holder
				{holder}
				{instances}
				hidden={!filteredHolders.find((h) => h[JsonLd.ID] === holder[JsonLd.ID])}
			/>
		{/each}
		{#if filteredHolders.length === 0}
			<li>
				<span role="alert">{page.data.t('search.noResults')}</span>
			</li>
		{/if}
	</ul>
</div>
