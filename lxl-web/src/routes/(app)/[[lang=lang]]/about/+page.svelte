<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/state';
	import SvContent from './sv.md';
	import EnContent from './en.md';

	let { data } = $props();
</script>

<svelte:head>
	<title>{getPageTitle(page.data.t('about.pageTitle'), page.data.siteName)}</title>
</svelte:head>

<article class="mx-auto mt-8 mb-12 max-w-3xl p-4 sm:px-6">
	{#if data.locale === 'en'}
		<EnContent />
	{:else}
		<SvContent />
	{/if}
</article>
