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

	$: showBackground = !$page.data.instances.length;

	function handleCloseHoldings() {
		history.back();
	}
</script>

<svelte:head>
	<title>{getPageTitle(data.title)}</title>
</svelte:head>
<article class="resource grid" class:bg-header={showBackground}>
	<div class="content p-4">
		<header>
			<h1 class="mb-6 text-6-cond-extrabold">
				<DecoratedData data={data.heading} showLabels={ShowLabelsOptions.Never} />
			</h1>
		</header>
		<div class="mb-4 flex flex-col-reverse gap-4 md:flex-row">
			<div class="overview flex-1">
				<DecoratedData data={data.overview} block />
				<ul>
					{#each Object.keys(data.holdersByType) as type}
						<li>
							<a
								href={getHoldingsLink($page.url, type)}
								data-sveltekit-preload-data="false"
								on:click={(event) => handleClickHoldings(event, $page.state, type)}
							>
								{localizedInstanceTypes[type]}
								{`(${data.t('holdings.availableAt').toLowerCase()}`}
								{data.holdersByType[type].length}
								{`${data.t('holdings.libraries')})`}
							</a>
						</li>
					{/each}
				</ul>
			</div>
			{#if data.images.length}
				<div class="flex h-full max-h-72 w-full max-w-72 justify-center self-center md:self-start">
					<ResourceImage
						images={data.images}
						alt={data.t('general.latestInstanceCover')}
						thumbnailTargetWidth={Width.MEDIUM}
						linkToFull
					/>
				</div>
			{/if}
		</div>
		{#if data.instances?.length}
			<InstancesList
				data={data.instances}
				columns={[
					'*[].publication[].*[][?year].year',
					'*[].publication.*[][?agent].agent',
					'_label'
				]}
			/>
		{/if}
	</div>
	{#if holdingUrl && selectedHoldingInstance}
		<Modal close={handleCloseHoldings}>
			<span slot="title">{data.t('holdings.findAtYourNearestLibrary')}</span>
			<div class="flex flex-col gap-4 px-4 text-sm">
				<div class="flex gap-4">
					{#if data.images.length}
						<div class="flex h-full max-h-20 w-full max-w-20 self-center md:self-start">
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
	.resource {
		@apply gap-4 p-4;
		display: grid;
		grid-template-areas: 'content';

		@media screen and (min-width: theme('screens.lg')) {
			grid-template-areas: '. content .';
			grid-template-columns: 320px 1fr 320px;
		}
	}

	.content {
		grid-area: content;
	}

	.overview {
		display: grid;
		gap: 2rem;

		& :global(small) {
			display: block;
			&::first-letter {
				text-transform: capitalize;
			}
		}
		& :global(div[data-property]) {
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
