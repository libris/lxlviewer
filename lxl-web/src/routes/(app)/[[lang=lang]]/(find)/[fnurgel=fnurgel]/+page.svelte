<script lang="ts">
	import { page } from '$app/stores';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { afterNavigate } from '$app/navigation';
	import InstancesList from './InstancesList.svelte';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import { getResourceId } from '$lib/utils/resourceData';
	import { relativizeUrl } from '$lib/utils/http';
	import Modal from '$lib/components/Modal.svelte';
	import type { SvelteComponent } from 'svelte';
	import ResourceImage from '$lib/components/ResourceImage.svelte';

	export let data;

	let holdingsModal: SvelteComponent;

	$: instancesByType = data?.instances.reduce((acc, currentInstance) => {
		const type = currentInstance['_label'];
		return {
			...acc,
			[type]: [...(acc[type] || []), relativizeUrl(getResourceId(currentInstance))]
		};
	}, {});

	$: decoratedInstance =
		$page.url.searchParams.has('holdings') &&
		data.instances.find((instanceItem) =>
			instanceItem['@id'].includes($page.url.searchParams.get('holdings'))
		);

	afterNavigate(({ from, to }) => {
		if (
			to?.url.searchParams.has('holdings') &&
			from?.url.searchParams.get('holdings') !== to.url.searchParams.get('holdings')
		) {
			holdingsModal.dialog.showModal();
		}
	});

	function handleCloseHoldings(event: Event) {
		event.preventDefault();
		history.back();
	}

	function getAggregatedLibrariesCount(instances: string[], holdingsByInstanceId) {
		return instances.reduce((acc, instanceId) => {
			return [
				...new Set([
					...acc,
					...holdingsByInstanceId[instanceId].map((holdingItem) => holdingItem?.heldBy?.['@id'])
				])
			];
		}, []).length;
	}

	function getHoldingsLink(url: URL, id: string) {
		const newSearchParams = new URLSearchParams([...Array.from(url.searchParams.entries())]);
		newSearchParams.set('holdings', id);
		return `${url.origin}${url.pathname}?${newSearchParams.toString()}`;
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
					{#each Object.keys(instancesByType) as instanceType}
						<li>
							<a href={getHoldingsLink($page.url, instancesByType[instanceType]?.[0])}>
								{instanceType}
								{`(${data.t('holdings.availableAt').toLowerCase()}`}
								{getAggregatedLibrariesCount(
									instancesByType[instanceType],
									data.holdingsByInstanceId
								)}
								{`${data.t('holdings.libraries')})`}
							</a>
						</li>
					{/each}
				</ul>
			</div>
			{#if data.images.length}
				<div class="flex h-full max-h-72 w-full max-w-72 self-center md:self-start">
					<ResourceImage
						resource={data.instances?.find(
							(instanceItem) => instanceItem['@id'] === data.images[0].recordId.replace('#it', '')
						)}
						alt={data.t('general.latestInstanceCover')}
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
	{#if $page.url.searchParams.has('holdings') && data.holdingsByInstanceId[$page.url.searchParams.get('holdings')]}
		{@const holdings = data.holdingsByInstanceId[$page.url.searchParams.get('holdings')]}
		<Modal close={handleCloseHoldings} bind:this={holdingsModal}>
			<div class="flex flex-col gap-4 px-4 text-sm">
				<div class="flex gap-4">
					{#if data.images.length}
						<div class="flex h-full max-h-20 w-full max-w-20 self-center md:self-start">
							<ResourceImage
								resource={data.instances?.find(
									(instanceItem) =>
										instanceItem['@id'] === data.images[0].recordId.replace('#it', '')
								)}
								alt={data.t('general.latestInstanceCover')}
							/>
						</div>
					{/if}
					<div class="overview">
						<DecoratedData data={decoratedInstance} block />
					</div>
				</div>
				<div>
					<h2 class="font-bold">{data.t('holdings.availableAt')}</h2>
					{#if holdings?.length}
						<table class="w-full table-auto border-collapse text-sm">
							{#each holdings as holdingItem}
								<tr class="h-11 border-b-primary/16 [&:not(:last-child)]:border-b">
									<td>
										{holdingItem?.heldBy?.name}
									</td>
									<td class="text-right text-secondary">
										{holdingItem?.heldBy?.sigel ? `(${holdingItem?.heldBy?.sigel})` : ''}
									</td>
								</tr>
							{/each}
						</table>
					{/if}
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
