<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/state';
	import Libraries from '$lib/components/my-pages/Libraries.svelte';
</script>

<svelte:head>
	<title>{getPageTitle(page.data.t('header.myPages'))}</title>
</svelte:head>

<div class="mx-auto mt-8 w-full max-w-screen p-4 sm:px-6 lg:max-w-5xl">
	<h1 class="font-heading text-3xl font-medium">{page.data.t('myPages.myPages')}</h1>
	<Libraries />
</div>
