<script lang="ts">
	import { page } from '$app/stores';
	import BiGlobeAmericas from '~icons/bi/globe-americas';
	import { Locales, defaultLocale } from '$lib/i18n/locales';

	$: isLandingPage = $page.route.id === '/(app)/[[lang=lang]]';

	const otherLangCode = Object.keys(Locales).find((locale) => locale !== $page.data.locale);
	const otherLangLabel = $page.data.t('header.changeLang');
	$: otherLangUrl =
		(otherLangCode === defaultLocale
			? $page.url.pathname.replace(`/${$page.data.locale}`, isLandingPage ? '/' : '')
			: `/${otherLangCode}${$page.url.pathname}`) + $page.url.search;
</script>

<nav class="header-menu py-8 md:py-0">
	<ol class="flex flex-col items-center gap-6 text-secondary md:flex-row">
		<li><a data-sveltekit-reload href={$page.data.base}>{$page.data.t('header.help')}</a></li>
		<li>
			<a
				class="flex items-center gap-2"
				href={otherLangUrl}
				hreflang={otherLangCode}
				data-sveltekit-reload
				data-testid="current-lang"
			>
				<BiGlobeAmericas class="inline text-icon" />
				<span>{otherLangLabel}</span>
			</a>
		</li>
	</ol>
</nav>

<style>
	.header-menu a {
		@apply no-underline;
	}
</style>
