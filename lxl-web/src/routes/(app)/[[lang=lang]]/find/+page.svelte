<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';
	import SearchResult from '$lib/components/find/SearchResult.svelte';
	import getPageTitle from '$lib/utils/getPageTitle';

	let usingSuperSearch = $derived(
		env?.PUBLIC_USE_SUPERSEARCH === 'true' || $page.url.searchParams.get('_x') === 'supersearch'
	);
</script>

<svelte:head>
	<title>{getPageTitle($page.url.searchParams.get('_q')?.trim())}</title>
</svelte:head>
<h1 class="sr-only">{$page.data.t('search.searchResults')}</h1>
<SearchResult
	searchResult={$page.data.searchResult}
	showMapping={$page.url.searchParams.get('_x') === 'mappings' || !usingSuperSearch}
/>
