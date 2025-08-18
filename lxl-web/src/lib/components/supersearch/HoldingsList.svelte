<script lang="ts">
	import type {
		BibIdObj,
		DecoratedHolder,
		HoldersByType,
		HoldingsByInstanceId,
		ItemLinksByBibId
	} from '$lib/types/holdings';
	import isFnurgel from '$lib/utils/isFnurgel';
	import Holdings from '../../../routes/(app)/[[lang=lang]]/[fnurgel=fnurgel]/Holdings.svelte';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { page } from '$app/state';
	import BiSearch from '~icons/bi/search';
	import BiHouseHeart from '~icons/bi/house-heart';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import Spinner from '$lib/components/Spinner.svelte';

	type HoldingsModalData = {
		holdingsByInstanceId: HoldingsByInstanceId;
		itemLinksByBibId: ItemLinksByBibId;
		instances: unknown;
		title: unknown;
		overview: unknown;
		holdersByType?: HoldersByType;
		bibIdsByInstanceId: Record<string, BibIdObj>;
	};

	type HoldingsModalProps = {
		holdings: Promise<HoldingsModalData>;
	};

	let { holdings }: HoldingsModalProps = $props();

	let _holdings = $derived(await holdings);

	const ASIDE_SEARCH_CARD_MAX_HEIGHT = 140;
	const userSettings = getUserSettings();

	// let data: HoldingsModalProps | undefined = $state();
	// let previousURL: URL;

	// we should preferably only rely on $page.url.searchParams.get('holdings') but a workaround is needed due to a SvelteKit bug causing $page.url not to be updated after pushState. See: https://github.com/sveltejs/kit/pull/11994
	const holdingUrl = $derived(page.state.holdings || page.url.searchParams.get('holdings') || null);

	// working
	const selectedHolding = $derived(
		isFnurgel(holdingUrl || '') ? holdingUrl : (_holdings?.overview as string)
	);

	const latestHoldingUrl = $derived(holdingUrl ? holdingUrl : undefined);

	// not working with promise
	// NEED
	let displayedHolders: DecoratedHolder[] = $derived.by(() => {
		if (
			latestHoldingUrl &&
			isFnurgel(latestHoldingUrl) &&
			selectedHolding &&
			_holdings?.holdingsByInstanceId?.[selectedHolding]
		) {
			// show holdings for an instance
			return _holdings?.holdingsByInstanceId[selectedHolding].map((holding) => holding.heldBy);
		} else if (latestHoldingUrl && _holdings?.holdersByType?.[latestHoldingUrl]) {
			// show holdings by type
			return _holdings?.holdersByType[latestHoldingUrl];
			// } else if (isFnurgel(latestHoldingUrl) && _holdings?.holdersByType) { ????
		} else if (_holdings?.holdersByType) {
			// show all (associated with a work)
			return [
				...new Map(
					Object.values(_holdings.holdersByType)
						.flat()
						.map((holder) => [holder.sigel, holder])
				).values()
			];
		} else {
			console.log('show nothing', _holdings, latestHoldingUrl);
			return [];
		}
	});

	// async function getDisplayedHolders(h: HoldingsModalData){
	//   // let _h = await h;
	//   let _h = h
	//   if (
	//       latestHoldingUrl &&
	// 			isFnurgel(latestHoldingUrl) &&
	// 			selectedHolding &&
	// 			_h?.holdingsByInstanceId?.[selectedHolding]
	// 		) {
	// 			// show holdings for an instance
	// 			return _h?.holdingsByInstanceId[selectedHolding].map(
	// 				(holding) => holding.heldBy
	// 			);
	// 		} else if (latestHoldingUrl && _h?.holdersByType?.[latestHoldingUrl]) {
	// 			// show holdings by type
	// 			return _h?.holdersByType[latestHoldingUrl];
	// 		} else if (_h?.holdersByType) {
	//       console.log('show all')
	// 			// show all (associated with a work)
	// 			return [
	// 				...new Map(
	// 					Object.values(_h.holdersByType)
	// 						.flat()
	// 						.map((holder) => [holder.sigel, holder])
	// 				).values()
	// 			];
	// 		} else {
	//       console.log('show nothing', latestHoldingUrl, isFnurgel(latestHoldingUrl), _h?.holdersByType)
	//       return [];
	//     }
	// }

	// const displayedHolders: DecoratedHolder[] = $derived(await getDisplayedHolders(_holdings));

	// $inspect('displayedHolders', displayedHolders);

	let holdingsInstanceElement: HTMLElement | undefined = $state();
	let expandedHoldingsInstance = $state(false);
	let searchPhrase = $state('');

	/// working
	const selectedHoldingInstance = $derived(
		selectedHolding
			? _holdings?.instances?.find((instanceItem) =>
					instanceItem['@id'].includes(selectedHolding)
				) || _holdings?.overview
			: undefined
	);

	// afterNavigate(({ to }) => {
	// 	if (to) {
	// 		previousURL = to.url;
	// 	}
	// });

	const expandableHoldingsInstance = $derived(
		holdingsInstanceElement?.scrollHeight > ASIDE_SEARCH_CARD_MAX_HEIGHT
	);

	//TODO: duplicated + not working, is this really needed? Used in the "holding instance summary".
	// const localizedInstanceTypes = $derived(
	// 	Object.values(data?.instances).reduce((acc, instanceItem) => {
	// 		if (instanceItem['@type'] && instanceItem?._label) {
	// 			return {
	// 				...acc,
	// 				[instanceItem['@type'] as string]: instanceItem._label
	// 			};
	// 		}
	// 		return acc;
	// 	}, {})
	// );

	// NEED
	const filteredHolders = $derived(
		displayedHolders
			.filter((holder) => {
				return holder.str?.toLowerCase().indexOf(searchPhrase.toLowerCase()) > -1;
			})
			.filter((h) => h.str)
	);

	// NEED
	const myLibsHolders = $derived(
		displayedHolders.filter((holder) => {
			if (userSettings.myLibraries) {
				return Object.values(userSettings.myLibraries).some((lib) => lib.sigel === holder.sigel);
			} else return false;
		})
	);

	// onMount(async () => {
	// 	getDataForWork();
	// });

	// $effect(() => {
	// 	getDataForWork();
	// });

	// function getDataForWork() {
	// 	if (workFnurgel) {
	// 		loading = true;
	// 		fetch(`/api/holdings/${workFnurgel}`).then((res) => {
	// 			res.json().then((d) => {
	// 				data = d;
	// 				loading = false;
	// 			});
	// 		});
	// 	}
	// }

	// $effect(() => {
	// 	if (holdingUrl) {
	// 		selectedHolding = isFnurgel(holdingUrl) ? holdingUrl : (holdings?.overview as string);
	// 		latestHoldingUrl = holdingUrl;
	// 	}
	// });

	// $effect(() => {
	// if (latestHoldingUrl) {
	// 	if (
	// 		isFnurgel(latestHoldingUrl) &&
	// 		selectedHolding &&
	// 		holdings?.holdingsByInstanceId?.[selectedHolding]
	// 	) {
	// 		// show holdings for an instance
	// 		displayedHolders = holdings?.holdingsByInstanceId[selectedHolding].map(
	// 			(holding) => holding.heldBy
	// 		);
	// 	} else if (holdings?.holdersByType?.[latestHoldingUrl]) {
	// 		// show holdings by type
	// 		displayedHolders = holdings?.holdersByType[latestHoldingUrl];
	// 	} else if (isFnurgel(latestHoldingUrl) && holdings?.holdersByType) {
	//     console.log('show all')
	// 		// show all (associated with a work)
	// 		displayedHolders = [
	// 			...new Map(
	// 				Object.values(holdings.holdersByType)
	// 					.flat()
	// 					.map((holder) => [holder.sigel, holder])
	// 			).values()
	// 		];
	// 	} else {
	//     console.log('show nothing', holdings.holdersByType, latestHoldingUrl)
	//   }
	// }
	// });
