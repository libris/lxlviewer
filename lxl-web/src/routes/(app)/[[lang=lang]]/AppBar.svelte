<script lang="ts">
	import { type Component, type SvelteComponent } from 'svelte';
	import { Locales } from '$lib/i18n/locales';
	import { page } from '$app/state';
	// import { beforeNavigate } from '$app/navigation';
	import librisLogo from '$lib/assets/img/libris-logo.svg';
	import SuperSearchWrapper from '$lib/components/supersearch/SuperSearchWrapper.svelte';
	import IconMenu from '~icons/bi/list';
	import IconBookmark from '~icons/bi/bookmark';
	import IconSearch from '~icons/bi/search';
	import IconLanguage from '~icons/bi/globe';
	import BetaBanner from '$lib/components/BetaBanner.svelte';

	let dismissableBanner: boolean = $state(false);
	let dismissedBanner: boolean = $state(false);
	let superSearchWrapperComponent: SvelteComponent | undefined = $state();

	const otherLangCode = $derived(
		Object.keys(Locales).find((locale) => locale !== page.data.locale)
	);

	const showSearchInputOnMobile = $derived(
		page.route.id === '/(app)/[[lang=lang]]' || page.route.id === '/(app)/[[lang=lang]]/find'
	);

	function handleDismissBanner() {
		dismissedBanner = true;
	}
	/*
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

{#snippet actionItemContents({ Icon, label }: { Icon: Component; label: string })}
	<div
		class="text-2xs text-subtle 3xl:text-sm 3xl:px-2.5 flex min-w-11 flex-col items-center gap-1.25 px-1.5 font-medium xl:text-xs"
	>
		<Icon class="3xl:size-5.5 size-5" />
		<p class="sr-only lg:not-sr-only lg:whitespace-nowrap">
			{label}
		</p>
	</div>
{/snippet}

<a
	href="#content"
	class="bg-primary-700 text-page fixed -top-full left-0 z-50 flex h-9 w-full items-center justify-center font-medium focus:top-0"
>
	{page.data.t('header.skipToContent')}
</a>
<header class="sticky top-0 z-40">
	{#if !dismissedBanner}
		<BetaBanner ondismiss={dismissableBanner ? handleDismissBanner : undefined} />
	{/if}
	<nav class="app-bar bg-app-header grid items-stretch gap-x-3 px-2">
		<div class="leading-actions flex">
			<a class="action lg:min-w-16" href="#menu">
				{@render actionItemContents({
					Icon: IconMenu,
					label: page.data.t('header.menu')
				})}
			</a>
			<a
				class="action px-1.5"
				href={page.data.localizeHref(page.data.base)}
				aria-current={page.route.id === '/(app)/[[lang=lang]]' ? 'page' : undefined}
			>
				<img
					src={librisLogo}
					width={275}
					height={75}
					alt="Libris"
					class="3xl:w-30.25 mb-1 h-auto w-22 lg:w-27.5"
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
					bind:this={superSearchWrapperComponent}
				/>
			</div>
		</search>
		<ul class="trailing-actions flex justify-end">
			<li class="lg:hidden">
				<a class="action" href="#search">
					{@render actionItemContents({
						Icon: IconSearch,
						label: page.data.t('header.search')
					})}
				</a>
			</li>
			<li class="hidden lg:block">
				<a
					class="action"
					href={page.data.localizeHref(page.url.pathname + page.url.search + page.url.hash, {
						locale: otherLangCode
					})}
					hreflang={otherLangCode}
				>
					{@render actionItemContents({
						Icon: IconLanguage,
						label: page.data.t('header.changeLang')
					})}
				</a>
			</li>
			<li>
				<a
					class="action"
					href={page.data.localizeHref('/my-pages')}
					aria-current={page.route.id?.endsWith('/my-pages') ? 'page' : undefined}
				>
					{@render actionItemContents({
						Icon: IconBookmark,
						label: page.data.t('header.saved')
					})}
				</a>
			</li>
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
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: var(--app-bar-height);

		&:focus {
			background: var(--color-primary-200);
		}

		&:hover::after,
		&:focus::after {
			content: '';
			position: absolute;
			height: 3px;
			bottom: 0;
			left: 0;
			background: var(--color-primary);
			width: 100%;
			border-radius: 20px 20px 0 0;
		}
	}
</style>
