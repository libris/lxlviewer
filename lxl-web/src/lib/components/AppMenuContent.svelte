<script lang="ts">
	import { type Component } from 'svelte';
	import { page } from '$app/state';
	import { Locales, type LocaleCode } from '$lib/i18n/locales';
	import IconHome from '~icons/bi/house';
	import IconSearch from '~icons/bi/search';
	import IconSaved from '~icons/bi/bookmark';
	import IconChangeLang from '~icons/bi/globe';
	import IconGoto from '~icons/bi/chevron-down';
	import BiListColumnsReversed from '~icons/bi/list-columns-reverse';

	type Props = {
		showSkipToContent?: boolean;
		onclickSearch?: (event: MouseEvent) => void;
	};

	type MenuItem = {
		href: string;
		label: string;
		LeadingIcon?: Component;
		TrailingIcon?: Component;
		currentPage?: boolean;
		hreflang?: string;
		children?: MenuItem[];
		hasParent?: boolean;
		onclick?: (event: MouseEvent) => void;
	};

	let { showSkipToContent = true, onclickSearch }: Props = $props();

	const otherLangCode = $derived(
		Object.keys(Locales).find((locale) => locale !== page.data.locale) as LocaleCode
	);

	const MENU_ITEMS: MenuItem[] = $derived([
		...(showSkipToContent
			? [{ href: '#content', label: page.data.t('appMenu.skipToContent') }]
			: []),
		{
			href: page.data.localizeHref(page.data.base),
			label: page.data.t('appMenu.home'),
			LeadingIcon: IconHome,
			currentPage: page.route.id === '/(app)/[[lang=lang]]'
		},
		{
			href: page.data.localizeHref(page.data.base + '#search'),
			label: page.data.t('appMenu.search'),
			LeadingIcon: IconSearch,
			onclick: onclickSearch
		},
		{
			href: page.data.localizeHref('/my-pages'),
			label: page.data.t('appMenu.myPages'),
			currentPage: page.route.id === '/(app)/[[lang=lang]]/my-pages',
			LeadingIcon: IconSaved
		},
		{
			href: page.data.localizeHref('/collections'),
			label: page.data.t('appMenu.specialCollections'),
			currentPage: page.route.id === '/(app)/[[lang=lang]]/collections',
			LeadingIcon: BiListColumnsReversed
		},
		/*
		{
			href: page.data.localizeHref('/subsets'),
			label: page.data.t('appMenu.subsets'),
			currentPage: page.route.id === '/(app)/[[lang=lang]]/subsets'
		},
		*/
		{
			href: page.data.localizeHref('/help/search'),
			label: page.data.t('appMenu.help'),
			currentPage: page.route.id === '/(app)/[[lang=lang]]/help/search'
		},
		{
			href: page.data.localizeHref('/about'),
			label: page.data.t('appMenu.about'),
			currentPage: page.route.id === '/(app)/[[lang=lang]]/about',
			children: [
				{
					href: 'https://www.kb.se/om-oss/kontakta-oss',
					label: page.data.t('appMenu.contact')
				},
				{
					href: 'https://www.kb.se/for-bibliotekssektorn/tjanster-och-verktyg/arbeta-med-libris/fragor-och-svar-om-libris-nya-soktjanst.html',
					label: page.data.t('appMenu.aboutBeta')
				},
				{
					href: 'https://libris.kb.se/',
					label: page.data.t('appMenu.oldSite')
				}
			]
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

<ul class="mt-0.75 w-full">
	{#snippet menuItem({
		href,
		label,
		LeadingIcon,
		TrailingIcon,
		currentPage,
		hreflang,
		children,
		hasParent,
		onclick
	}: MenuItem)}
		<li
			class={[
				!hasParent && 'border-neutral border-b sm:last:border-0',
				children && 'with-children'
			]}
		>
			<a
				{href}
				aria-current={currentPage ? 'page' : undefined}
				class={[
					'hover:bg-primary-100 focus-visible:bg-primary-100 focus-visible:hover:bg-primary-200 hover:text-body flex min-h-12 items-center px-3 whitespace-nowrap -outline-offset-2 hover:underline focus-visible:underline lg:min-h-13 lg:px-4',
					LeadingIcon && 'pl-0 lg:pl-0',
					hasParent && 'min-h-11! pl-10 text-sm lg:min-h-11! lg:pl-12 lg:text-[0.9375rem]',
					hasParent ? 'font-normal' : 'text-subtle font-medium',
					currentPage && 'text-body!'
				]}
				{hreflang}
				{onclick}
			>
				{#if LeadingIcon}
					<span
						class={[
							'text-subtle inline-flex w-10 items-center justify-center lg:min-w-13',
							currentPage && 'text-primary-700!'
						]}
					>
						<LeadingIcon />
					</span>
				{/if}
				{label}
				{#if TrailingIcon}
					<TrailingIcon class="ml-auto" />
				{/if}
			</a>
			{#if children}
				<details class="open:*:text-body text-subtle">
					<summary
						class="border-neutral hover:bg-primary-100 focus-visible:bg-primary-100 focus-visible:hover:bg-primary-200 ml-auto flex size-12 cursor-pointer items-center justify-center border-l -outline-offset-2 lg:size-13"
					>
						<IconGoto />
					</summary>
					{#each children as childItem (childItem.href)}
						{@const {
							/* eslint-disable @typescript-eslint/no-unused-vars */
							children,
							/* eslint-disable @typescript-eslint/no-unused-vars */
							LeadingIcon: _1,
							/* eslint-disable @typescript-eslint/no-unused-vars */
							TrailingIcon: _2,
							...rest
						} = childItem}
						{@render menuItem({
							...rest,
							hasParent: true
						})}
					{/each}
				</details>
			{/if}
		</li>
	{/snippet}
	{#each MENU_ITEMS as item (item.href)}
		{@render menuItem(item)}
	{/each}
</ul>

<style lang="postcss">
	@reference 'tailwindcss';

	details[open] {
		& summary > :global(svg) {
			transform: rotate(180deg);
		}
	}
	.with-children {
		position: relative;

		& > a:first-child {
			position: absolute;
			top: 0;
			width: 100%;
			max-width: calc(100% - var(--spacing) * 12);

			@variant lg {
				max-width: calc(100% - var(--spacing) * 13);
			}
		}

		/*
		& summary + * {
			position: relative;

			&:after {
				position: absolute;
				content: '';
				top: 0;
				left: 0;
				width: calc(100% - var(--spacing) * 11 + 1px);
				height: 1px;
				background: var(--color-neutral);
			}
		}
		*/
	}
</style>
