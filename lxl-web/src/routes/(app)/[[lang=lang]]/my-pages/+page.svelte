<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/state';
	import Libraries from '$lib/components/my-pages/Libraries.svelte';
	import Meta from '$lib/components/Meta.svelte';

	const pageTitle = page.data.t('myPages.pageTitle');
</script>

<svelte:head>
	<title>{getPageTitle(pageTitle, page.data.siteName)}</title>
</svelte:head>

<Meta
	title={pageTitle}
	description={page.data.t('myPages.pageDescription')}
	url={page.url.origin + page.url.pathname}
	siteName={getPageTitle(undefined, page.data.siteName)}
/>

<div class="mx-auto mt-8 w-full max-w-screen p-4 sm:px-6 lg:max-w-5xl">
	<h1 class="font-heading text-3xl font-medium">{page.data.t('myPages.myPages')}</h1>
	<Libraries />
</div>
