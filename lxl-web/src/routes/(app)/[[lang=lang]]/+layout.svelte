<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import SiteFooter from './SiteFooter.svelte';
	import AppBar from './AppBar.svelte';
	import { page } from '$app/state';
	import { setHomepageContext } from '$lib/contexts/homepage';

	const { children } = $props();

	const isHomeRoute = $derived(page.route.id === '/(app)/[[lang=lang]]');
	const isFindRoute = $derived(page.route.id === '/(app)/[[lang=lang]]/find');

	let homepageCache = $state({
		previews: undefined
	});

	setHomepageContext(homepageCache);
</script>

<svelte:head>
	<title>{getPageTitle(undefined, page.data.siteName)}</title>
	<link rel="unapi-server" type="application/xml" href={`/api/${page.data.locale}/cite`} />
</svelte:head>
<AppBar />
{#if isFindRoute}
	<div class="content flex flex-1 flex-col">
		{@render children()}
	</div>
{:else}
	<main
		id="content"
		class={['@container flex flex-1 scroll-mt-24 flex-col', !isHomeRoute && 'content']}
	>
		{@render children()}
	</main>
	<SiteFooter />
{/if}
<div id="floating-elements-container"></div>

<style lang="postcss">
	@reference 'tailwindcss';

	.content {
		@variant lg {
		}
	}
</style>
