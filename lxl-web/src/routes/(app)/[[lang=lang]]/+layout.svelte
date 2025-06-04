<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	// import SiteHeader from './SiteHeader.svelte';
	import SiteFooter from './SiteFooter.svelte';
	import AppBar from './AppBar.svelte';
	export let data;
</script>

<svelte:head>
	<title>{getPageTitle()}</title>
	<base href={data.base} />
</svelte:head>
<AppBar />
<div class="flex flex-1 flex-col">
	<slot />
</div>
<SiteFooter />
<div id="floating-elements-container"></div>
