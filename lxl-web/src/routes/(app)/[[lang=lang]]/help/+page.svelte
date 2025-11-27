<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import Meta from '$lib/components/Meta.svelte';
	import { page } from '$app/state';
	import SvContent from './sv.md';
	import EnContent from './en.md';

	let { data } = $props();

	const pageTitle = page.data.t('help.pageTitle');
</script>

<svelte:head>
	<title>{getPageTitle(pageTitle, page.data.siteName)}</title>
</svelte:head>

<Meta
	title={pageTitle}
	description={page.data.t('help.pageDescription')}
	url={page.url.origin + page.url.pathname}
	siteName={page.data.siteName}
/>

<article class="mx-auto mt-8 mb-12 max-w-3xl p-4 sm:px-6">
	{#if data.locale === 'en'}
		<EnContent />
	{:else}
		<SvContent />
	{/if}
</article>
