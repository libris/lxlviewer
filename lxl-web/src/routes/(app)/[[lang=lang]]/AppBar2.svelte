<script lang="ts">
	import { type Component, onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { baseLocale, type LocaleCode, Locales } from '$lib/i18n/locales';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import { getSearchContext } from '$lib/contexts/search';
	import librisLogo from '$lib/assets/img/libris-logo.svg';
	import AppSearch from './AppSearch.svelte';
	import IconMenu from '~icons/bi/list';
	import IconCloseMenu from '~icons/bi/x-lg';
	import IconBookmark from '~icons/bi/bookmark';
	import IconSearch from '~icons/bi/search';
	import IconLanguage from '~icons/bi/globe';
	import SkipToContent from '$lib/components/SkipToContent.svelte';
	import AppBanner from '$lib/components/AppBanner.svelte';
	import AppMenuContent from '$lib/components/AppMenuContent.svelte';
	import SearchMapping from '$lib/components/find/SearchMapping.svelte';

	import Cookies from 'js-cookie';

	const searchContext = getSearchContext();

	let mounted: boolean = $state(false);
	let menuDialogElement: HTMLDialogElement | undefined = $state();

	let expandedMenu = $state(page.url.hash === '#menu');
	let dismissedBanner: boolean = $derived(false); // $derived(page.data.dismissedBanner);

	const otherLangCode = $derived(
		Object.keys(Locales).find((locale) => locale !== page.data.locale) as LocaleCode
	);

	const isHomeRoute = $derived(page.route.id === '/(app)/[[lang=lang]]');
	const isFindRoute = $derived(page.route.id === '/(app)/[[lang=lang]]/find');
	const showSearchInputOnMobile = $derived(isHomeRoute || isFindRoute);

	const findActionUrl = $derived(
		page.data.locale === baseLocale ? '/find' : `/${page.data.locale}/find`
	);

	const subset = $derived(page.data.subsetMapping);

	function handleDismissBanner() {
		Cookies.set('dismissed-banner', 'true', {
			sameSite: 'strict'
		});
		dismissedBanner = true;
	}

	function showExpandedMenu() {
		menuDialogElement?.show();
		expandedMenu = true;
	}

	function closeExpandedMenu() {
		menuDialogElement?.close();

		expandedMenu = false;
	}

	function handleClickMenuAction() {
		if (!menuDialogElement?.open) {
			showExpandedMenu();
		} else {
			closeExpandedMenu();
		}
	}

	function handleMenuDialogFocusOut() {
		/*
		// This needs to be reworked
		if (
			!menuDialogElement?.contains(event.relatedTarget as Element) &&
			!menuToggleElement?.contains(event.relatedTarget as Element)
		) {
			closeExpandedMenu();
		}
		*/
	}

	function handleClickSearchAction(event: MouseEvent) {
		event.preventDefault();
		searchContext.showExpandedSearch({ cursorAtEnd: true });
	}

	beforeNavigate(() => {
		closeExpandedMenu();
	});

	onMount(() => {
		mounted = true;
	});

	const ID_SEARCH = 'appbar-search';
	const ID_MENU = 'appbar-menu';
	const ID_MENU_LABEL = 'appbar-menu-label';
	const ID_MOBILE_MENU_LABEL = 'appbar-mobile-menu-label';
	const ID_SEARCH_LABEL = 'appbar-search-label';
	const ID_CHANGE_LANG_LABEL = 'appbar-change-lang-label';

	$effect(() => {
		if (page.url.hash === '#menu' && mounted) {
			showExpandedMenu();
		}
	});
</script>

<SkipToContent />
{#if !dismissedBanner}
	<AppBanner ondismiss={handleDismissBanner} />
{/if}
<header class={['appbar @container sticky top-0 z-40', isHomeRoute && 'home', subset && 'subset']}>
	<nav class={['appbar-nav bg-appbar']} aria-label={`Libris ${page.data.t('appMenu.label')}`}>
		<div class="hidden lg:contents">
			{@render leadingActions()}
		</div>
		<div class="flex items-center justify-between lg:hidden">
			{@render leadingActions(true)}
			{@render trailingActions()}
		</div>
		{#if mounted}
			<dialog
				id={ID_MENU}
				class="menu-dialog sm:border-neutral fixed z-50 hidden w-full flex-col text-sm shadow-md open:flex sm:-left-1 sm:mx-2 sm:w-fit sm:min-w-64 sm:rounded-md sm:border"
				closedby="any"
				tabindex="-1"
				bind:this={menuDialogElement}
				onclose={closeExpandedMenu}
				onfocusout={handleMenuDialogFocusOut}
			>
				<div class="px-1 pt-1 sm:pb-1">
					<AppMenuContent showSkipToContent={false} onclickSearch={handleClickSearchAction} />
				</div>
				<div class="flex px-1 pb-1 sm:hidden">
					<button
						type="button"
						onclick={closeExpandedMenu}
						class="bg-primary-50 focus:bg-primary-100 hover:bg-primary-100 flex min-h-9 w-full items-center justify-center gap-2 text-xs"
					>
						<IconCloseMenu />
						{page.data.t('header.closeMenu')}
					</button>
				</div>
			</dialog>
		{/if}
		{@render search()}
		<div class="hidden lg:contents">
			{@render trailingActions()}
		</div>
	</nav>
</header>

{#snippet leadingActions(mobile?: true)}
	<ul class="leading-actions z-43 ml-2 flex items-center lg:ml-0 lg:gap-2">
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
				aria-controls={ID_MENU}
				aria-haspopup="dialog"
				aria-expanded={(mounted && expandedMenu) || undefined}
				class="action max-sm:hover:bg-primary-200 lg:min-w-16"
				aria-label={page.data.t('header.menu')}
				aria-labelledby={mobile ? ID_MOBILE_MENU_LABEL : ID_MENU_LABEL}
				onclick={handleClickMenuAction}
				onfocusout={handleMenuDialogFocusOut}
			>
				{@render actionItemContents({
					Icon: expandedMenu ? IconCloseMenu : IconMenu,
					label: page.data.t('header.menu'),
					id: mobile ? ID_MOBILE_MENU_LABEL : ID_MENU
				})}
			</svelte:element>
		</li>
		<li>
			<a
				class="action px-1.5"
				href={resolve(page.data.localizeHref(page.data.base))}
				aria-current={page.route.id === '/(app)/[[lang=lang]]' ? 'page' : undefined}
				data-testid="home"
			>
				{#if page.data.siteName}
					<span class="text-2xl font-medium">
						{page.data.siteName}
					</span>
				{:else}
					<img
						src={librisLogo}
						width={275}
						height={75}
						alt="Libris"
						class="3xl:w-30.25 mb-1 h-auto w-22 min-w-20 lg:w-27.5"
					/>
				{/if}
			</a>
		</li>
		{#if subset}
			<li class="subset-container relative flex items-center overflow-hidden">
				<p class="pr-2">/</p>
				<SearchMapping mapping={subset} />
			</li>
		{/if}
	</ul>
{/snippet}

{#snippet search()}
	<search
		id={ID_SEARCH}
		class={[
			'@container z-41 mx-auto flex w-full max-w-7xl items-center px-2 sm:px-4 lg:z-43',
			isHomeRoute && 'home grid h-auto w-full',
			showSearchInputOnMobile && 'flex items-center',
			!showSearchInputOnMobile &&
				'hidden target:flex has-[dialog:open]:h-0 lg:flex lg:has-[dialog:open]:h-fit' // enable toggling using target/anchor (so it also works when JavaScript is disabled)
		]}
	>
		<form id="search-form" action={findActionUrl} class="mx-auto w-full min-w-0">
			<AppSearch />
		</form>
	</search>
{/snippet}

{#snippet trailingActions()}
	<ul class="trailing-actions z-42 flex w-full items-center justify-end lg:gap-2">
		<li class={['lg:hidden', showSearchInputOnMobile && 'hidden']}>
			<svelte:element
				this={mounted ? 'button' : 'a'}
				type={mounted ? 'button' : undefined}
				href={mounted ? undefined : '#search'}
				role={mounted ? undefined : 'button'}
				tabindex={mounted ? undefined : 0}
				class="action max-sm:hover:bg-primary-200"
				onclick={handleClickSearchAction}
				aria-label={page.data.t('header.search')}
				aria-labelledby={ID_SEARCH_LABEL}
			>
				{@render actionItemContents({
					Icon: IconSearch,
					label: page.data.t('header.search'),
					id: ID_SEARCH_LABEL
				})}
			</svelte:element>
		</li>
		<li class="hidden lg:block">
			<a
				class="action"
				href={resolve(
					page.data.localizeHref(page.url.pathname + page.url.search + page.url.hash, {
						locale: otherLangCode
					})
				)}
				hreflang={otherLangCode}
				aria-label={page.data.t('header.changeLang')}
				aria-labelledby={ID_CHANGE_LANG_LABEL}
				data-testid="change-lang"
			>
				{@render actionItemContents({
					Icon: IconLanguage,
					label: page.data.t('header.changeLang'),
					id: ID_CHANGE_LANG_LABEL
				})}
			</a>
		</li>
		<li>
			<a
				class="action max-sm:hover:bg-primary-200"
				href={resolve(page.data.localizeHref('/my-pages'))}
				aria-current={page.route.id?.endsWith('/my-pages') ? 'page' : undefined}
			>
				{@render actionItemContents({
					Icon: IconBookmark,
					label: page.data.t('header.myPages')
				})}
			</a>
		</li>
	</ul>
{/snippet}

{#snippet actionItemContents({ Icon, label, id }: { Icon: Component; label: string; id?: string })}
	<div
		class="text-subtle 3xl:px-2.5 flex min-w-11 flex-col items-center gap-1 px-1 text-[0.84375rem] font-medium @7xl:text-sm"
	>
		<Icon class="size-5" />
		<p {id} class="sr-only lg:not-sr-only lg:whitespace-nowrap">
			{label}
		</p>
	</div>
{/snippet}

<style lang="postcss">
	@reference 'tailwindcss';

	.appbar {

		--home-header-height: 61.803vh;
		--home-header-height: 61.803svh;
		--home-header-margin: round(
			calc(var(--home-header-height) / 2 - var(--appbar-height) / 2),
			1px
		);

		@variant lg {
			--appbar-height: 76px;
			--search-input-height: 48px;
			--appbar-grid-template-areas: 'leading-actions search trailing-actions';
			--appbar-grid-template-columns: 1fr minmax(0, 3fr) 1fr;
			/* --appbar-grid-template-rows: var(--appbar-height); */
		}
	}

	nav {
		display: grid;
		grid-template-rows: var(--appbar-height) var(--appbar-height);
		gap: var(--appbar-gap);

		@variant lg {
			grid-template-areas: var(--appbar-grid-template-areas);
			grid-template-columns: var(--appbar-grid-template-columns);
			grid-template-rows: var(--appbar-height);
		}
	}

	.leading-actions,
	.trailing-actions,
	search {
		min-height: var(--appbar-height);
		justify-items: stretch;
	}

	.leading-actions {
		grid-area: leading-actions;

		@variant lg {
			@apply pl-2;
		}
	}

	.trailing-actions {
		grid-area: trailing-actions;
		@apply pr-2;
	}

	search {
		grid-area: search;
	}

	.home search {
		// display: none;
	}

	.action {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: calc(var(--spacing) * 11);
		border-radius: var(--radius-md);

		&:focus-visible,
		&[aria-expanded] {
			background: var(--color-primary-200);
		}

		@variant sm {
			height: var(--appbar-height);
			border-radius: 0;

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
				border-radius: var(--radius-md) var(--radius-md) 0 0;
			}
		}
	}

	.menu-dialog {
		top: var(--appbar-height, 0);
		max-height: calc(100vh - calc(var(--appbar-height, 0) + 1px));
		max-height: calc(100svh - calc(var(--appbar-height, 0) + 1px));
		overflow-y: auto;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			width: 100%;
			height: 3px;
			background: var(--color-primary);
			pointer-events: none;
		}

		@variant sm {
			top: calc(var(--appbar-height, 0) - 4px);
			max-height: calc(100vh - (calc(var(--appbar-height, 0) - 3px)));
			max-height: calc(100svh - (calc(var(--appbar-height, 0) - 3px)));
		}
	}
</style>
