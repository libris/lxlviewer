<script>
	import { page } from '$app/stores';
	import { getSupportedLocale } from '$lib/i18n/locales';

	const locale = getSupportedLocale($page.url.pathname.split('/')[1]);

	/** Currently using hard-coded localized strings here as we cannot access the translator/t function in $page.data from the error page)... there probably is a much cleaner way to do this? */
	const localizedErrors = {
		sv: {
			notFound: 'Sidan kunde inte hittas',
			faultyLink: 'Klickade du på en länk i Libris som inte fungerade?',
			sendEmail: 'Skicka e-post till',
			customerService: 'Libris kundservice',
			followUp: ', så undersöker vi felet.',
			backToStartPage: 'Tillbaka till startsidan',
			mailSubject: 'Felaktig länk'
		},
		en: {
			notFound: 'The page could not be found',
			faultyLink: "Did you click on a link that didn't work?",
			sendEmail: 'Send an e-mail to',
			customerService: 'Libris customer service',
			followUp: ', and we will investigate the error.',
			backToStartPage: 'Back to the home page',
			mailSubject: 'Incorrect link'
		}
	};
</script>

<div class="m-auto flex max-w-[640px] flex-col p-8 text-center">
	<div class="pb-8">
		<a href="/" class="inline-block no-underline">
			<h1 class="text-3xl font-bold text-primary">Libris</h1>
		</a>
	</div>
	<h1 class="text-6-cond-extrabold">{$page.status}</h1>
	{#if $page.status === 404}
		<h2 class="pb-4">{localizedErrors[locale].notFound}</h2>
		<p>{localizedErrors[locale].faultyLink}</p>
		<p>
			{localizedErrors[locale].sendEmail}
			<a
				href="mailto:libris@kb.se?subject=Felaktig länk&body=Felaktig referens till sidan {$page.url
					.href}">{localizedErrors[locale].customerService}</a
			>{localizedErrors[locale].followUp}
		</p>
		<p class="pt-4">
			<a href={locale === 'en' ? '/en' : '/'}>{localizedErrors[locale].backToStartPage}</a>
		</p>
	{:else}
		<p class="text-secondary">{$page.error?.message}</p>
	{/if}
</div>
