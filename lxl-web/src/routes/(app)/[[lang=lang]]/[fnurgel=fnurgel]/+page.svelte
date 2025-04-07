<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import type { DecoratedHolder } from '$lib/types/holdings';
	import { type ResourceData } from '$lib/types/resourceData';
	import { Width } from '$lib/types/auxd';
	import { getUserSettings } from '$lib/contexts/userSettings';

	import getPageTitle from '$lib/utils/getPageTitle';
	import isFnurgel from '$lib/utils/isFnurgel';
	import { getHoldingsLink, getMyLibsFromHoldings, handleClickHoldings } from '$lib/utils/holdings';
	import { relativizeUrl } from '$lib/utils/http';
	import { getResourceId } from '$lib/utils/resourceData';

	import InstancesList from './InstancesList.svelte';
	import HoldingStatus from './HoldingStatus.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import ResourceImage from '$lib/components/ResourceImage.svelte';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import SearchResult from '$lib/components/find/SearchResult.svelte';
	import MyLibrariesIndicator from '$lib/components/MyLibsHoldingIndicator.svelte';
	import BiSearch from '~icons/bi/search';
	import BiHouseHeart from '~icons/bi/house-heart';

	const { data } = $props();
	const userSettings = getUserSettings();
	const ASIDE_SEARCH_CARD_MAX_HEIGHT = 140;

	let selectedHolding: string | undefined = $state();
	let latestHoldingUrl: string | undefined = $state();
	let holdingsInstanceElement: HTMLElement | undefined = $state();
	let expandedHoldingsInstance = $state(false);
	let previousURL: URL;
	let searchPhrase = $state('');
	let displayedHolders: DecoratedHolder[] = $state([]);

	const selectedHoldingInstance = $derived(
		selectedHolding
			? data.instances?.find((instanceItem) => instanceItem['@id'].includes(selectedHolding)) ||
					data.overview
			: undefined
	);

	const localizedInstanceTypes = $derived(
		Object.values(data.instances).reduce((acc, instanceItem) => {
			if (instanceItem['@type'] && instanceItem?._label) {
				return {
					...acc,
					[instanceItem['@type'] as string]: instanceItem._label
				};
			}
			return acc;
		}, {})
	);

	// we should preferably only rely on $page.url.searchParams.get('holdings') but a workaround is needed due to a SvelteKit bug causing $page.url not to be updated after pushState. See: https://github.com/sveltejs/kit/pull/11994
	const holdingUrl = $derived(page.state.holdings || page.url.searchParams.get('holdings') || null);

	const shouldShowHeaderBackground = $derived(!data.instances?.length);
	const expandableHoldingsInstance = $derived(
		holdingsInstanceElement?.scrollHeight > ASIDE_SEARCH_CARD_MAX_HEIGHT
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
			selectedHolding = isFnurgel(holdingUrl) ? holdingUrl : (data.overview as string);
			latestHoldingUrl = holdingUrl;
		}
	});

	$effect(() => {
		if (latestHoldingUrl) {
			if (
				isFnurgel(latestHoldingUrl) &&
				selectedHolding &&
				data.holdingsByInstanceId[selectedHolding]
			) {
				// show holdings for an instance
				displayedHolders = data.holdingsByInstanceId[selectedHolding].map(
					(holding) => holding.heldBy
				);
			} else if (data.holdersByType?.[latestHoldingUrl]) {
				// show holdings by type
				displayedHolders = data.holdersByType[latestHoldingUrl];
			}
		}
	});

	afterNavigate(({ to }) => {
		if (to) {
			previousURL = to.url;
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

<svelte:head>
	<title>{getPageTitle(data.title)}</title>
</svelte:head>
<article>
	<div class="resource find-layout page-padding gap-8" class:bg-header={shouldShowHeaderBackground}>
		<div
			class="image mt-4 mb-2 flex w-full justify-center self-center object-center md:mx-auto md:self-start md:px-2 xl:px-0"
			class:hidden={!page.data.images?.length}
		>
			{#if data.images.length}
				<ResourceImage
					images={data.images}
					alt={data.t('general.latestInstanceCover')}
					thumbnailTargetWidth={Width.MEDIUM}
					linkToFull
					geometry={data.type === 'Person' ? 'circle' : 'rectangle'}
				/>
			{/if}
		</div>
		<div
			class="content max-w-content flex flex-col gap-4 pt-2 md:flex-row"
			class:pb-4={shouldShowHeaderBackground}
		>
			<div class="flex flex-col gap-4">
				<header>
					<h1 class="text-6-cond-extrabold">
						<DecoratedData data={data.heading} showLabels={ShowLabelsOptions.Never} />
					</h1>
				</header>
				<div class="flex flex-col-reverse gap-4 md:flex-row">
					<div class="overview flex-1 gap-6">
						<DecoratedData data={data.overview} block />
						{#if Object.keys(data.holdersByType).length}
							<div class="flex items-center">
								<ul class="flex w-fit flex-wrap gap-2">
									{#each Object.keys(data.holdersByType) as type (type)}
										<li>
											<a
												href={getHoldingsLink(page.url, type)}
												class="button-ghost"
												data-sveltekit-preload-data="false"
												data-testid="holding-link"
												onclick={(event) => handleClickHoldings(event, page.state, type)}
											>
												{#if Object.keys(data.holdersByType).length == 1}
													{data.t('holdings.availableAt')}
													{data.holdersByType[type].length}
													{data.t('holdings.libraries')}
												{:else}
													{localizedInstanceTypes[type]}
													{`(${data.t('holdings.availableAt').toLowerCase()}`}
													{data.holdersByType[type].length}
													{`${data.t('holdings.libraries')})`}
												{/if}
											</a>
										</li>
									{/each}
								</ul>
								{#if data.instances.length === 1}
									{@const id = relativizeUrl(getResourceId(data.instances[0] as ResourceData))}
									{#if id}
										{@const favWithHolding = getMyLibsFromHoldings(
											userSettings.myLibraries,
											page.data.holdingsByInstanceId[id]
										)}
										{#if favWithHolding.length}
											<MyLibrariesIndicator libraries={favWithHolding} />
										{/if}
									{/if}
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
	{#if data.instances?.length}
		<div class="instances find-layout page-padding pt-2!">
			<div class="instances-list max-w-content border-t-primary/16 border-t pt-6">
				<InstancesList
					data={data.instances}
					columns={[
						{ header: data.t('search.publicationYear'), data: '*[].publication[].*[][?year].year' },
						{ header: data.t('search.publisher'), data: '*[].publication.*[][?agent].agent' },
						{ header: data.t('search.type'), data: '_label' }
					]}
				/>
			</div>
		</div>
	{/if}
	{#if holdingUrl && selectedHoldingInstance}
		<Modal close={handleCloseHoldings}>
			<span slot="title">{data.t('holdings.findAtYourNearestLibrary')}</span>
			<div class="flex flex-col">
				<div
					class="border-b-primary/16 bg-cards relative mb-4 flex w-full flex-col gap-x-4 rounded-md border-b p-5 text-sm transition-shadow"
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
							<span class="font-bold">
								<DecoratedData
									data={data.title}
									block
									keyed={false}
									allowPopovers={false}
									allowLinks={false}
								/>
							</span>
							{#if selectedHolding && data.instances?.length !== 1}
								<span> • </span>
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
						class="mt-2 text-left underline"
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
					<h2 class="text-3-cond-bold">
						{data.t('holdings.availableAt')}
						{#if latestHoldingUrl && isFnurgel(latestHoldingUrl)}
							{data.holdingsByInstanceId[latestHoldingUrl].length}
							{data.holdingsByInstanceId[latestHoldingUrl].length === 1
								? data.t('holdings.library')
								: data.t('holdings.libraries')}
						{:else if latestHoldingUrl && data.holdersByType?.[latestHoldingUrl]}
							{data.holdersByType[latestHoldingUrl].length}
							{data.holdersByType[latestHoldingUrl].length === 1
								? data.t('holdings.library')
								: data.t('holdings.libraries')}
						{/if}
					</h2>
					<!-- my libraries holdings -->
					{#if myLibsHolders.length}
						<div class="my-4 rounded-sm border-b border-accent-light bg-positive/32 p-4 pb-0">
							<h3 class="flex items-center gap-2 text-3-cond-bold">
								<span aria-hidden="true" class="text-positive">
									<BiHouseHeart />
								</span>
								<span>{page.data.t('myPages.favouriteLibraries')}</span>
							</h3>
							<ul class="w-full text-sm">
								{#each myLibsHolders as holder, i (holder.sigel || i)}
									<HoldingStatus {holder} {holdingUrl} />
								{/each}
							</ul>
						</div>
					{/if}
					<div class="relative mt-2 mb-4">
						<input
							bind:value={searchPhrase}
							placeholder={page.data.t('holdings.findLibrary')}
							aria-label={page.data.t('holdings.findLibrary')}
							class="w-full pl-8"
							type="search"
						/>
						<BiSearch class="text-icon absolute top-3 left-2.5 text-sm" />
					</div>
					<ul class="w-full text-sm">
						{#each filteredHolders as holder, i (holder.sigel || i)}
							<HoldingStatus {holder} {holdingUrl} />
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
</article>
<SearchResult searchResult={page.data.searchResult} showMapping />

<style>
	.resource {
		grid-template-areas: 'image content';
	}
	.image {
		grid-area: image;
	}
	.content {
		grid-area: content;
	}

	.instances {
		grid-template-areas: '. instances-list';
	}

	.instances-list {
		grid-area: instances-list;
	}

	.overview {
		display: grid;

		& :global(small) {
			display: block;
			&::first-letter {
				text-transform: capitalize;
			}
		}
		& :global(div[data-property]:not(:last-child)) {
			margin-bottom: 0.8rem;
		}

		& :global([data-property='contribution'] > ._contentBefore),
		:global([data-property='contribution'] > ._contentAfter) {
			display: none;
		}

		& :global([data-property='contribution'] > *) {
			display: block;
			white-space: nowrap;
		}

		& :global([data-property='seeAlso'] > *) {
			display: block;
			white-space: nowrap;
		}
	}

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
			--alpha(var(--color-cards) / 0%),
			--alpha(var(--color-cards) / 100%)
		);
		overflow: hidden;
	}

	.expanded {
		max-height: initial;
	}

	:global([data-property='_script']) {
		font-style: italic;
		display: block;
	}
</style>
