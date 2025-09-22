<script lang="ts">
	import { type Component } from 'svelte';
	import { page } from '$app/state';
	import { Locales, type LocaleCode } from '$lib/i18n/locales';
	import IconGoto from '~icons/bi/chevron-right';
	import IconSearch from '~icons/bi/search';
	import IconBookmark from '~icons/bi/bookmark';
	import Iconlanguage from '~icons/bi/globe';

	type Props = {
		showSkipToContent?: boolean;
	};

	let { showSkipToContent = true }: Props = $props();

	const otherLangCode = $derived(
		Object.keys(Locales).find((locale) => locale !== page.data.locale) as LocaleCode
	);

	const menuItems: {
		href: string;
		label: string;
		Icon?: Component;
		currentPage?: boolean;
		hreflang?: string;
	}[] = $derived([
		...(showSkipToContent
			? [{ href: '#content', label: page.data.t('appMenu.skipToContent') }]
			: []),
		{
			href: page.data.localizeHref(page.data.base),
			label: page.data.t('appMenu.home'),
			Icon: IconGoto,
			currentPage: page.route.id === '/(app)/[[lang=lang]]'
		},
		{
			href: page.data.localizeHref(page.data.base + '#search'),
			Icon: IconSearch,
			label: page.data.t('appMenu.search')
		},
		{
			href: page.data.localizeHref('/my-pages'),
			label: page.data.t('appMenu.saved'),
			Icon: IconBookmark,
			currentPage: page.route.id === '/(app)/[[lang=lang]]/my-pages'
		},
		{
			href: page.data.localizeHref('/subsets'),
			label: page.data.t('appMenu.subsets'),
			Icon: IconGoto,
			currentPage: page.route.id === '/(app)/[[lang=lang]]/subsets'
		},
		{
			href: page.data.localizeHref('/help'),
			label: page.data.t('appMenu.help'),
			Icon: IconGoto,
			currentPage: page.route.id === '/(app)/[[lang=lang]]/help'
		},
		{
			href: page.data.localizeHref('/about'),
			label: page.data.t('appMenu.about'),
			Icon: IconGoto,
			currentPage: page.route.id === '/(app)/[[lang=lang]]/about'
		},
		{
			href: page.data.localizeHref(page.url.pathname + page.url.search + page.url.hash, {
				locale: otherLangCode
			}),
			hreflang: otherLangCode,
			label: page.data.t('appMenu.changeLang'),
			Icon: Iconlanguage,
			currentPage: page.route.id === '/(app)/[[lang=lang]]/about'
		}
	]);
</script>

<ul>
	{#each menuItems as { href, label, Icon, currentPage, hreflang } (href)}
		<li class="border-neutral border-b first:border-t">
			<a
				{href}
				aria-current={currentPage ? 'page' : undefined}
				class="link-subtle flex min-h-11 items-center px-3"
				{hreflang}
			>
				{label}
				<Icon class="ml-auto" />
			</a>
		</li>
	{/each}
</ul>
