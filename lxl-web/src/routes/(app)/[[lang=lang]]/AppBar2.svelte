<script module>
	export const ID_SEARCH = 'appbar-search';
	export const ID_MENU = 'appbar-menu';
	export const ID_MENU_LABEL = 'appbar-menu-label';
	export const ID_SEARCH_LABEL = 'appbar-search-label';
	export const ID_CHANGE_LANG_LABEL = 'appbar-lang-label';
	export const ID_MY_PAGES_LABEL = 'appbar-mypages-label';
</script>

<script lang="ts">
	import { type Component, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { resolve } from '$app/paths';
	import { type LocaleCode, Locales } from '$lib/i18n/locales';
	import { page } from '$app/state';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { getSearchContext } from '$lib/contexts/search';
	import { getHomepageContext } from '$lib/contexts/homepage';
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
	const homepageContext = getHomepageContext();

	let mounted: boolean = $state(false);
	let menuDialogElement: HTMLDialogElement | undefined = $state();

	let expandedMenu = $state(page.url.hash === '#menu');
	let dismissedBanner: boolean = $derived(false); // $derived(page.data.dismissedBanner);

	const otherLangCode = $derived(
		Object.keys(Locales).find((locale) => locale !== page.data.locale) as LocaleCode
	);

	const isHomeRoute = $derived(page.route.id === '/(app)/[[lang=lang]]');
	const isFindRoute = $derived(page.route.id === '/(app)/[[lang=lang]]/find');
	const withMobileSearchInput = $derived(isHomeRoute || isFindRoute);

	const subset = $derived(page.data.subsetMapping);

	let allowTransition = $state(false);

	afterNavigate(() => {
		allowTransition = false;
	});

	$effect(() => {
		if (isHomeRoute && homepageContext.showSearchInAppBar) {
			allowTransition = true;
		}
	});

	let transitionDuration = $derived(allowTransition ? 100 : 0);

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
<header
	class={[
		'appbar @container sticky top-0 z-40',
		isHomeRoute && 'home',
		subset && 'subset',
		withMobileSearchInput && 'with-mobile-search-input'
	]}
>
	<nav class={['appbar-nav bg-appbar']} aria-label={`Libris ${page.data.t('appMenu.label')}`}>
		<ul class="leading-actions z-43 flex items-stretch lg:ml-0">
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
					class="action hover:bg-primary-200 aspect-square lg:min-w-16"
					aria-label={page.data.t('header.menu')}
					aria-labelledby={ID_MENU_LABEL}
					onclick={handleClickMenuAction}
					onfocusout={handleMenuDialogFocusOut}
				>
					{@render actionItemContents({
						Icon: expandedMenu ? IconCloseMenu : IconMenu,
						label: page.data.t('header.menu'),
						id: ID_MENU
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
							class="mb-1 h-auto w-22 min-w-20 sm:w-27.5 2xl:w-35.75"
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
		<div class="contents lg:hidden">
			{@render trailingActions({ mobile: true })}
		</div>
		<div class={['search', withMobileSearchInput ? 'block' : 'hidden lg:block']}>
			{#if !isHomeRoute || (isHomeRoute && homepageContext.showSearchInAppBar)}
				<div class="flex h-full items-center" transition:fade={{ duration: transitionDuration }}>
					<AppSearch id={ID_SEARCH} />
				</div>
			{/if}
		</div>
		<div class="contents">
			{@render trailingActions({ mobile: false })}
		</div>
		{#if mounted}
			<dialog
				id={ID_MENU}
				class="menu-dialog sm:border-neutral fixed z-50 hidden w-full flex-col text-sm shadow-md open:flex sm:w-fit sm:min-w-64 sm:rounded-md sm:border lg:min-w-72 lg:text-base 2xl:min-w-96"
				closedby="any"
				tabindex="-1"
				bind:this={menuDialogElement}
				onclose={closeExpandedMenu}
				onfocusout={handleMenuDialogFocusOut}
			>
				<AppMenuContent showSkipToContent={false} onclickSearch={handleClickSearchAction} />
				<div class="flex sm:hidden">
					<button
						type="button"
						onclick={closeExpandedMenu}
						class="focus:bg-primary-100 hover:bg-primary-100 flex min-h-12 w-full items-center justify-center gap-2 text-sm -outline-offset-2"
					>
						<IconCloseMenu />
						{page.data.t('header.closeMenu')}
					</button>
				</div>
			</dialog>
		{/if}
	</nav>
</header>

{#snippet trailingActions({ mobile }: { mobile: boolean })}
	{@const searchLabelId = mobile ? `${ID_SEARCH_LABEL}-mobile` : ID_SEARCH_LABEL}
	{@const changeLangLabelId = mobile ? `${ID_CHANGE_LANG_LABEL}-mobile` : ID_CHANGE_LANG_LABEL}
	{@const myPagesLabelId = mobile ? `${ID_MY_PAGES_LABEL}-mobile` : ID_MY_PAGES_LABEL}
	<ul class="trailing-actions z-42 flex w-full items-stretch justify-end">
		<li class={['lg:hidden', withMobileSearchInput && 'hidden']}>
			<svelte:element
				this={mounted ? 'button' : 'a'}
				type={mounted ? 'button' : undefined}
				href={mounted ? undefined : '#search'}
				role={mounted ? undefined : 'button'}
				tabindex={mounted ? undefined : 0}
				class="action hover:bg-primary-200 aspect-square sm:aspect-auto"
				onclick={handleClickSearchAction}
				aria-label={page.data.t('header.search')}
				aria-labelledby={searchLabelId}
			>
				{@render actionItemContents({
					Icon: IconSearch,
					label: page.data.t('header.search'),
					id: searchLabelId
				})}
			</svelte:element>
		</li>
		<li class="hover:bg-primary-200 hidden aspect-square sm:block sm:aspect-auto">
			<a
				class="action"
				href={resolve(
					page.data.localizeHref(page.url.pathname + page.url.search + page.url.hash, {
						locale: otherLangCode
					})
				)}
				hreflang={otherLangCode}
				aria-label={page.data.t('header.changeLang')}
				aria-labelledby={changeLangLabelId}
				data-testid="change-lang"
			>
				{@render actionItemContents({
					Icon: IconLanguage,
					label: page.data.t('header.changeLang'),
					id: changeLangLabelId
				})}
			</a>
		</li>
		<li>
			<a
				class="action hover:bg-primary-200 aspect-square sm:aspect-auto"
				href={resolve(page.data.localizeHref('/my-pages'))}
				aria-current={page.route.id?.endsWith('/my-pages') ? 'page' : undefined}
				aria-labelledby={myPagesLabelId}
			>
				{@render actionItemContents({
					Icon: IconBookmark,
					label: page.data.t('header.myPages'),
					id: myPagesLabelId
				})}
			</a>
		</li>
	</ul>
{/snippet}

{#snippet actionItemContents({ Icon, label, id }: { Icon: Component; label: string; id?: string })}
	<div
		class="3xl:px-2.5 text-subtle flex min-w-11 flex-col items-center gap-1 px-1 text-xs font-medium sm:gap-1.5 lg:gap-1 lg:text-sm 2xl:gap-1.5 2xl:text-base"
	>
		<Icon class="mt-0.5 size-5 sm:mt-1 lg:mt-0.5 2xl:mt-1 2xl:size-6" />
		<p {id} class="sr-only sm:not-sr-only sm:whitespace-nowrap">
			{label}
		</p>
	</div>
{/snippet}

<style lang="postcss">
	@reference "#app.css";
	.appbar-nav {
		display: grid;
		grid-template-areas: var(--appbar-template-areas);
		grid-template-columns: var(--appbar-template-columns);
		grid-template-rows: var(--appbar-template-rows);
		gap: var(--appbar-gap);
	}

	.leading-actions,
	.trailing-actions,
	search {
		min-height: var(--appbar-height);
		justify-items: stretch;
	}

	.leading-actions,
	.trailing-actions {
		& .action {
			@apply -outline-offset-2;
			height: 100%;

			@variant sm {
				@apply px-1;
			}

			@variant lg {
				@apply px-2;
			}
		}
	}
	.leading-actions {
		grid-area: leading-actions;
	}

	.trailing-actions {
		grid-area: trailing-actions;
	}

	.search {
		grid-area: search;
	}

	.action {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		@apply text-subtle;

		&:focus-visible,
		&[aria-expanded] {
			background: var(--color-primary-200);
			color: var(--color-primary-950);
		}

		@variant sm {
			height: var(--appbar-height);
			border-radius: 0;

			&:hover {
				&:not(:focus-visible),
				&:not([aria-expanded]) {
					// background: none;
				}
				&:focus-visible,
				&[aria-expanded] {
					background: var(--color-primary-300);
				}
			}

			&:hover::after,
			&:focus-visible::after,
			&[aria-expanded]::after {
				content: '';
				position: absolute;
				height: 4px;
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
