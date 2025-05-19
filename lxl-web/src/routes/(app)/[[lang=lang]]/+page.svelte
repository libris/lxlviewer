<script>
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/stores';
	import EnContent from './frontpage.en.md';
	import SvContent from './frontpage.sv.md';
</script>

<svelte:head>
	<title>{getPageTitle()}</title>
</svelte:head>

<article class="mx-auto my-8 max-w-3xl p-6">
	<div class="landing flex flex-col items-center gap-2">
		<h1 class="font-heading flex text-5xl/tight font-[600] sm:text-6xl/tight">Libris</h1>
	</div>

	{#if $page.data.locale === 'en'}
		<EnContent />
	{:else}
		<SvContent />
	{/if}
</article>
