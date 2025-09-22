<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { Locales, baseLocale, type LocaleCode } from '$lib/i18n/locales';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import librisLogo from '$lib/assets/img/libris-logo.svg';
	import AppSearch from './AppSearch.svelte';
	import IconMenu from '~icons/bi/list';
	import IconCloseMenu from '~icons/bi/x-lg';
	import IconBookmark from '~icons/bi/bookmark';
	import IconSearch from '~icons/bi/search';
	import IconLanguage from '~icons/bi/globe';
	import BetaBanner from '$lib/components/BetaBanner.svelte';
	import AppMenuContent from '$lib/components/AppMenuContent.svelte';

	let mounted: boolean = $state(false);
	let menuToggleElement: HTMLButtonElement | HTMLAnchorElement | undefined = $state();
	let menuDialogElement: HTMLDialogElement | undefined = $state();
	let expandedMenu = $state(page.url.hash === '#menu');
	let dismissableBanner: boolean = $state(false);
	let dismissedBanner: boolean = $state(false);

	const otherLangCode = $derived(
		Object.keys(Locales).find((locale) => locale !== page.data.locale) as LocaleCode
	);

	const showSearchInputOnMobile = $derived(
		page.route.id === '/(app)/[[lang=lang]]' || page.route.id === '/(app)/[[lang=lang]]/find'
	);

	const findActionUrl = $derived(
		page.data.locale === baseLocale ? '/find' : `/${page.data.locale}/find`
	);

	function handleDismissBanner() {
		dismissedBanner = true;
	}

	/*
	function handleExpandSearch() {
		superSearchWrapperComponent?.showExpandedSearch();
	}
	*/

	function showExpandedMenu() {
		menuDialogElement?.show();
		expandedMenu = true;
	}

	function closeExpandedMenu() {
		menuDialogElement?.close();
		expandedMenu = false;
	}

	function handleClickMenuAction(event: MouseEvent) {
		event.preventDefault();

		if (!menuDialogElement?.open) {
			showExpandedMenu();
		} else {
			closeExpandedMenu();
		}
	}

	function handleMenuDialogFocusOut(event: FocusEvent) {
		if (
			!menuDialogElement?.contains(event.relatedTarget as Element) &&
			!menuToggleElement?.contains(event.relatedTarget as Element)
		) {
			closeExpandedMenu();
		}
	}

	function handleClickSearchAction(event: MouseEvent) {
		event.preventDefault();
	}

	beforeNavigate(() => {
		closeExpandedMenu();
	});

	onMount(() => {
		mounted = true;
	});

	const IDs = {
		search: 'search',
		appBarMenu: 'app-bar-menu',
		appBarMenuLabel: 'app-bar-menu-label',
		appBarSearchLabel: 'app-bar-search-label',
		appBarChangeLangLabel: 'app-bar-change-lang-label'
	};

	$effect(() => {
		if (page.url.hash === '#menu' && mounted) {
			showExpandedMenu();
		}
	});
</script>

