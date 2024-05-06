<script>
	import { page } from '$app/stores';
	import { getSupportedLocale } from '$lib/i18n/locales';
	import getPageTitle from '$lib/utils/getPageTitle';
	export let showLogo = false;

	const locale = getSupportedLocale($page.url.pathname.split('/')[1]);

	/** Currently using hard-coded localized strings here as we cannot access the translator/t function in $page.data from the root error page)... there probably is a much cleaner way to do this? */
	const errorMessages = {
		sv: {
			somethingWentWrong: 'Något gick fel',
			notFound: 'Sidan hittades inte',
			wrongLink: 'Klickade du på en länk i Libris som inte fungerade?',
			sendEmail: 'Skicka e-post till',
			customerService: 'Libris kundservice',
			followUp: ', så undersöker vi felet.',
			backToStartPage: 'Tillbaka till startsidan',
			mailSubject: 'Felaktig länk',
			mailBody: 'Felaktig referens till sidan'
		},
		en: {
			somethingWentWrong: 'Somethingh went wrong',
			notFound: 'Page not found',
			wrongLink: "Did you click on a link that didn't work?",
			sendEmail: 'Send an e-mail to',
			customerService: 'Libris customer service',
			followUp: ', and we will investigate the error.',
			backToStartPage: 'Back to the home page',
			mailSubject: 'Incorrect link',
			mailBody: 'Incorrect reference to the page'
		}
	};

	const localizedErrors = errorMessages[locale];

	function getErrorPageTitle() {
		if ($page.status === 404) {
			return getPageTitle(localizedErrors.notFound);
		}
		return getPageTitle(localizedErrors.somethingWentWrong);
	}
</script>

<svelte:head>
	<title>{getErrorPageTitle()}</title>
</svelte:head>
<div class="m-auto flex flex-col p-8 text-center">
	{#if showLogo}
		<div class="pb-8">
			<a href="/" class="inline-block no-underline">
				<h1 class="text-3xl font-bold text-primary">Libris</h1>
			</a>
		</div>
	{/if}
	<h1 class="text-6-cond-extrabold">{$page.status}</h1>
	{#if $page.status === 404}
		<h2 class="pb-4">{localizedErrors.notFound}</h2>
		<p>{localizedErrors.wrongLink}</p>
		<p>
			{localizedErrors.sendEmail}
			<a
				href="mailto:libris@kb.se?subject={encodeURIComponent(
					localizedErrors.mailSubject
				)}&body={encodeURIComponent(localizedErrors.mailBody)} {$page.url.href}"
				>{localizedErrors.customerService}</a
			>{localizedErrors.followUp}
		</p>
		<p class="pt-4">
			<a href={locale === 'en' ? '/en' : '/'}>{localizedErrors.backToStartPage}</a>
		</p>
	{:else if $page.error?.message}
		<h2 class="pb-4">{localizedErrors.somethingWentWrong}</h2>
		<p>{$page.error.message}</p>
	{/if}
</div>
