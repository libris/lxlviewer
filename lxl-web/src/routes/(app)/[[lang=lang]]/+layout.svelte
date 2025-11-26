<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import SiteFooter from './SiteFooter.svelte';
	import AppBar from './AppBar.svelte';
	import { page } from '$app/state';
	const { children } = $props();

	const isFindRoute = $derived(page.route.id === '/(app)/[[lang=lang]]/find');
</script>

<svelte:head>
	<title>{getPageTitle(undefined, page.data.siteName)}</title>
	<link rel="unapi-server" type="application/xml" href={`/api/${page.data.locale}/cite`} />
</svelte:head>
<AppBar />
{#if isFindRoute}
	<div class="flex flex-1 flex-col">
		{@render children()}
	</div>
{:else}
	<main id="content" class="flex flex-1 flex-col">
		{@render children()}
	</main>
	<SiteFooter />
{/if}
<div id="floating-elements-container"></div>
