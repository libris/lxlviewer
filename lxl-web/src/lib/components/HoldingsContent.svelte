<script lang="ts">
	import { page } from '$app/state';
	import isFnurgel from '$lib/utils/isFnurgel';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import type { DecoratedHolder, HoldingsData } from '$lib/types/holdings';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import Holdings from '$lib/components/Holdings.svelte';
	import BiSearch from '~icons/bi/search';
	import BiHouseHeart from '~icons/bi/house-heart';

	type Props = { holdings: Promise<HoldingsData> | HoldingsData; showSummary?: boolean };

	let { holdings, showSummary = true }: Props = $props();

	const ASIDE_SEARCH_CARD_MAX_HEIGHT = 140;
	const userSettings = getUserSettings();

	let holdingsInstanceElement: HTMLElement | undefined = $state();
	let expandedHoldingsInstance = $state(false);
	let searchPhrase = $state('');

	// we should preferably only rely on $page.url.searchParams.get('holdings') but a workaround is needed due to a SvelteKit bug causing $page.url not to be updated after pushState. See: https://github.com/sveltejs/kit/pull/11994
	const holdingUrl = $derived(page.state.holdings || page.url.searchParams.get('holdings'));
	const latestHoldingUrl = $derived(holdingUrl ? holdingUrl : undefined);

	const expandableHoldingsInstance = $derived(
		holdingsInstanceElement?.scrollHeight &&
			holdingsInstanceElement?.scrollHeight > ASIDE_SEARCH_CARD_MAX_HEIGHT
	);

	function getSelectedHolding(holdings: HoldingsData) {
		return isFnurgel(holdingUrl || '') ? holdingUrl : (holdings?.overview as string);
	}

	function getDisplayedHolders(
		holdings: HoldingsData,
		selectedHolding: string | null
	): DecoratedHolder[] {
		if (
			latestHoldingUrl &&
			isFnurgel(latestHoldingUrl) &&
			selectedHolding &&
			holdings?.holdingsByInstanceId?.[selectedHolding]
		) {
			// show holdings for an instance
			return holdings?.holdingsByInstanceId[selectedHolding].map((holding) => holding.heldBy);
		} else if (latestHoldingUrl && holdings?.holdersByType?.[latestHoldingUrl]) {
			// show holdings by type
			return holdings?.holdersByType[latestHoldingUrl];
			// } else if (isFnurgel(latestHoldingUrl) && _holdings?.holdersByType) { ????
		} else if (holdings?.holdersByType) {
			// show all (associated with a work)
			return [
				...new Map(
					Object.values(holdings.holdersByType)
						.flat()
						.map((holder) => [holder.sigel, holder])
				).values()
			];
		} else {
			console.log('show nothing', holdings, latestHoldingUrl);
			return [];
		}
	}

	function getSelectedHoldingInstance(holdings: HoldingsData, selectedHolding: string | null) {
		return selectedHolding
			? holdings?.instances?.find((instanceItem) =>
					(instanceItem?.['@id'] as string).includes(selectedHolding)
				) || holdings?.overview
			: undefined;
	}

	function getFilteredHolders(displayedHolders: DecoratedHolder[]) {
		return displayedHolders
			.filter((holder) => {
				return holder.str?.toLowerCase().indexOf(searchPhrase.toLowerCase()) > -1;
			})
			.filter((h) => h.str);
	}

	function getMylibsHolders(displayedHolders: DecoratedHolder[]) {
		return displayedHolders.filter((holder) => {
			if (userSettings.myLibraries) {
				return Object.values(userSettings.myLibraries).some((lib) => lib.sigel === holder.sigel);
			} else return false;
		});
	}
</script>

