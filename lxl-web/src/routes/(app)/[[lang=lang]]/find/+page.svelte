<script lang="ts">
	import { page } from '$app/stores';
	import SearchResult from '$lib/components/find/SearchResult.svelte';
	import getPageTitle from '$lib/utils/getPageTitle';
</script>

<svelte:head>
	<title>{getPageTitle($page.url.searchParams.get('_q')?.trim())}</title>
</svelte:head>
<SearchResult searchResult={$page.data.searchResult} />
