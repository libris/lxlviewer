<script lang="ts">
	import { page } from '$app/stores';
	import BiGlobeAmericas from '~icons/bi/globe-americas';
	import BiPerson from '~icons/bi/person-circle';
	import BiQuestionCircle from '~icons/bi/question-circle';
	import { Locales, defaultLocale } from '$lib/i18n/locales';

	$: isLandingPage = $page.route.id === '/(app)/[[lang=lang]]';

	const otherLangCode = Object.keys(Locales).find((locale) => locale !== $page.data.locale);
	const otherLangLabel = $page.data.t('header.changeLang');
	$: otherLangUrl =
		(otherLangCode === defaultLocale
			? $page.url.pathname.replace(`/${$page.data.locale}`, isLandingPage ? '/' : '')
			: `/${otherLangCode}${$page.url.pathname}`) + $page.url.search;
</script>

<div class="header-menu py-4 lg:py-0">
	<ol class="flex flex-col items-center gap-4 text-secondary lg:flex-row lg:text-2-regular">
		<li>
			<a class="flex items-center gap-2 lg:flex-col lg:gap-1" href="help">
				<BiQuestionCircle class="h-4 w-4 text-icon" />
				<span>
					{$page.data.t('header.help')}
				</span>
			</a>
		</li>
		<li>
			<a class="flex items-center gap-2 lg:flex-col lg:gap-1" href="my-pages">
				<BiPerson class="h-4 w-4 text-icon" />
				<div class="text-nowrap">
					{$page.data.t('header.myPages')}
				</div>
			</a>
		</li>
		<li>
			<a
				class="flex items-center gap-2 whitespace-nowrap lg:flex-col lg:gap-1"
				href={otherLangUrl}
				hreflang={otherLangCode}
				data-sveltekit-reload
				data-testid="current-lang"
			>
				<BiGlobeAmericas class="h-4 w-4 text-icon" />
				<span>{otherLangLabel}</span>
			</a>
		</li>
	</ol>
</div>

<style>
	.header-menu a {
		@apply no-underline;
	}
</style>
