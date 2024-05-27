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

<article class="container-fluid mb-12 mt-8 max-w-3xl page-padding">
	{#if data.locale === 'en'}
		<EnContent />
	{:else}
		<SvContent />
	{/if}
</article>
