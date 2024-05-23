<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/stores';
	import SvContent from './sv.md';
	import EnContent from './en.md';

	export let data;
</script>

<svelte:head>
	<title>{getPageTitle($page.data.t('header.help'))}</title>
</svelte:head>

<article class="content container-fluid max-w-3xl">
	{#if data.locale === 'en'}
		<EnContent />
	{:else}
		<SvContent />
	{/if}
</article>

<style lang="postcss">
	.content :global(h1) {
		@apply text-6-cond-extrabold;
	}
</style>
