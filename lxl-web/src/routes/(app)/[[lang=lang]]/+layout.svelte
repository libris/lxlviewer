<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import SiteFooter from './SiteFooter.svelte';
	import AppBar from './AppBar.svelte';
	import { page } from '$app/state';
	const { data, children } = $props();

	const isFindRoute = $derived(page.route.id === '/(app)/[[lang=lang]]/find');
</script>

<!-- if holdings=fnurgel rendera ut holdingskomponent som
laddar det den behöver onMount-->

<svelte:head>
	<title>{getPageTitle()}</title>
	<base href={data.base} />
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
