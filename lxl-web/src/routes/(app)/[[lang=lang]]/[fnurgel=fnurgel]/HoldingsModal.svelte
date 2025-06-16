<script lang="ts">
	import type {
		DecoratedHolder,
		HoldersByType,
		HoldingsByInstanceId,
		ItemLinksByBibId
	} from '$lib/types/holdings';
	import isFnurgel from '$lib/utils/isFnurgel';
	import Holdings from './Holdings.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import BiSearch from '~icons/bi/search';
	import BiHouseHeart from '~icons/bi/house-heart';
	import { getUserSettings } from '$lib/contexts/userSettings';

	// Props we need to pass:
	// holdingsByInstanceId = getHoldingsByInstanceId(mainEntity, displayUtil, locale);

	// Title/ heading, overview
	// can all be derived from mainEntity
	// but still should be calculated on the server?

	// data.instances does not have to be sorted in this context
	// although getSortedInstances is called in +page.server.ts

	type HoldingsModalProps = {
		holdingsByInstanceId: HoldingsByInstanceId;
		itemLinksByBibId: ItemLinksByBibId;
		instances: Record<string, unknown>[];
		title: string;
		overview: unknown;
		holdersByType?: HoldersByType;
	};

	const {
		holdingsByInstanceId,
		itemLinksByBibId,
		instances,
		title,
		overview,
		holdersByType
	}: HoldingsModalProps = $props();

	const userSettings = getUserSettings();
	const ASIDE_SEARCH_CARD_MAX_HEIGHT = 140;
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
			? instances?.find((instanceItem) => instanceItem['@id'].includes(selectedHolding)) || overview
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

	//TODO: duplicated
	const localizedInstanceTypes = $derived(
		Object.values(instances).reduce((acc, instanceItem) => {
			if (instanceItem['@type'] && instanceItem?._label) {
				return {
					...acc,
					[instanceItem['@type'] as string]: instanceItem._label
				};
			}
			return acc;
		}, {})
	);

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

	$effect(() => {
		if (holdingUrl) {
			selectedHolding = isFnurgel(holdingUrl) ? holdingUrl : (overview as string);
			latestHoldingUrl = holdingUrl;
		}
	});

	$effect(() => {
		if (latestHoldingUrl) {
			if (isFnurgel(latestHoldingUrl) && selectedHolding && holdingsByInstanceId[selectedHolding]) {
				// show holdings for an instance
				displayedHolders = holdingsByInstanceId[selectedHolding].map((holding) => holding.heldBy);
			} else if (holdersByType?.[latestHoldingUrl]) {
				// show holdings by type
				displayedHolders = holdersByType[latestHoldingUrl];
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
								data={title}
								block
								keyed={false}
								allowPopovers={false}
								allowLinks={false}
							/>
						</span>
						{#if selectedHolding && instances?.length !== 1}
							<span> · </span>
							{#if isFnurgel(selectedHolding)}
								{selectedHoldingInstance['_label']}
							{:else if localizedInstanceTypes?.[latestHoldingUrl]}
								{localizedInstanceTypes[latestHoldingUrl]}
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
					{#if latestHoldingUrl && isFnurgel(latestHoldingUrl)}
						{holdingsByInstanceId[latestHoldingUrl].length}
						{holdingsByInstanceId[latestHoldingUrl].length === 1
							? page.data.t('holdings.library')
							: page.data.t('holdings.libraries')}
					{:else if latestHoldingUrl && holdersByType?.[latestHoldingUrl]}
						{holdersByType[latestHoldingUrl].length}
						{holdersByType[latestHoldingUrl].length === 1
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
							{#each myLibsHolders as holder, i (holder.sigel || i)}
								<Holdings {holder} {holdingUrl} linksByBibId={itemLinksByBibId} />
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
					{#each filteredHolders as holder, i (holder.sigel || i)}
						<Holdings {holder} {holdingUrl} linksByBibId={itemLinksByBibId} />
					{/each}
					{#if filteredHolders.length === 0}
						<li class="m-3">
							<span role="alert">{page.data.t('search.noResults')}</span>
						</li>
					{/if}
				</ul>
			</div>
		</div>
	</Modal>
{/if}
