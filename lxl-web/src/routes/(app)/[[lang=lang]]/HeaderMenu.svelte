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

<div class="py-4 lg:py-0 [&_a]:no-underline">
	<ol class="text-secondary lg:text-2-regular flex flex-col items-center gap-4 lg:flex-row">
		<li>
			<a class="flex items-center gap-2 lg:flex-col lg:gap-1" href="help">
				<BiQuestionCircle class="text-icon h-4 w-4" />
				<span>
					{$page.data.t('header.help')}
				</span>
			</a>
		</li>
		<li>
			<a class="flex items-center gap-2 lg:flex-col lg:gap-1" href="my-pages">
				<BiPerson class="text-icon h-4 w-4" />
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
				<BiGlobeAmericas class="text-icon h-4 w-4" />
				<span>{otherLangLabel}</span>
			</a>
		</li>
	</ol>
</div>
