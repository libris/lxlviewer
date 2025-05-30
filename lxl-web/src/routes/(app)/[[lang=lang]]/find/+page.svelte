<script lang="ts">
	import { page } from '$app/state';
	import SearchResult_2 from '$lib/components/find/SearchResult-2.svelte';
	// import SearchResult from '$lib/components/find/SearchResult.svelte';
	import getPageTitle from '$lib/utils/getPageTitle';
</script>

<svelte:head>
	<title>{getPageTitle(page.url.searchParams.get('_q')?.trim())}</title>
</svelte:head>
<h1 class="sr-only">{page.data.t('search.searchResults')}</h1>
<!-- <SearchResult
	searchResult={page.data.searchResult}
	showMapping={page.url.searchParams.get('_x') === 'mappings'}
/> -->
<SearchResult_2 searchResult={page.data.searchResult} />