{#snippet actionItemContents({ Icon, label, id }: { Icon: Component; label: string; id?: string })}
	<div
		class="text-2xs text-subtle 3xl:text-sm 3xl:px-2.5 flex min-w-11 flex-col items-center gap-1.25 px-1 font-medium xl:text-xs"
	>
		<Icon class="3xl:size-5.5 size-5" />
		<p {id} class="sr-only lg:not-sr-only lg:whitespace-nowrap">
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
	<nav class="app-bar bg-app-header grid items-stretch">
		<ul class="leading-actions flex lg:gap-2">
			<li>
				<svelte:element
					this={mounted ? 'button' : 'a'}
					type={mounted ? 'button' : undefined}
					href={mounted ? undefined : page.data.localizeHref('/browse#menu')}
					role={mounted ? undefined : 'button'}
					tabindex={mounted ? undefined : 0}
					aria-current={mounted
						? undefined
						: (page.route.id === '/(app)/[[lang=lang]]/browse' && 'page') || undefined}
					aria-controls={IDs.appBarMenu}
					aria-expanded={(mounted && expandedMenu) || undefined}
					class="action lg:min-w-16"
					aria-label={page.data.t('header.menu')}
					aria-labelledby={IDs.appBarMenuLabel}
					onclick={handleClickMenuAction}
					onfocusout={handleMenuDialogFocusOut}
					bind:this={menuToggleElement}
				>
					{@render actionItemContents({
						Icon: expandedMenu ? IconCloseMenu : IconMenu,
						label: page.data.t('header.menu'),
						id: IDs.appBarMenuLabel
					})}
				</svelte:element>
				{#if mounted}
					<dialog
						id={IDs.appBarMenu}
						class="menu-dialog border-neutral border-t-primary fixed z-50 hidden w-full flex-col overflow-hidden border-b text-sm shadow-md open:flex sm:-left-1 sm:mx-2 sm:w-fit sm:min-w-64 sm:rounded-lg sm:rounded-b-lg sm:border"
						closedby="any"
						tabindex="-1"
						bind:this={menuDialogElement}
						onclose={closeExpandedMenu}
						onfocusout={handleMenuDialogFocusOut}
					>
						<AppMenuContent showSkipToContent={false} />
						<button
							type="button"
							onclick={closeExpandedMenu}
							class="bg-primary-50 focus:bg-primary-100 hover:bg-primary-100 border-neutral flex min-h-9 items-center justify-center gap-2 border-t text-xs sm:hidden"
						>
							<IconCloseMenu />
							{page.data.t('header.closeMenu')}
						</button>
					</dialog>
				{/if}
			</li>
			<li>
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
			</li>
		</ul>
		<search
			id={IDs.search}
			class={[
				showSearchInputOnMobile && 'flex pb-2 lg:pb-0',
				!showSearchInputOnMobile && 'hidden target:flex target:pb-2 lg:flex target:lg:pb-0', // enable toggling using target/anchor (so it also works when JavaScript is disabled)
				'items-center'
			]}
		>
			<form action={findActionUrl} class="mx-auto w-full max-w-7xl lg:px-4">
				<AppSearch id="search" name="_q" placeholder={page.data.t('header.searchPlaceholder')} />
			</form>
		</search>
		<ul class="trailing-actions flex justify-end lg:gap-2">
			<li class="lg:hidden">
				<svelte:element
					this={mounted ? 'button' : 'a'}
					type={mounted ? 'button' : undefined}
					href={mounted ? undefined : '#menu'}
					role={mounted ? undefined : 'button'}
					tabindex={mounted ? undefined : 0}
					class="action"
					onclick={handleClickSearchAction}
					aria-label={page.data.t('header.search')}
					aria-labelledby={IDs.appBarSearchLabel}
				>
					{@render actionItemContents({
						Icon: IconSearch,
						label: page.data.t('header.search'),
						id: IDs.appBarSearchLabel
					})}
				</svelte:element>
			</li>
			<li class="hidden lg:block">
				<a
					class="action"
					href={page.data.localizeHref(page.url.pathname + page.url.search + page.url.hash, {
						locale: otherLangCode
					})}
					hreflang={otherLangCode}
					aria-label={page.data.t('header.changeLang')}
					aria-labelledby={IDs.appBarChangeLangLabel}
				>
					{@render actionItemContents({
						Icon: IconLanguage,
						label: page.data.t('header.changeLang'),
						id: IDs.appBarChangeLangLabel
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
		grid-template-areas: var(--search-grid-template-areas);
		grid-template-rows: var(--app-bar-height);
		grid-template-columns: var(--search-grid-template-columns);
		padding: var(--search-padding);
		gap: var(--search-gap);
		box-shadow: 0 1px 0 0 var(--color-primary-200);
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

		&:focus-visible,
		&[aria-expanded] {
			background: var(--color-primary-200);
		}

		&:hover::after,
		&:focus-visible::after,
		&[aria-expanded]::after {
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

	.menu-dialog {
		top: calc(var(--app-bar-height, 0) + var(--banner-height, 0) + 1px);

		@variant sm {
			top: calc(var(--app-bar-height, 0) + var(--banner-height, 0) - 3px);
			border-top: 3px solid var(--color-primary);
		}
	}
</style>
