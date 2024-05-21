<script lang="ts">
	import SiteHeader from './SiteHeader.svelte';
	import getPageTitle from '$lib/utils/getPageTitle';
	import SiteFooter from './SiteFooter.svelte';
	export let data;
</script>

<svelte:head>
	<title>{getPageTitle()}</title>
	<base href={data.base} />
</svelte:head>
<SiteHeader />
<main>
	<slot />
</main>
<SiteFooter />
<div id="floating-elements-container" />
