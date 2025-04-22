<script>
	import { page } from '$app/state';
	import getPageTitle from '$lib/utils/getPageTitle';

	export let showHeader = false;

	function getErrorPageTitle() {
		if (page.status === 404) {
			return getPageTitle(page.data.t('errors.notFound'));
		}
		return getPageTitle(page.data.t('errors.somethingWentWrong'));
	}
</script>

<svelte:head>
	<title>{getErrorPageTitle()}</title>
</svelte:head>
{#if showHeader}
	<header class="flex justify-center pt-8">
		<a href="/" class="inline-block no-underline">
			<h1 class="text-3xl font-bold">Libris</h1>
		</a>
	</header>
{/if}
<div class="m-auto flex flex-col p-8 text-center">
	<h1>{page.status}</h1>
	{#if page.status === 404}
		<h2 class="pb-4">{page.data.t('errors.notFound')}</h2>
		<p>{page.data.t('errors.wrongLink')}</p>
		<p>
			{page.data.t('errors.sendEmail')}
			<a
				href="mailto:libris@kb.se?subject={encodeURIComponent(
					page.data.t('errors.mailSubject')
				)}&body={encodeURIComponent(page.data.t('errors.mailBody'))} {page.url.href}"
				>{page.data.t('errors.customerService')}</a
			>{page.data.t('errors.followUp')}
		</p>
		<p class="pt-4">
			<a href={page.data.locale === 'en' ? '/en' : '/'}>{page.data.t('errors.backToStartPage')}</a>
		</p>
	{:else if page.error?.message}
		<h2 class="pb-4">{page.data.t('errors.somethingWentWrong')}</h2>
		<p>{page.error.message}</p>
	{/if}
</div>
