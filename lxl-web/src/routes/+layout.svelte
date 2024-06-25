<script lang="ts">
	import '$lib/styles/app.css';
	import AppHeader from './AppHeader.svelte';
</script>

<div class="app">
	<AppHeader />
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
