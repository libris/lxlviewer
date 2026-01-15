<script lang="ts">
	import { type Component, onMount } from 'svelte';
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
	import BetaBanner from '$lib/components/BetaBanner.svelte';
	import AppMenuContent from '$lib/components/AppMenuContent.svelte';
	import SearchMapping from '$lib/components/find/SearchMapping.svelte';

	let mounted: boolean = $state(false);
	let menuToggleElement: HTMLButtonElement | HTMLAnchorElement | undefined = $state();
	let menuDialogElement: HTMLDialogElement | undefined = $state();
	let appSearchComponent: AppSearch | undefined = $state();
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
<header class="sticky top-0 z-20">
	{#if !dismissedBanner}
		<BetaBanner ondismiss={dismissableBanner ? handleDismissBanner : undefined} />
	{/if}
	<nav
		class={[
			'app-bar bg-app-header grid items-stretch',
			page.route.id === '/(app)/[[lang=lang]]' && 'home',
			subset && 'with-subset'
		]}
	>
		<ul class="leading-actions ml-2 flex items-center lg:ml-0 lg:gap-2">
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
				showSearchInputOnMobile && 'mb-2 flex lg:mb-0',
				!showSearchInputOnMobile &&
					'hidden target:flex has-[dialog:open]:h-0 lg:flex lg:has-[dialog:open]:h-fit', // enable toggling using target/anchor (so it also works when JavaScript is disabled)
				'mx-2 items-center lg:mx-0'
			]}
		>
			<form action={findActionUrl} class="mx-auto w-full max-w-7xl lg:px-4">
				<AppSearch
					id="search"
					name="_q"
					placeholder={subsetPlaceholder
						? `${page.data.t('header.searchSubsetPlaceholder')}: ${subsetPlaceholder}`
						: page.data.t('header.searchPlaceholder')}
					--sm-dialog-top={showSearchInputOnMobile
						? 'calc(var(--banner-height, 0) + var(--app-bar-height, 0) - var(--spacing) * 2)'
						: 'calc(var(--banner-height, 0)'}
					bind:this={appSearchComponent}
				/>
			</form>
		</search>
		<ul class="trailing-actions mr-2 flex items-center justify-end lg:mr-0 lg:gap-2">
			<li class={[showSearchInputOnMobile && 'hidden', 'lg:hidden']}>
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
</header>

<style lang="postcss">
	@reference 'tailwindcss';

	.app-bar {
		grid-template-areas: var(--search-grid-template-areas);
		grid-template-rows: var(--app-bar-height);
		grid-template-columns: var(--search-grid-template-columns);
		padding: var(--search-padding);
		gap: var(--search-gap);

		&:not(.home) {
			box-shadow: 0 1px 0 0 var(--color-primary-200);
		}
	}

	.leading-actions {
		grid-area: leading-actions;
	}

	search {
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

	.menu-dialog {
		top: calc(var(--app-bar-height, 0) + var(--banner-height, 0));
		max-height: calc(100vh - calc(var(--app-bar-height, 0) + var(--banner-height, 0) + 1px));
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
		}
	}

	/* subset in header */
	.app-bar.with-subset {
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
