<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/stores';
	import SvContent from './sv.md';
	import EnContent from './en.md';

	export let data;
</script>

<svelte:head>
	<title>{getPageTitle($page.data.t('about.pageTitle'))}</title>
</svelte:head>

<article class="mx-auto mt-8 mb-12 max-w-3xl p-4 sm:px-6">
	{#if data.locale === 'en'}
		<EnContent />
	{:else}
		<SvContent />
	{/if}
</article>
