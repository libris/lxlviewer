<script lang="ts">
	import type {
		BibIdObj,
		DecoratedHolder,
		HoldersByType,
		HoldingsByInstanceId,
		ItemLinksByBibId
	} from '$lib/types/holdings';
	import { onMount } from 'svelte';
	import isFnurgel from '$lib/utils/isFnurgel';
	import Holdings from './Holdings.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import BiSearch from '~icons/bi/search';
	import BiHouseHeart from '~icons/bi/house-heart';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import Spinner from '$lib/components/Spinner.svelte';

	type HoldingsModalProps = {
		holdingsByInstanceId: HoldingsByInstanceId;
		itemLinksByBibId: ItemLinksByBibId;
		instances: unknown;
		title: unknown;
		overview: unknown;
		holdersByType?: HoldersByType;
		bibIdsByInstanceId: Record<string, BibIdObj>;
	};

	type HoldingsModalParams = {
		workFnurgel: string;
	};

	const ASIDE_SEARCH_CARD_MAX_HEIGHT = 140;
	const userSettings = getUserSettings();

	const { workFnurgel }: HoldingsModalParams = $props();

	let loading = $state(false);
	let data: HoldingsModalProps | undefined = $state();
	let previousURL: URL;
	let displayedHolders: DecoratedHolder[] = $state([]);
	let selectedHolding: string | undefined = $state();
	let latestHoldingUrl: string | undefined = $state();
	let holdingsInstanceElement: HTMLElement | undefined = $state();
	let expandedHoldingsInstance = $state(false);
	let searchPhrase = $state('');

	// we should preferably only rely on $page.url.searchParams.get('holdings') but a workaround is needed due to a SvelteKit bug causing $page.url not to be updated after pushState. See: https://github.com/sveltejs/kit/pull/11994
	const holdingUrl = $derived(page.state.holdings || page.url.searchParams.get('holdings') || null);

	const selectedHoldingInstance = $derived(
		selectedHolding
			? data?.instances?.find((instanceItem) => instanceItem['@id'].includes(selectedHolding)) ||
					data?.overview
			: undefined
	);

	afterNavigate(({ to }) => {
		if (to) {
			previousURL = to.url;
		}
	});

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

	const filteredHolders = $derived(
		displayedHolders
			.filter((holder) => {
				return holder.str?.toLowerCase().indexOf(searchPhrase.toLowerCase()) > -1;
			})
			.filter((h) => h.str)
	);

	const myLibsHolders = $derived(
		displayedHolders.filter((holder) => {
			if (userSettings.myLibraries) {
				return Object.values(userSettings.myLibraries).some((lib) => lib.sigel === holder.sigel);
			} else return false;
		})
	);

	onMount(async () => {
		getDataForWork();
	});

	$effect(() => {
		getDataForWork();
	});

	function getDataForWork() {
		if (workFnurgel) {
			loading = true;
			console.log('Preparing data for work with ID:', workFnurgel);
			fetch(`/api/holdings/${workFnurgel}`).then((res) => {
				res.json().then((d) => {
					data = d;
					loading = false;
				});
			});
		}
	}

	$effect(() => {
		if (holdingUrl) {
			selectedHolding = isFnurgel(holdingUrl) ? holdingUrl : (data?.overview as string);
			latestHoldingUrl = holdingUrl;
		}
	});

	$effect(() => {
		if (latestHoldingUrl) {
			if (
				isFnurgel(latestHoldingUrl) &&
				selectedHolding &&
				data?.holdingsByInstanceId[selectedHolding]
			) {
				// show holdings for an instance
				displayedHolders = data?.holdingsByInstanceId[selectedHolding].map(
					(holding) => holding.heldBy
				);
			} else if (data?.holdersByType?.[latestHoldingUrl]) {
				// show holdings by type
				displayedHolders = data?.holdersByType[latestHoldingUrl];
			} else if (isFnurgel(latestHoldingUrl) && data?.holdersByType) {
				// show all (associated with a work)
				displayedHolders = [
					...new Map(
						Object.values(data.holdersByType)
							.flat()
							.map((holder) => [holder.sigel, holder])
					).values()
				];
			}
		}
	});

	function handleCloseHoldings() {
		if (!previousURL?.searchParams.has('holdings')) {
			history.back();
		} else {
			const newSearchParams = new URLSearchParams([...Array.from(page.url.searchParams.entries())]);
			newSearchParams.delete('holdings');
			goto(page.url.pathname + `?${newSearchParams.toString()}`, { replaceState: true });
		}
	}
</script>

{#if holdingUrl && selectedHoldingInstance}
	<Modal close={handleCloseHoldings}>
		<span slot="title">{page.data.t('holdings.findAtYourNearestLibrary')}</span>
		{#if loading}
			<div class="flex h-screen items-center justify-center">
				<span class="size-6">
					<Spinner />
				</span>
			</div>
		{:else}
			<div class="flex flex-col text-sm">
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
									{selectedHoldingInstance['_label']}
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
		{/if}
	</Modal>
{/if}

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
