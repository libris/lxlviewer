<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import SiteFooter from './SiteFooter.svelte';
	import AppBar from './AppBar.svelte';
	import { page } from '$app/state';
	const { children } = $props();

	const isFindRoute = $derived(page.route.id === '/(app)/[[lang=lang]]/find');
</script>

<svelte:head>
	<title>{getPageTitle()}</title>
</svelte:head>
<AppBar />
{#if isFindRoute}
	<div class="flex flex-1 flex-col">
		{@render children()}
	</div>
{:else}
	<main class="flex flex-1 flex-col">
		{@render children()}
	</main>
	<SiteFooter />
{/if}
<div id="floating-elements-container"></div>
