<script>
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/stores';
	import EnContent from './frontpage.en.md';
	import SvContent from './frontpage.sv.md';
</script>

<svelte:head>
	<title>{getPageTitle()}</title>
</svelte:head>

<article class="container-fluid my-8 max-w-3xl">
	{#if $page.data.locale === 'en'}
		<EnContent />
	{:else}
		<SvContent />
	{/if}
</article>
