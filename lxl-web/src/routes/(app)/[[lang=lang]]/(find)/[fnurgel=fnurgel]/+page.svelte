<script lang="ts">
	import { page } from '$app/stores';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import InstancesList from './InstancesList.svelte';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import { getResourceId } from '$lib/utils/resourceData';
	import { relativizeUrl } from '$lib/utils/http';
	import Modal from '$lib/components/Modal.svelte';
	import ResourceImage from '$lib/components/ResourceImage.svelte';
	import { getHoldingsLink, handleClickHoldings } from './utils';

	export let data;

	$: selectedHolding = $page.state.holdings || $page.url.searchParams.get('holdings') || null; // we should preferably only rely on $page.url.searchParams.get('holdings') but a workaround is needed due to a SvelteKit bug causing $page.url not to be updated after pushState. See: https://github.com/sveltejs/kit/pull/11994
	$: selectedHoldingInstance = data.instances?.find((instanceItem) =>
		instanceItem['@id'].includes(selectedHolding)
	);

	$: instanceIdsByTypeLabel = data?.instances.reduce(
		(acc, currentInstance) => ({
			...acc,
			[currentInstance['_label']]: [
				...(acc[currentInstance['_label']] || []),
				relativizeUrl(getResourceId(currentInstance))
			]
		}),
		{}
	);

	function handleCloseHoldings() {
		history.back();
	}

	function getAggregatedLibrariesCount(instanceIds: string[], holdingsByInstanceId) {
		return instanceIds.reduce((acc, id) => {
			return [
				...new Set([
					...acc,
					...holdingsByInstanceId[id].map((holdingItem) => holdingItem?.heldBy?.['@id'])
				])
			];
		}, []).length;
	}
</script>

<article class="resource grid">
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
					{#each Object.entries(instanceIdsByTypeLabel) as [typeLabel, instanceIds]}
						<li>
							<a
								href={getHoldingsLink($page.url, instanceIds?.[0])}
								data-sveltekit-preload-data="false"
								on:click={(event) => handleClickHoldings(event, $page.state, instanceIds?.[0])}
							>
								{typeLabel}
								{`(${data.t('holdings.availableAt').toLowerCase()}`}
								{getAggregatedLibrariesCount(instanceIds, data.holdingsByInstanceId)}
								{`${data.t('holdings.libraries')})`}
							</a>
						</li>
					{/each}
				</ul>
			</div>
			{#if data.images.length}
				<div class="flex h-full max-h-72 w-full max-w-72 justify-center self-center md:self-start">
					<ResourceImage
						resource={data.instances.find((instanceItem) =>
							data.images.find((imageItem) => imageItem.recordId.includes(instanceItem['@id']))
						)}
						alt={data.t('general.latestInstanceCover')}
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
	{#if selectedHolding}
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
						<DecoratedData
							data={data.instances?.find((instanceItem) =>
								instanceItem['@id'].includes(selectedHolding)
							)}
							block
						/>
					</div>
				</div>
				<div>
					<h2 class="font-bold">{data.t('holdings.availableAt')}</h2>
					<table class="w-full table-auto border-collapse text-sm">
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
