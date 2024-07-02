<script lang="ts">
	import SiteHeader from './SiteHeader.svelte';
	import getPageTitle from '$lib/utils/getPageTitle';
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
<div id="floating-elements-container"></div>
