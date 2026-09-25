<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import Meta from '$lib/components/Meta.svelte';
	import MarkdownContent from '$lib/components/MarkdownContent.svelte';
	import { page } from '$app/state';
	import SvContent from './sv.md';
	import EnContent from './en.md';

	let { data } = $props();

	const pageTitle = $derived(page.data.t('about.pageTitle'));
</script>

<svelte:head>
	<title>{getPageTitle(pageTitle, page.data.siteName)}</title>
</svelte:head>

<Meta
	title={pageTitle}
	description={page.data.t('about.metaDescription')}
	url={page.url.origin + page.url.pathname}
	siteName={getPageTitle(undefined, page.data.siteName)}
/>

<article class="mx-auto mt-8 mb-12 max-w-3xl p-4 sm:px-6">
	{#if data.overrideAboutHtml}
		<MarkdownContent>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html data.overrideAboutHtml}
		</MarkdownContent>
	{:else if data.locale === 'en'}
		<EnContent />
	{:else}
		<SvContent />
	{/if}
</article>
