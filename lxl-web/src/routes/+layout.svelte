<script lang="ts">
	import './styles.css';
	import InterVariable from '$lib/fonts/InterVariable.woff2';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';

	const { children } = $props();
</script>

<svelte:head>
	<link rel="preload" href={InterVariable} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>
<ParaglideJS {i18n}>
	{@render children()}
</ParaglideJS>
