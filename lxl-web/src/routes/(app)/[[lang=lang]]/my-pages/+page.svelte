<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/state';
	import Libraries from '$lib/components/my-pages/Libraries.svelte';
	import Meta from '$lib/components/Meta.svelte';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import BiCopy from '~icons/bi/copy';

	const pageTitle = $derived(page.data.t('myPages.pageTitle'));
	const q = $derived(page.url.searchParams.get('q'));

	const settings = $derived(getUserSettings());

	const hasFavourites = $derived(
		settings.myLibraries && Object.keys(settings.myLibraries).length > 0
	);

	const setSettingsQuery = $derived(
		settings.toURLSearchParams().toString().replaceAll('%2F', '/').replaceAll('%2C', ',')
	);

	const settingsUrl = $derived(
		page.url.origin + page.data.localizeHref(`${page.url.origin}?${setSettingsQuery}`)
	);
	let lastCopiedUrl: string = $state('');

	async function handleCopySettingsUrl() {
		const url = settingsUrl;
		const type = 'text/plain';
		const blob = new Blob([url], { type });
		const data = new ClipboardItem({ [type]: blob });
		await navigator.clipboard.write([data]);
		lastCopiedUrl = url;
	}
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

<div class="mx-auto mt-2 w-full max-w-screen p-4 sm:px-6 md:mt-6 lg:max-w-6xl">
	<h1 class="font-heading text-2xl font-medium">{page.data.t('myPages.myPages')}</h1>
	<Libraries {q} />

	<div style="max-width: 60ch;" class:collapse={!hasFavourites}>
		<h2 class="mt-4 font-medium">
			{page.data.t('myPages.settingsLinkHeading')}
		</h2>
		<p class="my-2 text-sm">
			{page.data.t('myPages.settingsLinkDescription')}
		</p>
		<p class="my-2 font-mono">
			{settingsUrl}
		</p>
		<button class="btn btn-accent" onclick={() => handleCopySettingsUrl()}>
			<BiCopy />
			{#if lastCopiedUrl === settingsUrl}
				{page.data.t('general.copied')}
			{:else}
				{page.data.t('general.copyToClipboard')}
			{/if}
		</button>
	</div>
</div>
