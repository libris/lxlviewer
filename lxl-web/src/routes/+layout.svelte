<script lang="ts">
	import '$lib/styles/app.css';
	import SiteHeader from './SiteHeader.svelte';
	import InterVariable from '$lib/fonts/InterVariable.woff2';
</script>

<svelte:head>
	<link rel="preload" as="font" href={InterVariable} type="font/woff2" crossorigin="anonymous" />
</svelte:head>
<div class="app">
	<SiteHeader />
	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: grid;
		grid-template-rows: min-content 1fr;
		min-height: 100vh;
	}
</style>
