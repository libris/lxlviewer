<script lang="ts">
	import { page } from '$app/state';
	import BiGlobe from '~icons/bi/globe';
	import BiPerson from '~icons/bi/person-circle';
	import BiQuestionCircle from '~icons/bi/question-circle';
	import { Locales, defaultLocale } from '$lib/i18n/locales';
	import { goto } from '$app/navigation';

	const isLandingPage = $derived(page.route.id === '/(app)/[[lang=lang]]');

	const otherLangCode = Object.keys(Locales).find((locale) => locale !== page.data.locale);
	const otherLangLabel = page.data.t('header.changeLang');
	const otherLangUrl = $derived(
		(otherLangCode === defaultLocale
			? page.url.pathname.replace(`/${page.data.locale}`, isLandingPage ? '/' : '')
			: `/${otherLangCode}${page.url.pathname}`) + page.url.search
	);

	function preservePageState(event: MouseEvent) {
		if (page.state && Object.keys(page.state).length) {
			event.preventDefault();
			goto((event.currentTarget as HTMLAnchorElement).href, { state: page.state });
		}
	}
</script>

<nav class="py-4 2xl:py-0 [&_a]:no-underline">
	<ol
		class="text-subtle [&_svg]:text-body flex flex-col items-center gap-4 font-medium 2xl:flex-row [&_svg]:text-lg"
	>
		<li>
			<a class="flex items-center gap-2 2xl:flex-col 2xl:gap-1" href="help">
				<BiQuestionCircle />
				<span>
					{page.data.t('header.help')}
				</span>
			</a>
		</li>
		<li>
			<a class="flex items-center gap-2 2xl:flex-col 2xl:gap-1" href="my-pages">
				<BiPerson />
				<div class="text-nowrap">
					{page.data.t('header.myPages')}
				</div>
			</a>
		</li>
		<li>
			<a
				class="flex items-center gap-2 whitespace-nowrap 2xl:flex-col 2xl:gap-1"
				href={otherLangUrl}
				hreflang={otherLangCode}
				data-testid="current-lang"
				onclick={preservePageState}
			>
				<BiGlobe />
				<span>{otherLangLabel}</span>
			</a>
		</li>
	</ol>
</nav>
