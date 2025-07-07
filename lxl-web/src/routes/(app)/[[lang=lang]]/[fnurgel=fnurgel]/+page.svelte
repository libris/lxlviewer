<script lang="ts">
	import { page } from '$app/state';
	import { getUserSettings } from '$lib/contexts/userSettings';

	import getPageTitle from '$lib/utils/getPageTitle';
	import { getHoldingsLink, getMyLibsFromHoldings, handleClickHoldings } from '$lib/utils/holdings';
	import { relativizeUrl } from '$lib/utils/http';
	import { getResourceId } from '$lib/utils/resourceData';

	import Resource from '$lib/components/Resource.svelte';
	import InstancesList from './InstancesList.svelte';
	import SearchResultOld from '$lib/components/find/SearchResultOld.svelte';
	import MyLibrariesIndicator from '$lib/components/MyLibsHoldingIndicator.svelte';
	import HoldingsModal from './HoldingsModal.svelte';

	const { data } = $props();
	const userSettings = getUserSettings();
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
<Resource
	type={data.type}
	images={data.images}
	decoratedTypes={data.types}
	decoratedHeading={data.heading}
	decoratedOverview={data.overview}
/>

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
<SearchResultOld searchResult={page.data.searchResult} showMapping />

<style>
	.instances {
		grid-template-areas: '. instances-list';
	}

	.instances-list {
		grid-area: instances-list;
	}
</style>
