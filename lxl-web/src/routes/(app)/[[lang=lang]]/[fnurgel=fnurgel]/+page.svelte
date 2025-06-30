<script lang="ts">
	import { page } from '$app/state';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';
	import { Width } from '$lib/types/auxd';
	import { getUserSettings } from '$lib/contexts/userSettings';

	import getPageTitle from '$lib/utils/getPageTitle';
	import { getHoldingsLink, getMyLibsFromHoldings, handleClickHoldings } from '$lib/utils/holdings';
	import { relativizeUrl } from '$lib/utils/http';
	import { getResourceId } from '$lib/utils/resourceData';

	import Resource from '$lib/components/Resource.svelte';
	import InstancesList from './InstancesList.svelte';
	import ResourceImage from '$lib/components/ResourceImage.svelte';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import SearchResultOld from '$lib/components/find/SearchResultOld.svelte';
	import MyLibrariesIndicator from '$lib/components/MyLibsHoldingIndicator.svelte';
	import getTypeIcon from '$lib/utils/getTypeIcon';
	import HoldingsModal from './HoldingsModal.svelte';

	const { data } = $props();
	const userSettings = getUserSettings();
	const shouldShowHeaderBackground = $derived(!data.instances?.length);
	//TODO: duplicated
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
</script>

<svelte:head>
	<title>{getPageTitle(data.title)}</title>
</svelte:head>
<Resource />
<article class="resource-page text-base">
	<div class="resource find-layout gap-8 p-4 sm:px-6">
		<div
			class="image mt-4 mb-2 flex w-full justify-center self-center object-center lg:mx-auto lg:self-start lg:px-2 xl:px-0"
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
			class="content flex flex-col gap-4 pt-2 lg:flex-row"
			class:pb-4={shouldShowHeaderBackground}
		>
			<div class="flex flex-col gap-4">
				<header>
					<span class="mb-4 text-xs">
						<svelte:component this={getTypeIcon(data.type)} class="mb-0.25 inline text-sm" />
						<DecoratedData data={data.types} showLabels={ShowLabelsOptions.Never} />
					</span>
					<h1 class="mt-3 text-3xl font-medium">
						<DecoratedData data={data.heading} showLabels={ShowLabelsOptions.Never} />
					</h1>
				</header>
				<div class="flex flex-col-reverse gap-4 lg:flex-row">
					<div class="overview flex-1 gap-6">
						<DecoratedData data={data.overview} block />
						{#if Object.keys(data.holdersByType).length}
							<div class="flex items-center">
								<ul class="flex w-fit flex-wrap gap-2">
									{#each Object.keys(data.holdersByType) as type (type)}
										<li>
											<a
												class="btn btn-cta"
												href={getHoldingsLink(page.url, type)}
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
		<div class="instances find-layout p-4 pt-2! sm:px-6">
			<div class="instances-list border-neutral border-t pt-6 text-sm">
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
	{#if !page.data.searchResult}
		<HoldingsModal workFnurgel={page.data.workFnurgel}></HoldingsModal>
	{/if}
</article>
<SearchResultOld searchResult={page.data.searchResult} showMapping />

<style>
	.resource-page {
		& :global(.property-label) {
			font-size: var(--text-xs);
		}

		& :global(.contribution-role) {
			color: var(--color-subtle);
			font-size: var(--text-sm);
		}
	}

	.resource {
		grid-template-areas: 'image content';
	}

	.image {
		grid-area: image;
	}

	.content {
		grid-area: content;

		& :global(header .transliteration) {
			color: var(--color-subtle);
			font-size: var(--text-2xl);
		}

		& header :global(.agent-lifespan) {
			color: var(--color-subtle);
		}
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
			margin-bottom: calc(var(--spacing) * 4);
		}

		& :global(.contribution > ._contentBefore),
		:global(.contribution > ._contentAfter) {
			display: none;
		}

		& :global(.contribution > *) {
			display: block;
		}

		& :global(.see-also > *) {
			display: block;
			width: fit-content;
			white-space: nowrap;
		}
	}
</style>
