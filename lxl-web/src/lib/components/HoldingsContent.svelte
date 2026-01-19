<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import type {
		BibIdData,
		HoldingsData,
		LibraryWithLinks,
		LibraryWithLinksAndInstances,
		UnknownLibrary
	} from '$lib/types/holdings';
	import { JsonLd } from '$lib/types/xl';
	import TabList, { type Tab } from './TabList.svelte';
	import HoldingsPanel from './HoldingsPanel.svelte';

	type Props = {
		holdings: HoldingsData;
		card?: Snippet;
	};

	let { holdings, card }: Props = $props();
	let { byInstanceId, byType, bibIdData, holdingLibraries } = $derived(holdings);
	let searchPhrase = $state('');

	// type, workfnurgel, instance id
	const holdingSelection = $derived(
		page.state.holdings || page.url.searchParams.get('holdings') || ''
	);

	function getHolders(selection?: string) {
		let holders: string[] = [];
		if (selection) {
			if (byType[selection]) {
				holders = byType[selection];
			} else if (byInstanceId[selection]) {
				holders = byInstanceId[selection];
			}
		} else {
			holders = Array.from(new Set(Object.values(byType).flat()));
		}
		return getDerivedHoldersFull(holders);
	}

	function getDerivedHoldersFull(holders: string[]) {
		return holders.map(
			(holder) => holdingLibraries[holder] || ({ [JsonLd.ID]: holder, name: '' } as UnknownLibrary)
		);
	}

	function sortHolders(holders: (LibraryWithLinks | UnknownLibrary)[]) {
		return holders.sort((a, b) => {
			if (!a.name && b.name) return 1;
			if (!b.name && a.name) return -1;
			return a.name.localeCompare(b.name, page.data.locale);
		});
	}

	const tabsByType: Tab[] | null = $derived.by(() => {
		// selection is instance = no tabs
		if (Object.keys(byInstanceId).some((instanceId) => instanceId === holdingSelection))
			return null;

		const typeKeys = Object.keys(byType);
		if (typeKeys.length <= 1) return null;

		const typeTabs = typeKeys.map((type) => {
			const holders = sortHolders(getHolders(type));
			const holdersWithInstances = getInstancesForHolders(holders, type);
			return {
				id: `holdings-type-${type}`,
				label: page.data.t(`holdings.${type}`),
				content: holdingPanel,
				active: type === holdingSelection ? true : false,
				contentData: holdersWithInstances
			};
		});

		// add 'all' tab
		if (typeKeys.length > 1) {
			const holders = sortHolders(getHolders());
			const holdersWithInstances = getInstancesForHolders(holders);
			typeTabs.unshift({
				id: 'holdings-type-all',
				label: page.data.t('holdings.allFormats'),
				content: holdingPanel,
				contentData: holdersWithInstances,
				active: holdingSelection === 'work'
			});
		}
		return typeTabs;
	});

	// get instances for the holders subset and the current type selection
	export function getInstancesForHolders(
		holders: (LibraryWithLinks | UnknownLibrary)[],
		selection?: string
	): (LibraryWithLinksAndInstances | UnknownLibrary)[] {
		return holders.map((holder) => {
			let _instances: BibIdData = {};
			for (const [key, value] of Object.entries(bibIdData)) {
				if (byInstanceId[key].includes(holder[JsonLd.ID])) {
					if (selection && selection === value[JsonLd.TYPE]) {
						_instances[key] = value;
					} else if (!selection) {
						_instances[key] = value;
					}
				}
			}
			return { ...holder, _instances };
		});
	}
</script>

{#snippet holdingPanel(holders: ReturnType<typeof getInstancesForHolders>)}
	<HoldingsPanel {holders} bind:searchPhrase />
{/snippet}

<div class="flex flex-col gap-2 text-sm">
	<!-- card -->
	{@render card?.()}
	<!-- tabs -->
	{#if tabsByType}
		<TabList ariaLabel={page.data.t('resource.editions')} tabs={tabsByType} />
	{:else}
		{@const holders = sortHolders(getHolders(holdingSelection))}
		{@const holdersWithInstances = getInstancesForHolders(holders)}
		{@render holdingPanel(holdersWithInstances)}
	{/if}
</div>
