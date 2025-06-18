<script lang="ts">
	import { page } from '$app/state';
	import SearchResult_2 from '$lib/components/find/SearchResult-2.svelte';
	import getPageTitle from '$lib/utils/getPageTitle';
</script>

<svelte:head>
	<title>{getPageTitle(page.url.searchParams.get('_q')?.trim())}</title>
</svelte:head>
<SearchResult_2 searchResult={page.data.searchResult} />
