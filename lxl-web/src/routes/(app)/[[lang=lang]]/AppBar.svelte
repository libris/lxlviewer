<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { type Component, onDestroy, onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { afterNavigate } from '$app/navigation';
	import { baseLocale, type LocaleCode, Locales } from '$lib/i18n/locales';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import { getSearchContext } from '$lib/contexts/search';
	import AppSearch from './AppSearch.svelte';
	import AppMenuContent from '$lib/components/AppMenuContent.svelte';
	import SearchMapping from '$lib/components/find/SearchMapping.svelte';
	import IconMenu from '~icons/bi/list';
	import IconCloseMenu from '~icons/bi/x-lg';
	import IconBookmark from '~icons/bi/bookmark';
	import IconSearch from '~icons/bi/search';
	import IconLanguage from '~icons/bi/globe';
	import IconFjarrlan from '$lib/assets/img/fjarrlan.svg';

	const searchContext = getSearchContext();

	let mounted: boolean = $state(false);
	let menuToggleElement: HTMLButtonElement | HTMLAnchorElement | undefined = $state();
	let menuDialogElement: HTMLDialogElement | undefined = $state();
	let backgroundSentinelElement: HTMLElement | undefined = $state();
	let backgroundObserver: IntersectionObserver | undefined = $state();
	let shadowSentinelElement: HTMLElement | undefined = $state();
	let shadowObserver: IntersectionObserver | undefined = $state();
	let expandedMenu = $state(page.url.hash === '#menu');
	let librisSession: string | undefined = $state(page.data.librisSession);

	const otherLangCode = $derived(
		Object.keys(Locales).find((locale) => locale !== page.data.locale) as LocaleCode
	);

	const otherLangLink = $derived.by(() => {
		const search = page.url.searchParams.toString();

		return page.data.localizeHref(
			page.url.pathname + (search ? `?${search}` : '') + page.url.hash,
			{
				locale: otherLangCode
			}
		);
	});

	const isHomeRoute = $derived(page.route.id === '/(app)/[[lang=lang]]');
	const isFindRoute = $derived(page.route.id === '/(app)/[[lang=lang]]/find');
	const showSearchInputOnMobile = $derived(isHomeRoute || isFindRoute);
	let showBackground = $derived(!isHomeRoute);
	let showShadow = $derived(!isHomeRoute);
	let showSearchIcon = $derived(!isHomeRoute && !isFindRoute);

	const findActionUrl = $derived(
		page.data.locale === baseLocale ? '/find' : `/${page.data.locale}/find`
	);

	const subset = $derived(page.data.subsetMapping);

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

	function handleClickPageTitle() {
		if (window.getSelection()?.type === 'Caret') {
			searchContext.showExpandedSearch({ cursorAtEnd: true });
		}
	}

	function handleClickSearchAction(event: MouseEvent) {
		event.preventDefault();
		searchContext.showExpandedSearch({ cursorAtEnd: true });
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
		search: 'app-bar-search',
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

{#snippet actionItemContents({
	Icon,
	label,
	id
}: {
	Icon: Component | string;
	label: string;
	id?: string;
})}
	<div
		class="text-subtle 3xl:px-2.5 flex min-w-11 flex-col items-center gap-1 px-1 text-[0.84375rem] font-medium @7xl:text-sm"
	>
		{#if typeof Icon === 'function'}
			<Icon class="size-5" />
		{:else if typeof Icon === 'string' && Icon.startsWith('data:image/svg+xml')}
			<img src={Icon} alt="" />
		{/if}
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
	<nav
		class={['grid items-stretch', subset && 'with-subset']}
		aria-label={`Libris ${page.data.t('appMenu.label')}`}
	>
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
					aria-haspopup="dialog"
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
				{#if subset}
					<div
						class="flex items-center gap-1 lg:flex-col lg:items-start @min-[110rem]:flex-row @min-[110rem]:items-center @min-[110rem]:gap-1"
					>
						<a
							class={'px-1.5'}
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
									src="/libris-logo.svg"
									width={275}
									height={75}
									alt="Libris"
									class={[
										'3xl:w-30.25 mb-1 h-auto w-22 min-w-20 lg:w-18 lg:min-w-18 @min-[110rem]:w-22 @min-[110rem]:min-w-22'
									]}
								/>
							{/if}
						</a>
						<div class="subset-container relative flex items-center overflow-hidden">
							<p class="text-subtle block pr-2 lg:hidden @min-[110rem]:block">/</p>
							<SearchMapping mapping={subset} />
						</div>
					</div>
				{:else}
					<a
						class={'action px-1.5'}
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
								src="/libris-logo.svg"
								width={275}
								height={75}
								alt="Libris"
								class={['3xl:w-30.25 mb-1 h-auto w-22 min-w-20 lg:w-27.5', subset && 'w-20!']}
							/>
						{/if}
					</a>
				{/if}
			</li>
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
			<form id="search-form" action={findActionUrl} class="mx-auto w-full min-w-0">
				{#if isHomeRoute}
					<hgroup
						class="absolute my-3 px-3 leading-snug @xl:mt-6 lg:@xl:my-3 lg:@xl:px-3 @3xl:leading-normal lg:@3xl:my-3 lg:@3xl:px-4 @5xl:my-4"
					>
						<h1
							class="my-1.5 font-serif text-[1.625rem] tracking-[-0.0125rem] lg:my-2 lg:text-[2.1875rem] @md:tracking-[-0.025rem] @lg:text-3xl @xl:my-2 @xl:text-[2.1875rem] @3xl:my-1.5 @3xl:text-[3rem] lg:@3xl:my-2 @5xl:my-4 @5xl:text-5xl"
						>
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
							<label
								id="page-title"
								for="supersearch-collapsed-combobox"
								onclick={handleClickPageTitle}
							>
								{page.data.t('home.pageHeadingTitle')}
								{#if page.data.t('home.pageHeadingTitleNoWrap') !== 'home.pageHeadingTitleNoWrap'}
									<span class="whitespace-nowrap">
										{page.data.t('home.pageHeadingTitleNoWrap')}
									</span>
								{/if}
							</label>
						</h1>
					</hgroup>
				{/if}
				<AppSearch id="app-search" />
			</form>
		</search>
		<ul class="trailing-actions z-42 flex w-full items-center justify-end lg:gap-2">
			<li class={['lg:hidden', !showSearchIcon && 'hidden']}>
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
					href={resolve(otherLangLink)}
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
			<!-- fjärrlån -->
			{#if librisSession}
				<li>
					<a
						class="action bg-primary-800 max-sm:hover:bg-primary-800"
						href={`${env.PUBLIC_FJARRLAN_URL}/lf.php`}
					>
						{@render actionItemContents({
							Icon: IconFjarrlan,
							label: page.data.t('header.fjarrlan'),
							id: 'action-fjarrlan'
						})}
					</a>
				</li>
			{/if}
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
	</nav>
	{#if isHomeRoute}
		<div
			class={['app-bar-background fixed top-0 left-0 z-41 w-full', showBackground && 'bg-app-bar']}
		></div>
	{/if}
</header>
{#if isHomeRoute}
	<figure
		class={['home-intro-background absolute -z-20 w-full']}
		bind:this={backgroundSentinelElement}
	>
		<!--
		<img
			src={placeholder}
			width="100"
			height="100"
			alt=""
			class="pointer-events-none h-full w-full  select-none"
		>
		<figcaption class="text-3xs absolute right-3 bottom-3 opacity-50">
			Namn Namnsson, Lorem ipsum dolor (1924). Foto: Namn Namnsson
		</figcaption>
		-->
	</figure>
	<section class="page-description-container @container" aria-labelledby="page-description">
		<div class="sticky mx-auto grid pb-4 @5xl:pb-5 @7xl:pt-3">
			<div
				class="page-description mx-auto mt-4.5 w-full max-w-7xl px-4.5 sm:px-7.5 lg:mt-3 lg:px-7.5 @5xl:mt-4.5"
			>
				<h2 id="page-description" class="text-subtle font-serif text-lg @7xl:text-xl">
					Libris
					{page.data.t('home.pageHeadingDescription')}
					{#if page.data.t('home.pageHeadingDescriptionNoWrap') !== 'home.pageHeadingDescriptionNoWrap'}
						<span class="whitespace-nowrap">
							{page.data.t('home.pageHeadingDescriptionNoWrap')}
						</span>
					{/if}
				</h2>
			</div>
		</div>
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
			calc(((61.08vh + var(--banner-height, 0px) - var(--app-bar-height)) / 2)),
			1px
		);
		--header-margin-top: round(
			calc(((61.08svh + var(--banner-height, 0px) - var(--app-bar-height)) / 2)),
			1px
		);
		margin-top: var(--header-margin-top);

		@variant lg {
			--header-margin-top: round(calc((61.08svh + var(--banner-height, 0)) / 2), 1px);
		}
	}

	.home-intro-background {
		top: var(--banner-height, 0);
		background: var(--color-app-bar);
		box-shadow: 0 1px 0 0 var(--color-primary-200);
		height: round(calc(61.08vh + var(--banner-height, 0)), 1px);
		height: round(calc(61.08svh + var(--banner-height, 0)), 1px);
	}

	.app-bar-shadow-trigger {
		position: relative;
		bottom: calc(var(--app-bar-height) + var(--banner-height, 0));
	}

	.page-description-container {
		height: round(calc((61.08vh + var(--banner-height, 0)) / 2 - var(--app-bar-height) / 2), 1px);
		height: round(calc((61.08svh + var(--banner-height, 0)) / 2 - var(--app-bar-height) / 2), 1px);

		& > div {
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

	.page-description {
		grid-area: search;
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

	.action:has(#action-fjarrlan):focus-visible {
		background: var(--color-primary-900);
	}

	#action-fjarrlan {
		color: var(--color-page);
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

	:global(.home .with-subset .leading-actions) {
		position: fixed;

		& + #app-bar-search {
			background-color: var(--color-app-bar);
		}
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

	.subset-container :global(.search-mapping-clear) {
		display: none;
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
