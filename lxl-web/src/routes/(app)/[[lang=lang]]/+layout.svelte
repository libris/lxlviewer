<script lang="ts">
	import SiteHeader from './SiteHeader.svelte';
	import '../../../app.css';
	export let data;
</script>

<svelte:head>
	<title>Libris</title>
	<base href={data.base} />
</svelte:head>
<SiteHeader />
<slot />
<div id="floating-elements-container" />
