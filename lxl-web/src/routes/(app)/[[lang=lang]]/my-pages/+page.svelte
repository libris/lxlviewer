<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/state';
	import Libraries from '$lib/components/my-pages/Libraries.svelte';
	import Meta from '$lib/components/Meta.svelte';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import { SettingsParams } from '$lib/types/userSettings';

	const pageTitle = $derived(page.data.t('myPages.pageTitle'));
	const q = $derived(page.url.searchParams.get('q'));

	const myCookie = $derived(getUserSettings());

	const query = $derived(
		myCookie.toURLSearchParams().toString().replaceAll('%2F', '/').replaceAll('%2C', ',')
	);
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

	<h2 class="font-heading mt-6 text-xl font-medium">
		{page.data.t('myPages.settingsLinkHeading')}
	</h2>
	{page.data.t('myPages.settingsLinkDescription')}
	<p class="my-2">
		<a href={page.data.localizeHref(`${page.url.origin}?${query}`)} class="link"
			>{page.data.t('myPages.settingsLink')}</a
		>
	</p>
	<div class="my-2">
		<p>
			<a
				href={page.data.localizeHref(`${page.url.origin}?${SettingsParams.wipeSettings}`)}
				class="link">{page.data.t('myPages.wipeLink')}</a
			>
		</p>
		<p>
			<a
				href={page.data.localizeHref(`${page.url.origin}?${SettingsParams.wipeSettings}&${query}`)}
				class="link">{page.data.t('myPages.wipeAndSettingsLink')}</a
			>
		</p>
		{page.data.t('myPages.wipeDescription')}
	</div>
</div>
