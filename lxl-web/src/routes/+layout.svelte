<script lang="ts">
	import '$lib/styles/app.css';
	import AppHeader from './AppHeader.svelte';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';

	const { children } = $props();
</script>

<ParaglideJS {i18n}>
	<div class="app">
		<AppHeader />
		<main>
			{@render children()}
		</main>
	</div>
</ParaglideJS>

<style>
	.app {
		display: grid;
		grid-template-rows: min-content 1fr;
		min-height: 100vh;
	}
</style>