{#await holdings}
	<div class="m-6 flex h-full items-center justify-center">
		<span class="size-6">
			<Spinner />
		</span>
	</div>
{:then holdings}
	{@const selectedHolding = getSelectedHolding(holdings)}
	{@const selectedHoldingInstance = getSelectedHoldingInstance(holdings, selectedHolding)}
	{@const displayedHolders = getDisplayedHolders(holdings, selectedHolding)}
	{@const filteredHolders = getFilteredHolders(displayedHolders)}
	{@const myLibsHolders = getMylibsHolders(displayedHolders)}

	<div class="flex flex-col">
		<!-- instance summary -->
		{#if showSummary}
			<div
				class="bg-page border-b-neutral relative flex w-full flex-col gap-x-4 rounded-md border-b p-5 text-xs transition-shadow"
			>
				<div
					id="instance-details"
					class="overview relative"
					class:expandable={expandableHoldingsInstance}
					class:expanded={expandedHoldingsInstance}
					style="--max-height:{ASIDE_SEARCH_CARD_MAX_HEIGHT}px"
					bind:this={holdingsInstanceElement}
				>
					<h2 class="mb-2">
						<span class="font-medium">
							<DecoratedData
								data={holdings?.title}
								block
								keyed={false}
								allowPopovers={false}
								allowLinks={false}
							/>
						</span>
						{#if selectedHolding && holdings?.instances?.length !== 1}
							<span> · </span>
							{#if isFnurgel(selectedHolding)}
								{selectedHoldingInstance?.['_label']}
								<!--{:else if localizedInstanceTypes?.[latestHoldingUrl]}-->
								<!--	{localizedInstanceTypes[latestHoldingUrl]}-->
							{/if}
						{/if}
					</h2>
					<DecoratedData
						data={selectedHoldingInstance}
						block
						keyed={false}
						allowPopovers={false}
						allowLinks={false}
					/>
				</div>
				<button
					class="link-subtle mt-2 text-left"
					onclick={() => (expandedHoldingsInstance = !expandedHoldingsInstance)}
					aria-expanded={expandedHoldingsInstance}
					aria-controls="instance-details"
				>
					{expandedHoldingsInstance
						? page.data.t('search.hideDetails')
						: page.data.t('search.showDetails')}</button
				>
			</div>
		{/if}
		<h2 class="my-4 text-xs font-medium">
			{page.data.t('holdings.availableAt')}
			{#if latestHoldingUrl && isFnurgel(latestHoldingUrl) && holdings?.holdingsByInstanceId[latestHoldingUrl]}
				{holdings?.holdingsByInstanceId[latestHoldingUrl].length}
				{holdings?.holdingsByInstanceId[latestHoldingUrl].length === 1
					? page.data.t('holdings.library')
					: page.data.t('holdings.libraries')}
			{:else if latestHoldingUrl && holdings?.holdersByType?.[latestHoldingUrl]}
				{holdings?.holdersByType[latestHoldingUrl].length}
				{holdings?.holdersByType[latestHoldingUrl].length === 1
					? page.data.t('holdings.library')
					: page.data.t('holdings.libraries')}
			{/if}
		</h2>
		<!-- my libraries holdings -->
		{#if myLibsHolders.length}
			<div class="border-neutral bg-accent-50 mb-4 rounded-sm border-b p-4 pb-0">
				<h3 class="flex items-center gap-2">
					<span aria-hidden="true" class="text-primary-700 text-base">
						<BiHouseHeart />
					</span>
					<span class="text-sm font-medium">{page.data.t('myPages.favouriteLibraries')}</span>
				</h3>
				<ul class="w-full">
					{#each myLibsHolders as holder, i (i)}
						<Holdings
							{holder}
							{holdingUrl}
							linksByBibId={holdings?.itemLinksByBibId}
							bibIdsByInstanceId={holdings?.bibIdsByInstanceId}
						/>
					{/each}
				</ul>
			</div>
		{/if}
		<!-- search -->
		<div class="relative">
			<input
				bind:value={searchPhrase}
				placeholder={page.data.t('holdings.findLibrary')}
				aria-label={page.data.t('holdings.findLibrary')}
				class="bg-input h-9 w-full rounded-sm border border-neutral-300 pr-2 pl-8 text-xs"
				type="search"
			/>
			<BiSearch class="text-subtle absolute top-0 left-2.5 h-9 text-sm" />
		</div>
		<!-- list -->
		<ul class="w-full">
			{#each filteredHolders as holder, i (i)}
				<Holdings
					{holder}
					{holdingUrl}
					linksByBibId={holdings?.itemLinksByBibId}
					bibIdsByInstanceId={holdings?.bibIdsByInstanceId}
				/>
			{/each}
			{#if filteredHolders.length === 0}
				<li class="m-3 text-sm">
					<span role="alert">{page.data.t('search.noResults')}</span>
				</li>
			{/if}
		</ul>
	</div>
{:catch err}
	<p>{err}</p>
{/await}

<style>
	.expandable {
		max-height: var(--max-height);
		overflow: hidden;
	}

	.expandable:not(.expanded)::after {
		height: 3rem;
		width: 100%;
		position: absolute;
		content: '';
		bottom: 0;
		left: 0;
		pointer-events: none;
		background: linear-gradient(
			to bottom,
			--alpha(var(--color-page) / 0%),
			--alpha(var(--color-page) / 100%)
		);
		overflow: hidden;
	}

	.expanded {
		max-height: initial;
	}

	#instance-details {
		& :global(.contribution-role),
		& :global(.property-label) {
			font-size: var(--text-2xs);
		}
	}
</style>
