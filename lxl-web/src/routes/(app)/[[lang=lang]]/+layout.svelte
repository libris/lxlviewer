<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import SiteHeader from './SiteHeader.svelte';
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
<div id="floating-elements-container"></div>
