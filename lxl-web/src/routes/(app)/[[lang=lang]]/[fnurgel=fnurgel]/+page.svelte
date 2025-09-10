<script lang="ts">
	import { page } from '$app/state';
	import getPageTitle from '$lib/utils/getPageTitle';
	import Resource from '$lib/components/Resource.svelte';
	import CitationsModal from '$lib/components/CitationsModal.svelte';
	import HoldingsModal from '$lib/components/HoldingsModal.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>{getPageTitle(data.title)}</title>
</svelte:head>
<div data-testid="resource-page" class="contents">
	<!-- Zotero tag -->
	{#if data.instances.length}
		<abbr class="unapi-id hidden" title={data.uri}></abbr>
	{/if}
	<Resource
		fnurgel={page.params.fnurgel}
		type={data.type}
		images={data.images}
		decoratedTypes={data.types}
		decoratedHeading={data.heading}
		decoratedOverview={data.overview}
		relations={data.relations}
		relationsPreviewsByQualifierKey={data.relationsPreviewsByQualifierKey}
		instances={data.instances}
		holdersByType={data.holdings.holdersByType}
		tableOfContents={data.tableOfContents}
		adjecentSearchResults={page.state.adjecentSearchResults}
	/>
	<HoldingsModal
		{...data.holdings}
		instances={data.instances}
		overview={data.overview}
		title={data.title}
	/>
	<CitationsModal />
</div>
