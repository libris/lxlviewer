<script lang="ts">
	import { type Component } from 'svelte';
	import { page } from '$app/state';
	import { Locales, type LocaleCode } from '$lib/i18n/locales';
	import IconHome from '~icons/bi/house';
	import IconSearch from '~icons/bi/search';
	import IconSaved from '~icons/bi/bookmark';
	import IconHelp from '~icons/bi/question-circle';
	import IconAbout from '~icons/bi/info-circle';
	import IconChangeLang from '~icons/bi/globe';

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
		LeadingIcon?: Component;
		TrailingIcon?: Component;
		currentPage?: boolean;
		hreflang?: string;
	}[] = $derived([
		...(showSkipToContent
			? [{ href: '#content', label: page.data.t('appMenu.skipToContent') }]
			: []),
		{
			href: page.data.localizeHref(page.data.base),
			label: page.data.t('appMenu.home'),
			LeadingIcon: IconHome
		},
		{
			href: page.data.localizeHref(page.data.base + '#search'),
			label: page.data.t('appMenu.search'),
			LeadingIcon: IconSearch
		},
		{
			href: page.data.localizeHref('/my-pages'),
			label: page.data.t('appMenu.saved'),
			currentPage: page.route.id === '/(app)/[[lang=lang]]/my-pages',
			LeadingIcon: IconSaved
		},
		/*
		{
			href: page.data.localizeHref('/subsets'),
			label: page.data.t('appMenu.subsets'),
			currentPage: page.route.id === '/(app)/[[lang=lang]]/subsets'
		},
		*/
		{
			href: page.data.localizeHref('/help'),
			label: page.data.t('appMenu.help'),
			currentPage: page.route.id === '/(app)/[[lang=lang]]/help',
			LeadingIcon: IconHelp
		},
		{
			href: page.data.localizeHref('/about'),
			label: page.data.t('appMenu.about'),
			currentPage: page.route.id === '/(app)/[[lang=lang]]/about',
			LeadingIcon: IconAbout
		},
		{
			href: page.data.localizeHref(page.url.pathname + page.url.search + page.url.hash, {
				locale: otherLangCode
			}),
			hreflang: otherLangCode,
			label: page.data.t('appMenu.changeLang'),
			LeadingIcon: IconChangeLang
		}
	]);
</script>

<ul class="w-full">
	{#each menuItems as { href, label, LeadingIcon, TrailingIcon, currentPage, hreflang } (href)}
		<li class="border-neutral not-last:border-b">
			<a
				{href}
				aria-current={currentPage ? 'page' : undefined}
				class="link-subtle hover:bg-primary-50 focus-visible:bg-primary-50 focus-visible:hover:bg-primary-100 flex min-h-11 items-center gap-3 px-3"
				{hreflang}
			>
				{#if LeadingIcon}
					<LeadingIcon class={['text-subtle', currentPage && 'text-primary-700!']} />
				{/if}
				{label}
				{#if TrailingIcon}
					<TrailingIcon class="ml-auto" />
				{/if}
			</a>
		</li>
	{/each}
</ul>

<style lang="postcss">
	@reference 'tailwindcss';

	a[aria-current] {
		position: relative;

		&::after {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			height: 100%;
			background: var(--color-primary);
			width: 3px;
			pointer-events: none;
		}
	}
</style>
