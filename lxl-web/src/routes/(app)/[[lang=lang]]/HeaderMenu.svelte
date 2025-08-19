<script lang="ts">
	import { page } from '$app/state';
	import BiGlobe from '~icons/bi/globe';
	import BiPerson from '~icons/bi/person-circle';
	import BiQuestionCircle from '~icons/bi/question-circle';
	import { Locales, defaultLocale } from '$lib/i18n/locales';

	const isLandingPage = $derived(page.route.id === '/(app)/[[lang=lang]]');

	const otherLangCode = Object.keys(Locales).find((locale) => locale !== page.data.locale);
	const otherLangLabel = page.data.t('header.changeLang');
	const otherLangUrl = $derived(
		(otherLangCode === defaultLocale
			? page.url.pathname.replace(`/${page.data.locale}`, isLandingPage ? '/' : '')
			: `/${otherLangCode}${page.url.pathname}`) + page.url.search
	);
</script>

<nav class="header-menu py-4 2xl:py-0 [&_a]:no-underline">
	<ol
		class="text-subtle [&_svg]:text-body flex flex-row items-center gap-4 font-medium [&_svg]:text-lg"
	>
		<li>
			<a class="flex flex-col items-center gap-1 whitespace-nowrap" href="help">
				<BiQuestionCircle />
				<span>
					{page.data.t('header.help')}
				</span>
			</a>
		</li>
		<li>
			<a class="flex flex-col items-center gap-1 whitespace-nowrap" href="my-pages">
				<BiPerson />
				<div class="text-nowrap">
					{page.data.t('header.myPages')}
				</div>
			</a>
		</li>
		<li>
			<a
				class="flex flex-col items-center gap-1 whitespace-nowrap"
				href={otherLangUrl}
				hreflang={otherLangCode}
				data-sveltekit-reload
				data-testid="current-lang"
			>
				<BiGlobe />
				<span>{otherLangLabel}</span>
			</a>
		</li>
	</ol>
</nav>

<style>
	/* header menu in dialog */
	:global(dialog .header-menu) {
		& ol {
			flex-direction: column;
		}

		& ol li a {
			flex-direction: row;
			gap: calc(var(--spacing) * 2);
		}
	}
</style>
