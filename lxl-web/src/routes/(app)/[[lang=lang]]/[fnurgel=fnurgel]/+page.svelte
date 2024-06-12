<script lang="ts">
	import { page } from '$app/stores';
	import { afterNavigate, goto } from '$app/navigation';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import { Width } from '$lib/types/auxd';
	import getPageTitle from '$lib/utils/getPageTitle';
	import isFnurgel from '$lib/utils/isFnurgel';
	import { getHoldingsLink, handleClickHoldings } from '$lib/utils/holdings';

	import Modal from '$lib/components/Modal.svelte';
	import ResourceImage from '$lib/components/ResourceImage.svelte';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import SearchResult from '$lib/components/find/SearchResult.svelte';
	import InstancesList from './InstancesList.svelte';
	import HoldingStatus from './HoldingStatus.svelte';

	export let data;

	const ASIDE_SEARCH_CARD_MAX_HEIGHT = 140;

	let selectedHolding: string | undefined;
	let latestHoldingUrl: string | undefined;
	let holdingsInstanceElement: HTMLElement | null;
	let expandedHoldingsInstance = false;
	let previousURL: URL;

	$: selectedHoldingInstance = selectedHolding
		? data.instances?.find((instanceItem) => instanceItem['@id'].includes(selectedHolding)) ||
			data.overview
		: undefined;

	$: localizedInstanceTypes = Object.values(data.instances).reduce((acc, instanceItem) => {
		if (instanceItem['@type'] && instanceItem?._label) {
			return {
				...acc,
				[instanceItem['@type']]: instanceItem._label
			};
		}
		return acc;
	}, {});

	$: holdingUrl = $page.state.holdings || $page.url.searchParams.get('holdings') || null; // we should preferably only rely on $page.url.searchParams.get('holdings') but a workaround is needed due to a SvelteKit bug causing $page.url not to be updated after pushState. See: https://github.com/sveltejs/kit/pull/11994
	$: if (holdingUrl) {
		selectedHolding = isFnurgel(holdingUrl) ? holdingUrl : data.overview;
		latestHoldingUrl = holdingUrl;
	}

	$: shouldShowHeaderBackground = !data.instances?.length;

	$: expandableHoldingsInstance =
		holdingsInstanceElement?.scrollHeight > ASIDE_SEARCH_CARD_MAX_HEIGHT;

	afterNavigate(({ to }) => {
		if (to) {
			previousURL = to.url;
		}
	});

	function handleCloseHoldings() {
		if (!previousURL.searchParams.has('holdings')) {
			history.back();
		} else {
			const newSearchParams = new URLSearchParams([
				...Array.from($page.url.searchParams.entries())
			]);
			newSearchParams.delete('holdings');
			goto($page.url.pathname + `?${newSearchParams.toString()}`, { replaceState: true });
		}
	}
</script>

<svelte:head>
	<title>{getPageTitle(data.title)}</title>
</svelte:head>
<article>
	<div class="resource gap-8 find-layout page-padding" class:bg-header={shouldShowHeaderBackground}>
		<div
			class="mb-2 mt-4 flex justify-center self-center object-center md:mx-auto md:justify-start md:self-start md:px-2 xl:px-0"
			class:hidden={!$page.data.images?.length}
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
			class="content flex max-w-content flex-col gap-4 pt-2 md:flex-row"
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
							<ul class="flex w-fit flex-wrap gap-2">
								{#each Object.keys(data.holdersByType) as type}
									<li>
										<a
											href={getHoldingsLink($page.url, type)}
											class="button-ghost"
											data-sveltekit-preload-data="false"
											data-testid="holding-link"
											on:click={(event) => handleClickHoldings(event, $page.state, type)}
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
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
	{#if data.instances?.length}
		<div class="instances !pt-2 find-layout page-padding">
			<div class="instances-list max-w-content border-t border-t-primary/16 pt-6">
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
					class="relative mb-4 flex w-full flex-col gap-x-4 rounded-md border-b border-b-primary/16 bg-cards p-5 text-sm transition-shadow"
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
						on:click={() => (expandedHoldingsInstance = !expandedHoldingsInstance)}
						aria-expanded={expandedHoldingsInstance}
						aria-controls="instance-details"
					>
						{expandedHoldingsInstance
							? $page.data.t('search.hideDetails')
							: $page.data.t('search.showDetails')}</button
					>
				</div>
				<div>
					<h2 class="font-bold">
						{data.t('holdings.availableAt')}
						{#if isFnurgel(latestHoldingUrl)}
							{data.holdingsByInstanceId[latestHoldingUrl].length}
							{data.holdingsByInstanceId[latestHoldingUrl].length === 1
								? data.t('holdings.library')
								: data.t('holdings.libraries')}
						{:else if data.holdersByType?.[latestHoldingUrl]}
							{data.holdersByType[latestHoldingUrl].length}
							{data.holdersByType[latestHoldingUrl].length === 1
								? data.t('holdings.library')
								: data.t('holdings.libraries')}
						{/if}
					</h2>
					<ul class="w-full text-sm">
						{#if isFnurgel(latestHoldingUrl)}
							{#if data.holdingsByInstanceId[selectedHolding]}
								{#each data.holdingsByInstanceId[selectedHolding] as holdingItem}
									<li class="contents h-11 border-b-primary/16 [&:not(:last-child)]:border-b">
										<HoldingStatus data={holdingItem}>
											<details>
												<summary>
													{console.log(holdingItem)}
													<span>{holdingItem?.heldBy?.name}</span>
													<span class="text-right text-secondary">
														{holdingItem?.heldBy?.sigel ? `(${holdingItem?.heldBy?.sigel})` : ''}
													</span>
												</summary>
											</details>
										</HoldingStatus>
									</li>
								{/each}
							{/if}
						{:else if data.holdersByType?.[latestHoldingUrl]}
							{#each data.holdersByType[latestHoldingUrl] as holderItem}
								<li class="h-11 border-b-primary/16 [&:not(:last-child)]:border-b">
									<details>
										<summary>
											<span>{holderItem?.name}</span>
											<span class="text-right text-secondary"
												>{holderItem?.sigel ? `(${holderItem?.sigel})` : ''}</span
											>
										</summary>
										<!-- TODO -->
										<!-- <HoldingStatus data={holderItem} /> -->
									</details>
								</li>
							{/each}
						{/if}
					</ul>
				</div>
			</div>
		</Modal>
	{/if}
</article>
<SearchResult searchResult={$page.data.searchResult} />

<style lang="postcss">
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
		@apply pointer-events-none absolute h-12 w-full overflow-hidden;
		content: '';
		bottom: 0;
		left: 0;
		pointer-events: none;
		background: linear-gradient(to bottom, rgb(var(--bg-cards) / 0), rgb(var(--bg-cards) / 1));
		overflow: hidden;
	}

	.expanded {
		max-height: initial;
	}

	:global([data-property='_script']) {
		display: block;
	}
</style>
