<script>
	import AppHeader from '$lib/components/AppHeader.svelte';
	import { page } from '$app/stores';
	import * as m from '$lib/paraglide/messages.js';
	import getPageTitle from '$lib/utils/getPageTitle';
</script>

<svelte:head>
	{#if $page.status === 404}
		<title>{getPageTitle(m.pageNotFound())}</title>
	{:else}
		<title>{getPageTitle(m.somethingWentWrong())}</title>
	{/if}
</svelte:head>
<div class="app">
	<AppHeader />
	<main>
		<hgroup>
			<h1>
				{$page.status}
			</h1>
			<p>
				{#if $page.status === 404}
					{m.pageNotFound()}
				{:else}
					{m.somethingWentWrong()}
				{/if}
			</p>
		</hgroup>
		{#if $page.error?.message && $page.status !== 404}
			<p>{$page.error.message}</p>
		{/if}
	</main>
</div>

<style>
	.app {
		display: grid;
		grid-template-rows: min-content 1fr;
		min-height: 100vh;
	}
</style>
