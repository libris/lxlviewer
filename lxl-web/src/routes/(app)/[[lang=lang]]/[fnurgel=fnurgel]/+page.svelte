<script lang="ts">
	import { page } from '$app/state';

	import getPageTitle from '$lib/utils/getPageTitle';

	import Resource from '$lib/components/Resource.svelte';
	import SearchResultOld from '$lib/components/find/SearchResultOld.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>{getPageTitle(data.title)}</title>
</svelte:head>
<Resource
	fnurgel={page.params.fnurgel}
	type={data.type}
	images={data.images}
	decoratedTypes={data.types}
	decoratedHeading={data.heading}
	decoratedOverview={data.overview}
	instances={data.instances}
	holdersByType={data.holdersByType}
/>
<SearchResultOld searchResult={page.data.searchResult} showMapping />
