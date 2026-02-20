<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import { JsonLd } from '$lib/types/xl';
	import type {
		BibIdData,
		HoldingsData,
		LibraryWithLinksAndInstances,
		UnknownLibrary
	} from '$lib/types/holdings';
	import TabList, { type Tab } from './TabList.svelte';
	import HoldingsPanel from './HoldingsPanel.svelte';
	import isFnurgel from '$lib/utils/isFnurgel';

	type Props = {
		holdings: HoldingsData;
		card?: Snippet;
	};

	let { holdings, card }: Props = $props();

	const { byInstanceId, byType, bibIdData, holdingLibraries } = $derived(holdings);
	let searchPhrase = $state('');

	// instanceId | type | work fnurgel | ''
	const holdingParam = $derived(page.state.holdings || page.url.searchParams.get('holdings') || '');

	type SelectionKind = 'instance' | 'type' | 'work' | 'all';

	function getSelectionKind(selection?: string): SelectionKind {
		if (!selection) return 'all';
		if (byInstanceId[selection]) return 'instance';
		if (byType[selection]) return 'type';
		if (isFnurgel(selection)) return 'work';
		return 'all';
	}

	function getVisibleInstanceIds(selection?: string): string[] {
		const kind = getSelectionKind(selection);

		switch (kind) {
			case 'instance':
				return [selection!];

			case 'type':
				return Object.entries(bibIdData)
					.filter(([, data]) => data[JsonLd.TYPE] === selection)
					.map(([id]) => id);

			case 'work':
			case 'all':
			default:
				return Object.keys(bibIdData);
		}
	}

	function getLibrariesWithInstances(
		instanceIds: string[]
	): (LibraryWithLinksAndInstances | UnknownLibrary)[] {
		const libraries: Record<string, BibIdData> = {};

		for (const instanceId of instanceIds) {
			const holders = byInstanceId[instanceId] ?? [];

			for (const lib of holders) {
				const libraryId = lib[JsonLd.ID];
				if (!libraries[libraryId]) {
					libraries[libraryId] = {};
				}
				libraries[libraryId][instanceId] = { ...bibIdData[instanceId], itemStr: lib.itemStr };
			}
		}

		return Object.entries(libraries).map(([libraryId, _instances]) => ({
			...(holdingLibraries[libraryId] ?? ({ [JsonLd.ID]: libraryId, name: '' } as UnknownLibrary)),
			_instances
		}));
	}

	function sortHolders(holders: (LibraryWithLinksAndInstances | UnknownLibrary)[]) {
		return holders.sort((a, b) => {
			if (!a.name && b.name) return 1;
			if (!b.name && a.name) return -1;
			return a.name.localeCompare(b.name, page.data.locale);
		});
	}

	const tabsByType: Tab[] | null = $derived.by(() => {
		if (getSelectionKind(holdingParam) === 'instance') return null;

		const typeKeys = Object.keys(byType);
		if (typeKeys.length <= 1) return null;

		const tabs: Tab[] = typeKeys.map((type) => {
			const instanceIds = getVisibleInstanceIds(type);
			const holders = sortHolders(getLibrariesWithInstances(instanceIds));

			return {
				id: `holdings-type-${type}`,
				label: page.data.t(`holdings.${type}`),
				content: holdingPanel,
				active: type === holdingParam,
				contentData: holders
			};
		});

		// Add 'all' tab
		tabs.unshift({
			id: 'holdings-type-all',
			label: page.data.t('holdings.allFormats'),
			content: holdingPanel,
			active: getSelectionKind(holdingParam) === 'work',
			contentData: sortHolders(getLibrariesWithInstances(getVisibleInstanceIds()))
		});

		return tabs;
	});
</script>

{#snippet holdingPanel(holders: (LibraryWithLinksAndInstances | UnknownLibrary)[])}
	<div class="flex flex-col gap-2">
		<HoldingsPanel {holders} bind:searchPhrase />
	</div>
{/snippet}

<div class="flex flex-col gap-2 text-sm">
	{@render card?.()}

	{#if tabsByType}
		<TabList ariaLabel={page.data.t('resource.editions')} tabs={tabsByType} />
	{:else}
		<!-- no tabs view -->
		{@const instanceIds = getVisibleInstanceIds(holdingParam)}
		{@const holders = sortHolders(getLibrariesWithInstances(instanceIds))}
		{@render holdingPanel(holders)}
	{/if}
</div>
