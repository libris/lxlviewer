<script lang="ts">
	import '../app.css';
	import SiteHeader from './SiteHeader.svelte';
</script>

<svelte:head>
	<link
		rel="preload"
		as="font"
		href="/fonts/InterVariable.woff2"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>
<SiteHeader />
<main>
	<slot />
</main>
