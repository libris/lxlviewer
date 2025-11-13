<script>
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/state';
	import EnContent from './frontpage.en.md';
	import SvContent from './frontpage.sv.md';
</script>

<svelte:head>
	<title>{getPageTitle(undefined, page.data.siteName)}</title>
</svelte:head>

<article class="mx-auto mt-8 mb-12 max-w-3xl p-4">
	{#if page.data.locale === 'en'}
		<EnContent />
	{:else}
		<SvContent />
	{/if}
</article>
