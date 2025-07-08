<script lang="ts">
	import { page } from '$app/state';

	import getPageTitle from '$lib/utils/getPageTitle';

	import Resource from '$lib/components/Resource.svelte';
	import InstancesList from './InstancesList.svelte';
	import SearchResultOld from '$lib/components/find/SearchResultOld.svelte';
	import HoldingsModal from './HoldingsModal.svelte';

	const { data } = $props();
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
	instances={data.instances}
	holdersByType={data.holdersByType}
/>

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
