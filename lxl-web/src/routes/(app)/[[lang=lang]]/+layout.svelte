<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import SiteFooter from './SiteFooter.svelte';
	import AppBar from './AppBar.svelte';
	import { page } from '$app/state';
	const { data, children } = $props();

	const isFindPage = $derived(page.url.pathname === '/find');
</script>

<svelte:head>
	<title>{getPageTitle()}</title>
	<base href={data.base} />
</svelte:head>
<AppBar />
<div class="flex flex-1 flex-col">
	{@render children()}
</div>
{#if !isFindPage}
	<SiteFooter />
{/if}
<div id="floating-elements-container"></div>
