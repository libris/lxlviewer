<script lang="ts">
	import { type Component, onDestroy, onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { baseLocale, type LocaleCode, Locales } from '$lib/i18n/locales';
	import { displayMappingToString } from '$lib/utils/displayMappingToString';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import librisLogo from '$lib/assets/img/libris-logo.svg';
	import AppSearch from './AppSearch.svelte';
	import IconMenu from '~icons/bi/list';
	import IconCloseMenu from '~icons/bi/x-lg';
	import IconBookmark from '~icons/bi/bookmark';
	import IconSearch from '~icons/bi/search';
	import IconLanguage from '~icons/bi/globe';
	import IconAddFilter from '~icons/bi/plus-circle';
	import BetaBanner from '$lib/components/BetaBanner.svelte';
	import AppMenuContent from '$lib/components/AppMenuContent.svelte';
	import SearchMapping from '$lib/components/find/SearchMapping.svelte';
	import { getCategoryShortcuts } from '$lib/remotes/homepage.remote';

	let mounted: boolean = $state(false);
	let menuToggleElement: HTMLButtonElement | HTMLAnchorElement | undefined = $state();
	let menuDialogElement: HTMLDialogElement | undefined = $state();
	let backgroundSentinelElement: HTMLElement | undefined = $state();
	let backgroundObserver: IntersectionObserver | undefined = $state();
	let shadowSentinelElement: HTMLElement | undefined = $state();
	let shadowObserver: IntersectionObserver | undefined = $state();
	let appSearchComponent: AppSearch | undefined = $state();
	let expandedMenu = $state(page.url.hash === '#menu');
	let dismissableBanner: boolean = $state(false);
	let dismissedBanner: boolean = $state(false);
	let pageYOffset: number | undefined = $state();

	const otherLangCode = $derived(
		Object.keys(Locales).find((locale) => locale !== page.data.locale) as LocaleCode
	);

	const isHomeRoute = $derived(page.route.id === '/(app)/[[lang=lang]]');
	const isFindRoute = $derived(page.route.id === '/(app)/[[lang=lang]]/find');
	const showSearchInputOnMobile = $derived(isHomeRoute || isFindRoute);
	let showBackground = $derived(!isHomeRoute);
	let showShadow = $derived(!isHomeRoute);

	const findActionUrl = $derived(
		page.data.locale === baseLocale ? '/find' : `/${page.data.locale}/find`
	);

	const subset = $derived(page.data.subsetMapping);
	const subsetPlaceholder = $derived(subset && displayMappingToString(subset));

	function handleDismissBanner() {
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
		appSearchComponent?.showExpandedSearch({ cursorAtEnd: true });
	}

	function handleClickAddFilter() {
		appSearchComponent?.showExpandedSearch({ cursorAtEnd: true, focusRow: 1 });
	}

	function handleBackgroundObserve(entries: IntersectionObserverEntry[]) {
		if (entries[0].isIntersecting) {
			// const intersectionRatio = entries[0].intersectionRatio;
			showBackground = false;
		} else {
			showBackground = true;
		}
	}

	function handleShadowObserve(entries: IntersectionObserverEntry[]) {
		if (entries[0].isIntersecting) {
			showShadow = false;
		} else {
			showShadow = true;
		}
	}

	function initObservers() {
		disconnectObservers();
		if (isHomeRoute) {
			backgroundObserver = new IntersectionObserver(handleBackgroundObserve, {
				threshold: 0.87
			});
			shadowObserver = new IntersectionObserver(handleShadowObserve, { threshold: 0.5 });
			if (backgroundSentinelElement) {
				backgroundObserver.observe(backgroundSentinelElement);
			}
			if (shadowSentinelElement) {
				shadowObserver.observe(shadowSentinelElement);
			}
		}
	}

	function disconnectObservers() {
		backgroundObserver?.disconnect();
		shadowObserver?.disconnect();
	}

	beforeNavigate(() => {
		closeExpandedMenu();
	});

	afterNavigate(() => {
		initObservers();
	});

	onMount(() => {
		initObservers();
		mounted = true;
	});

	onDestroy(() => {
		disconnectObservers();
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
		class="text-subtle 3xl:px-2.5 flex min-w-11 flex-col items-center gap-1 px-1 text-[0.84375rem] font-medium @7xl:text-sm"
	>
		<Icon class="size-5" />
		<p {id} class="sr-only lg:not-sr-only lg:whitespace-nowrap">
			{label}
		</p>
	</div>
{/snippet}

<a
	href="#content"
	class="bg-primary-700 text-page fixed -top-full left-0 z-999 flex h-9 w-full items-center justify-center font-medium focus:top-0"
>
	{page.data.t('header.skipToContent')}
</a>
<!--
<div class="temp"></div>
<div class="temp3"></div>
-->
<header
	class={[
		'app-bar @container sticky z-40 grid',
		isHomeRoute && 'home',
		isHomeRoute && showBackground && 'bg-app-bar',
		isHomeRoute && showShadow && 'shadow-app-bar',
		!isHomeRoute && 'bg-app-bar shadow-app-bar',
		showSearchInputOnMobile && 'with-search'
	]}
>
	{#if !dismissedBanner}
		<BetaBanner ondismiss={dismissableBanner ? handleDismissBanner : undefined} />
	{/if}
	<nav class={['grid items-stretch', subset && 'with-subset']}>
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
					aria-controls={IDs.appBarMenu}
					aria-expanded={(mounted && expandedMenu) || undefined}
					class="action max-sm:hover:bg-primary-200 lg:min-w-16"
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
			</li>
			<li>
				<a
					class="action px-1.5"
					href={page.data.localizeHref(page.data.base)}
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
		<search
			id={IDs.search}
			class={[
				'@container z-41 mx-auto flex w-full max-w-7xl items-center px-2 sm:px-4 lg:z-43',
				isHomeRoute && 'home grid h-auto w-full',
				showSearchInputOnMobile && 'flex items-center',
				!showSearchInputOnMobile &&
					'hidden target:flex has-[dialog:open]:h-0 lg:flex lg:has-[dialog:open]:h-fit' // enable toggling using target/anchor (so it also works when JavaScript is disabled)
			]}
		>
			<form action={findActionUrl} class="mx-auto w-full min-w-0">
				{#if isHomeRoute}
					<hgroup
						class="absolute my-3 px-3 leading-snug @xl:mt-6 lg:@xl:my-3 lg:@xl:px-3 @3xl:leading-normal lg:@3xl:my-3 lg:@3xl:px-4 @5xl:my-4"
					>
						<h1
							id="page-title"
							class="my-1.5 font-serif text-[1.625rem] tracking-[-0.0125rem] italic lg:my-2 lg:text-[2.1875rem] @md:tracking-[-0.025rem] @lg:text-3xl @xl:my-2 @xl:text-[2.1875rem] @3xl:my-1.5 @3xl:text-[2.5rem] lg:@3xl:my-2 @5xl:my-4 @5xl:text-5xl"
						>
							{page.data.t('home.pageHeadingTitle')}
						</h1>
						<p
							id="page-description"
							class="text-subtle max-w-[40ch] font-serif text-base lg:text-lg @xl:text-lg @3xl:max-w-max @3xl:text-lg @5xl:text-xl"
						>
							<strong class="font-normal">Libris</strong>
							{page.data.t('home.pageHeadingDescription')}
						</p>
					</hgroup>
				{/if}
				<AppSearch
					id="search"
					name="_q"
					ariaLabelledBy={isHomeRoute ? 'page-title' : undefined}
					ariaDescribedBy={isHomeRoute ? 'page-description' : undefined}
					ariaLabel={!isHomeRoute ? page.data.t('header.search') : undefined}
					placeholder={subsetPlaceholder
						? `${page.data.t('header.searchSubsetPlaceholder')}: ${subsetPlaceholder}`
						: page.data.t('header.searchPlaceholder')}
					--page-y-offset={pageYOffset}
					bind:this={appSearchComponent}
				/>
			</form>
		</search>
		<ul class="trailing-actions z-42 flex w-full items-center justify-end lg:gap-2">
			<li class="lg:hidden">
				<svelte:element
					this={mounted ? 'button' : 'a'}
					type={mounted ? 'button' : undefined}
					href={mounted ? undefined : '#search'}
					role={mounted ? undefined : 'button'}
					tabindex={mounted ? undefined : 0}
					class="action max-sm:hover:bg-primary-200"
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
					data-testid="change-lang"
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
					class="action max-sm:hover:bg-primary-200"
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
	{#if isHomeRoute}
		<div
			class={['app-bar-background fixed top-0 left-0 z-41 w-full', showBackground && 'bg-app-bar']}
		></div>
	{/if}
</header>
{#if isHomeRoute}
	<figure class="home-intro-background absolute -z-20 w-full" bind:this={backgroundSentinelElement}>
		<!--
		<img
			src={placeholder}
			width="100"
			height="100"
			alt=""
			class="pointer-events-none h-full w-full  select-none"
		/>
		<figcaption class="text-3xs absolute right-3 bottom-3 opacity-50">
			Namn Namnsson, Lorem ipsum dolor (1924). Foto: Namn Namnsson
		</figcaption>
		-->
	</figure>
	<section class="search-shortcuts @container">
		<nav
			class="sticky mx-auto grid pt-3 pb-5 @5xl:pt-4 @5xl:pb-6"
			aria-label={page.data.t('home.searchShortcuts')}
		>
			<div class="filters @container mx-auto w-full max-w-7xl px-2 lg:px-4">
				<div class="mx-auto flex w-full items-center">
					<div
						tabindex="-1"
						class="filters-scroller scrollbar-hidden flex max-w-160 items-center overflow-x-scroll px-3 @3xl:px-4 @5xl:max-w-3xl"
					>
						<h2
							id="search-for"
							class="mr-3 hidden font-serif font-medium whitespace-nowrap italic @xl:block @5xl:text-[1.0625rem]"
						>
							{page.data.t('search.searchFor')}
						</h2>
						<ul class="flex gap-2 pr-3 text-xs @3xl:text-sm @5xl:text-[0.9375rem]">
							{#each await getCategoryShortcuts(page.data.locale) as category (category.id)}
								<li>
									<a
										href={page.data.localizeHref(category.href)}
										id={category.id}
										aria-labelledby="search-for {category.id}"
										class="btn-outlined text-primary-900 border-primary-600/75 focus-visible:bg-primary-200 hover:bg-primary-200/50 min-w-12 px-2 py-1.5 text-center whitespace-nowrap @xl:px-3 @xl:py-2 @3xl:min-w-14 @5xl:min-h-10 @5xl:min-w-16"
									>
										{category.label}
									</a>
								</li>
							{/each}
						</ul>
					</div>
					<div class="border-l border-l-neutral-300 pl-3 @3xl:ml-4.5">
						<button
							id="add-filter"
							type="button"
							class="text-primary-900 focus-visible:bg-primary-200 hover:bg-primary-200 hover:border-primary-200/50 focus-visible:border-primary-200 mr-4 flex min-w-14 items-center rounded-full px-3 py-2 text-center text-xs font-medium whitespace-nowrap @xl:font-normal @3xl:text-sm @5xl:min-h-10 @5xl:text-[0.9375rem]"
							aria-labelledby="add-label add-filter"
							onclick={handleClickAddFilter}
						>
							<IconAddFilter class="mr-2 hidden size-4 @xl:inline @5xl:size-4.5" />
							<span>
								<span id="add-label" class="hidden @xl:inline">{page.data.t('search.add')}</span>
								<span class="capitalize @xl:lowercase">
									{page.data.t('search.filter').toLowerCase()}
								</span>
							</span>
						</button>
					</div>
				</div>
			</div>
		</nav>
	</section>
	{#if isHomeRoute}
		<div class="app-bar-shadow-trigger" bind:this={shadowSentinelElement}></div>
	{/if}
{/if}

<style lang="postcss">
	@reference 'tailwindcss';
	.app-bar {
		--app-bar-shadows: 0 1px 0 0 var(--color-primary-200);
		margin-top: var(--banner-height, 0);
		top: var(--banner-height, 0);

		&.with-search {
			height: calc(var(--app-bar-height) * 2);

			@variant lg {
				height: var(--app-bar-height);
			}
		}
		@media (scripting: none) {
			background: var(--color-app-bar);
			box-shadow: none;
		}

		& > nav {
			grid-template-areas: var(--search-grid-template-areas);
			grid-template-columns: var(--search-grid-template-columns);
			grid-template-rows: var(--app-bar-height);
			gap: var(--search-gap);
			@variant lg {
				height: var(--app-bar-height);
			}
		}

		& .app-bar-background {
			height: var(--app-bar-height);
			top: var(--banner-height, 0);
		}
	}

	.home.app-bar {
		height: auto;
		--header-margin-top: round(
			calc(((73vh + var(--banner-height, 0) - var(--app-bar-height)) / 2)),
			1px
		);
		--header-margin-top: round(
			calc(((73svh + var(--banner-height, 0) - var(--app-bar-height)) / 2)),
			1px
		);
		margin-top: var(--header-margin-top);

		@variant lg {
			--header-margin-top: round(calc((73svh + var(--banner-height, 0)) / 2), 1px);
		}
	}
	.home-intro-background {
		top: var(--banner-height, 0);
		background: var(--color-app-bar);
		box-shadow: 0 1px 0 0 var(--color-primary-200);
		height: round(calc(73vh + var(--banner-height, 0)), 1px);
		height: round(calc(73svh + var(--banner-height, 0)), 1px);
	}

	.app-bar-shadow-trigger {
		position: relative;
		bottom: calc(var(--app-bar-height) + var(--banner-height, 0));
	}

	.search-shortcuts {
		height: round(calc((73vh + var(--banner-height, 0)) / 2 - var(--app-bar-height) / 2), 1px);
		height: round(calc((73svh + var(--banner-height, 0)) / 2 - var(--app-bar-height) / 2), 1px);

		& > nav {
			grid-template-areas: var(--search-grid-template-areas);
			grid-template-columns: var(--search-grid-template-columns);
			top: calc(var(--banner-height, 0) + var(--app-bar-height) * 2);
			gap: var(--search-gap);

			@variant lg {
				top: calc(var(--banner-height, 0) + var(--app-bar-height));
			}
		}
	}

	.leading-actions {
		position: fixed;
		top: var(--banner-height, 0);
		height: var(--app-bar-height);
		@apply left-2;
	}

	.trailing-actions {
		position: relative;
		top: var(--banner-height, 0);
		@apply right-2;
		position: fixed;
		height: var(--app-bar-height);
	}

	hgroup {
		bottom: var(--app-bar-height);
	}

	.leading-actions {
		grid-area: leading-actions;
	}

	search {
		grid-area: search;
		min-height: var(--app-bar-height);
	}

	.filters {
		grid-area: search;
	}

	.filters-scroller {
		position: relative;
		mask-image: linear-gradient(
			to right,
			rgba(0, 0, 0, 0) calc(var(--spacing) * 0),
			rgba(0, 0, 0, 1) calc(var(--spacing) * 3),
			rgba(0, 0, 0, 1) calc(100% - var(--spacing) * 8),
			rgba(0, 0, 0, 0) calc(100% - var(--spacing) * 3)
		);

		@variant @3xl {
			mask-image: linear-gradient(
				to right,
				rgba(0, 0, 0, 0) calc(var(--spacing) * 0),
				rgba(0, 0, 0, 1) calc(var(--spacing) * 4),
				rgba(0, 0, 0, 1) calc(100% - var(--spacing) * 9),
				rgba(0, 0, 0, 0) calc(100% - var(--spacing) * 3)
			);
		}
	}

	/* has-[dialog:open]:flex does not seem to work for Safari */
	search:global(:has(dialog[open])) {
		display: flex;
	}

	.trailing-actions {
		grid-area: trailing-actions;
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
			height: var(--app-bar-height);
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
		top: calc(var(--app-bar-height, 0) + var(--banner-height, 0));
		max-height: calc(100svh - calc(var(--app-bar-height, 0) + var(--banner-height, 0) + 1px));
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
			top: calc(var(--app-bar-height, 0) + var(--banner-height, 0) - 4px);
			max-height: calc(100vh - (calc(var(--app-bar-height, 0) + var(--banner-height, 0) - 3px)));
			max-height: calc(100svh - (calc(var(--app-bar-height, 0) + var(--banner-height, 0) - 3px)));
		}
	}

	.shadow-app-bar {
		box-shadow: var(--app-bar-shadows);
	}
	/* subset in header */
	.with-subset {
		--search-grid-template-columns: minmax(auto, 400px) minmax(0, 3fr) calc(var(--spacing) * 22);
		@variant lg {
			--search-grid-template-columns: minmax(auto, 400px) minmax(0, 3fr) calc(var(--spacing) * 30);
		}
		grid-template-columns: var(--search-grid-template-columns);
	}

	.app-bar :global(.search-mapping) {
		overflow-x: auto;
		scroll-behavior: smooth;
		scrollbar-width: none;
		padding-right: calc(var(--spacing) * 4);
	}

	.app-bar :global(.search-mapping .group) {
		flex-wrap: nowrap;
		max-width: none;
	}

	.app-bar :global(.search-mapping .pill),
	.subset-container :global(ul) {
		max-width: none;
	}

	.subset-container::after {
		content: '';
		position: absolute;
		top: -1px;
		right: 0;
		width: calc(var(--spacing) * 4);
		height: 100%;
		z-index: 1;
		pointer-events: none;
		background: linear-gradient(to right, transparent, var(--color-primary-100));
	}
</style>
