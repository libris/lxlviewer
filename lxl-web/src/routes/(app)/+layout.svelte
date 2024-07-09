<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	const { children } = $props();
</script>

<div class="app">
	<AppHeader />
	<main>
		{@render children()}
	</main>
</div>

<style>
	.app {
		display: grid;
		grid-template-rows: min-content 1fr;
		min-height: 100vh;
	}
</style>
