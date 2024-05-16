<script lang="ts">
	import { page } from '$app/stores';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import InstancesList from './InstancesList.svelte';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import { getResourceId } from '$lib/utils/resourceData';
	import { relativizeUrl } from '$lib/utils/http';
	import getPageTitle from '$lib/utils/getPageTitle';
	import Modal from '$lib/components/Modal.svelte';
	import isFnurgel from '$lib/utils/isFnurgel';
	import ResourceImage from '$lib/components/ResourceImage.svelte';
	import { getHoldingsLink, handleClickHoldings } from './utils';
	import { getSelectedHolding } from './utils';
	import { Width } from '$lib/utils/auxd.types';

	export let data;

	let selectedHolding: string | undefined;
	let latestHoldingUrl: string | undefined;

	$: selectedHoldingInstance = data.instances?.find((instanceItem) =>
		instanceItem['@id'].includes(selectedHolding)
	);

	$: instanceIdsByType = data?.instances.reduce(
		(acc, currentInstance) => ({
			...acc,
			[currentInstance['@type']]: [
				...(acc[currentInstance['@type']] || []),
				relativizeUrl(getResourceId(currentInstance))
			]
		}),
		{}
	);

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
		selectedHolding = getSelectedHolding(holdingUrl, instanceIdsByType);
		latestHoldingUrl = holdingUrl;
	}

	function handleCloseHoldings() {
		history.back();
	}
</script>

<svelte:head>
	<title>{getPageTitle(data.title)}</title>
</svelte:head>
<article>
	<div class="gap-8 bg-header find-layout">
		<div
			class="mb-2 mt-4 flex h-full max-h-64 w-full max-w-64 justify-center self-center md:ml-auto md:flex md:self-start"
			class:hidden={!$page.data.images?.length}
		>
			{#if data.images.length}
				<ResourceImage
					images={data.images}
					alt={data.t('general.latestInstanceCover')}
					thumbnailTargetWidth={Width.MEDIUM}
					linkToFull
				/>
			{/if}
		</div>
		<div class="flex max-w-content flex-col gap-4 py-2 pb-4 md:flex-row">
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
							<ul class="flex w-fit gap-2">
								{#each Object.keys(data.holdersByType) as type}
									<li>
										<a
											href={getHoldingsLink($page.url, type)}
											class="ghost-btn"
											data-sveltekit-preload-data="false"
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
		<div class="instances mt-4 find-layout">
			<div class="instances-list max-w-content" class:md:col-start-1={data.instances?.length > 1}>
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
			<div class="flex flex-col gap-8 text-sm">
				<div class="flex gap-4">
					{#if data.images.length}
						<div class="flex h-full max-h-20 w-full max-w-24 self-start">
							<ResourceImage
								resource={selectedHoldingInstance}
								alt={data.t('general.latestInstanceCover')}
								linkToFull
							/>
						</div>
					{/if}
					<div class="overview">
						<DecoratedData data={selectedHoldingInstance} block />
					</div>
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
					<table class="w-full table-auto border-collapse text-sm">
						{#if isFnurgel(latestHoldingUrl)}
							{#if data.holdingsByInstanceId[selectedHolding]}
								{#each data.holdingsByInstanceId[selectedHolding] as holdingItem}
									<tr class="h-11 border-b-primary/16 [&:not(:last-child)]:border-b">
										<td>
											{holdingItem?.heldBy?.name}
										</td>
										<td class="text-right text-secondary">
											{holdingItem?.heldBy?.sigel ? `(${holdingItem?.heldBy?.sigel})` : ''}
										</td>
									</tr>
								{/each}
							{/if}
						{:else if data.holdersByType?.[latestHoldingUrl]}
							{#each data.holdersByType[latestHoldingUrl] as holderItem}
								<tr class="h-11 border-b-primary/16 [&:not(:last-child)]:border-b">
									<td>
										{holderItem?.name}
									</td>
									<td class="text-right text-secondary">
										{holderItem?.sigel ? `(${holderItem?.sigel})` : ''}
									</td>
								</tr>
							{/each}
						{/if}
					</table>
				</div>
			</div>
		</Modal>
	{/if}
</article>

<style lang="postcss">
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
</style>
