<script lang="ts">
	import { page } from '$app/state';
	import getPageTitle from '$lib/utils/getPageTitle';
	import Resource from '$lib/components/Resource.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>{getPageTitle(data.title)}</title>
</svelte:head>
<div data-testid="resource-page" class="contents">
	{#if data.holdingsByInstanceId}
		{#each Object.keys(data.holdingsByInstanceId) as id (id)}
			<abbr class="unapi-id hidden" title={id}></abbr>
		{/each}
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
		holdersByType={data.holdersByType}
		tableOfContents={data.tableOfContents}
		adjecentSearchResults={page.state.adjecentSearchResults}
	/>
</div>
