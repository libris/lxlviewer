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
	<div class="landing flex flex-col items-center gap-2 pb-3">
		<h1 class="flex text-3xl/tight font-extrabold text-primary sm:text-[5.5rem] sm:font-bold">
			Libris
			<div
				class="self-center rounded-sm bg-positive-dark/16 px-2 uppercase text-2-cond-bold sm:text-3-cond-bold"
				>Beta</div
			>
		</h1>
	</div>

	{#if $page.data.locale === 'en'}
		<EnContent />
	{:else}
		<SvContent />
	{/if}
</article>
