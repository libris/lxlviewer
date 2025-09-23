<script lang="ts">
	import { type Component } from 'svelte';
	import { page } from '$app/state';
	import { Locales, type LocaleCode } from '$lib/i18n/locales';
	import IconHome from '~icons/bi/house';
	import IconSearch from '~icons/bi/search';
	import IconSaved from '~icons/bi/bookmark';
	import IconChangeLang from '~icons/bi/globe';
	import IconGoto from '~icons/bi/chevron-down';

	type Props = {
		showSkipToContent?: boolean;
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
	};

	let { showSkipToContent = true }: Props = $props();

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
			currentPage: page.route.id === '/(app)/[[lang=lang]]/help'
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
					href: '#cookies',
					label: page.data.t('appMenu.cookies')
				},
				{
					href: 'https://www.kb.se/om-oss/tillganglighet-pa-kbs-webbplatser-och-digitala-tjanster.html',
					label: page.data.t('appMenu.accessibility')
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

<ul class="w-full">
	{#snippet menuItem({
		href,
		label,
		LeadingIcon,
		TrailingIcon,
		currentPage,
		hreflang,
		children,
		hasParent
	}: MenuItem)}
		<li class={[!hasParent && 'border-neutral not-last:border-b', children && 'with-children']}>
			<a
				{href}
				aria-current={currentPage ? 'page' : undefined}
				class={[
					'text-body hover:bg-primary-50 focus-visible:bg-primary-50 focus-visible:hover:bg-primary-100 flex min-h-11 items-center px-3 hover:underline focus-visible:underline',
					LeadingIcon && 'pl-0',
					hasParent && 'pl-10 text-sm'
				]}
				{hreflang}
			>
				{#if LeadingIcon}
					<span
						class={[
							'text-subtle inline-flex w-10 items-center justify-center',
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
				<details>
					<summary
						class="border-neutral hover:bg-primary-50 focus-visible:bg-primary-50 focus-visible:hover:bg-primary-100 ml-auto flex size-11 cursor-pointer items-center justify-center border-l"
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
			max-width: calc(100% - var(--spacing) * 11);
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
