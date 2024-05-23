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

<article class="container-fluid max-w-3xl">
	{#if data.locale === 'en'}
		<EnContent />
	{:else}
		<SvContent />
	{/if}
</article>
