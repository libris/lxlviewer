<script lang="ts">
	import { type Component, type SvelteComponent } from 'svelte';
	import { Locales } from '$lib/i18n/locales';
	import { page } from '$app/state';
	// import { beforeNavigate } from '$app/navigation';
	import librisLogo from '$lib/assets/img/libris-logo.svg';
	import SuperSearchWrapper from '$lib/components/supersearch/SuperSearchWrapper.svelte';
	import IconMenu from '~icons/bi/list';
	import IconMyPages from '~icons/bi/person-circle';
	import IconBookmark from '~icons/bi/bookmark';
	import IconSearch from '~icons/bi/search';
	import IconLanguage from '~icons/bi/globe';
	import BetaBanner from '$lib/components/BetaBanner.svelte';

	let bannerOffsetHeight: number = $state(0);
	let superSearchWrapperComponent: SvelteComponent | undefined = $state();

	const otherLangCode = $derived(
		Object.keys(Locales).find((locale) => locale !== page.data.locale)
	);

	const showSearchInputOnMobile = $derived(
		page.route.id === '/(app)/[[lang=lang]]' || page.route.id === '/(app)/[[lang=lang]]/find'
	);

	/*
	const isLandingPage = $derived(page.route.id === '/(app)/[[lang=lang]]');


	beforeNavigate(({ from, to }) => {
		if (from?.url.pathname !== to?.url.pathname) {
			showHeaderMenu = false;
		}
	});

	function handleExpandSearch() {
		superSearchWrapperComponent?.showExpandedSearch();
	}
	*/
</script>

{#snippet actionItemContents({
	Icon,
	label,
	classes
}: {
	Icon: Component;
	label: string;
	classes?: string;
})}
	<div
		class={[
			'action text-3xs text-subtle xl:text-2xs 3xl:text-xs 3xl:gap-1.5 relative flex min-w-11 flex-col items-center justify-center gap-1.25 px-2.5 font-medium lg:min-w-11 xl:gap-1',
			classes
		]}
	>
		<Icon class="3xl:size-5.5 size-5" />
		<p class="sr-only font-medium whitespace-nowrap! lg:not-sr-only">{label}</p>
	</div>
{/snippet}

<BetaBanner bind:offsetHeight={bannerOffsetHeight} />
<header class={['app-bar bg-app-header sticky top-0 z-20 grid items-stretch gap-x-3 px-2 lg:px-3']}>
	<div class="leading-actions flex items-stretch">
		<a href="menu" class="flex items-stretch">
			{@render actionItemContents({
				Icon: IconMenu,
				label: page.data.t('header.menu'),
				classes: 'lg:w-16 [&_svg]:size-6 3xl:[&_svg]:size-7'
			})}
		</a>
		<a
			class="3xl:px-3 inline-flex h-full items-center px-1 lg:px-1.5"
			href={page.data.localizeHref(page.data.base)}
		>
			<img
				src={librisLogo}
				width={275}
				height={75}
				alt="Libris"
				class="3xl:w-33 mb-1 h-auto w-22 lg:w-28"
			/>
		</a>
	</div>
	<search
		id="search"
		class={[
			showSearchInputOnMobile && 'flex pb-2 lg:pb-0',
			!showSearchInputOnMobile && 'hidden target:flex target:pb-2 lg:flex target:lg:pb-0', // enable toggling using target/anchor (so it also works when JavaScript is disabled)
			'items-center'
		]}
	>
		<div class="mx-auto w-full max-w-7xl">
			<SuperSearchWrapper
				placeholder={page.data.t('header.searchPlaceholder')}
				--offset-top={`${bannerOffsetHeight}px`}
				bind:this={superSearchWrapperComponent}
			/>
		</div>
	</search>
	<nav class="trailing-actions flex justify-end text-nowrap">
		<ul class="flex items-stretch">
			<!--
			<li class="text-4xs mr-2 hidden items-center xl:flex">
				<a
					href="/en"
					class=" bg-primary-500/10 link-subtle flex items-center gap-1.5 rounded-sm  px-1.5 py-1"
					><IconLanguage class="size-3" />In English</a
				>
			</li>
			-->
			{#snippet actionItem({
				Icon,
				label,
				href,
				currentPage,
				classes
			}: {
				Icon: Component;
				label: string;
				href: string;
				currentPage?: boolean;
				classes?: string;
			})}
				<li class={['flex items-stretch', classes]}>
					<a
						{href}
						class="flex min-w-11 flex-col items-center justify-center"
						aria-current={currentPage ? 'page' : undefined}
					>
						{@render actionItemContents({ Icon, label })}
					</a>
				</li>
			{/snippet}
			{@render actionItem({
				Icon: IconLanguage,
				href: page.data.localizeHref(page.url.pathname + page.url.search + page.url.hash, {
					locale: otherLangCode
				}),
				label: page.data.t('header.changeLang'),
				classes: 'hidden lg:flex'
			})}
			{@render actionItem({
				Icon: IconBookmark,
				href: page.data.localizeHref('/my-pages'),
				label: page.data.t('header.saved'),
				currentPage: page.route.id?.endsWith('saved')
			})}
			{@render actionItem({
				Icon: IconMyPages,
				href: page.data.localizeHref('/my-pages'),
				label: page.data.t('header.login'),
				currentPage: page.route.id?.endsWith('my-pages')
			})}
			{@render actionItem({
				Icon: IconSearch,
				href: '#search',
				label: page.data.t('header.search'),
				classes: 'lg:hidden'
			})}
		</ul>
	</nav>
</header>

<style lang="postcss">
	@reference 'tailwindcss';

	.app-bar {
		grid-template-areas:
			'leading-actions trailing-actions trailing-actions'
			'search search search';
		grid-template-rows: var(--app-bar-height);
		grid-template-columns: auto 1fr 1fr;
		box-shadow: 0 1px 0 0 var(--color-primary-200);

		@variant lg {
			--grid-template-areas: 'leading-actions search trailing-actions';
			--grid-template-columns: 1fr minmax(0, 3fr) 1fr;
			grid-template-areas: var(--grid-template-areas);
			grid-template-rows: var(--app-bar-height);
			grid-template-columns: var(--grid-template-columns);
		}

		& a {
			position: relative;
			z-index: 1;
			&:hover {
				background: rgba(var(--color-primary-200), 0.5);
			}
			&:hover::after {
				content: '';
				position: absolute;
				width: calc(var(--spacing) * 10);
				height: calc(var(--spacing) * 10);
				aspect-ratio: 1 / 1;
				background: var(--color-primary-200);
				border-radius: 9999px;
				pointer-events: none;
				z-index: -1;
			}

			@variant lg {
				&:hover::after,
				&:focus::after {
					height: 3px;
					bottom: 0;
					background: var(--color-primary);
					width: calc(100% - 2px);
					border-radius: 20px 20px 0 0;
				}
			}
		}
	}

	.leading-actions {
		grid-area: leading-actions;
	}

	search {
		grid-area: search;
	}

	.trailing-actions {
		grid-area: trailing-actions;
	}

	.action {
	}
</style>
