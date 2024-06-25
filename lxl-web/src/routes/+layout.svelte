<script lang="ts">
	import '$lib/styles/app.css';
	import SiteHeader from './SiteHeader.svelte';
</script>

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