</script>

{#await holdings}
	<div class="flex h-screen items-center justify-center">
		<span class="size-6">
			<Spinner />
		</span>
	</div>
{:then data}
	{console.log('DATA', data)}
	<!-- {holdings = data} -->
	<div class="flex flex-col px-4 py-2 text-sm">
		<div
			class="bg-page border-b-neutral relative mb-4 flex w-full flex-col gap-x-4 rounded-md border-b p-5 text-xs transition-shadow"
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
							data={data?.title}
							block
							keyed={false}
							allowPopovers={false}
							allowLinks={false}
						/>
					</span>
					{#if selectedHolding && data?.instances?.length !== 1}
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
		<div>
			<h2 class="font-medium">
				{page.data.t('holdings.availableAt')}
				{#if latestHoldingUrl && isFnurgel(latestHoldingUrl) && data?.holdingsByInstanceId[latestHoldingUrl]}
					{data?.holdingsByInstanceId[latestHoldingUrl].length}
					{data?.holdingsByInstanceId[latestHoldingUrl].length === 1
						? page.data.t('holdings.library')
						: page.data.t('holdings.libraries')}
				{:else if latestHoldingUrl && data?.holdersByType?.[latestHoldingUrl]}
					{data?.holdersByType[latestHoldingUrl].length}
					{data?.holdersByType[latestHoldingUrl].length === 1
						? page.data.t('holdings.library')
						: page.data.t('holdings.libraries')}
				{/if}
			</h2>
			<!-- my libraries holdings -->
			{#if myLibsHolders.length}
				<div class="border-neutral bg-accent-50 my-4 rounded-sm border-b p-4 pb-0">
					<h3 class="flex items-center gap-2">
						<span aria-hidden="true" class="text-primary-700 text-base">
							<BiHouseHeart />
						</span>
						<span class="font-medium">{page.data.t('myPages.favouriteLibraries')}</span>
					</h3>
					<ul class="w-full">
						{#each myLibsHolders as holder, i (i)}
							<Holdings
								{holder}
								{holdingUrl}
								linksByBibId={data?.itemLinksByBibId}
								bibIdsByInstanceId={data?.bibIdsByInstanceId}
							/>
						{/each}
					</ul>
				</div>
			{/if}
			<div class="relative mt-2 mb-4">
				<input
					bind:value={searchPhrase}
					placeholder={page.data.t('holdings.findLibrary')}
					aria-label={page.data.t('holdings.findLibrary')}
					class="bg-input h-9 w-full rounded-sm border border-neutral-300 pr-2 pl-8 text-xs"
					type="search"
				/>
				<BiSearch class="text-subtle absolute top-0 left-2.5 h-9" />
			</div>
			<ul class="w-full">
				{#each filteredHolders as holder, i (i)}
					<Holdings
						{holder}
						{holdingUrl}
						linksByBibId={data?.itemLinksByBibId}
						bibIdsByInstanceId={data?.bibIdsByInstanceId}
					/>
				{/each}
				{#if filteredHolders.length === 0}
					<li class="m-3">
						<span role="alert">{page.data.t('search.noResults')}</span>
					</li>
				{/if}
			</ul>
		</div>
	</div>
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
