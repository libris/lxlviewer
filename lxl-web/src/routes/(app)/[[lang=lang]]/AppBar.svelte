<script lang="ts">
	import { onMount, type SvelteComponent } from 'svelte';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { beforeNavigate } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import HeaderMenu from './HeaderMenu.svelte';
	import SuperSearchWrapper from '$lib/components/supersearch/SuperSearchWrapper.svelte';
	import BiList from '~icons/bi/list';
	import BiSearch from '~icons/bi/search';

	let showHeaderMenu = $state(false);
	let bannerOffsetHeight: number | undefined = $state();
	let superSearchWrapperComponent: SvelteComponent | undefined = $state();
	let bannerElement: HTMLElement | undefined = $state();
	const isFindRoute = $derived(page.route.id === '/(app)/[[lang=lang]]/find');

	onMount(() => {
		if (browser) {
			const observer = new IntersectionObserver(onObserveBanner);
			if (bannerElement) {
				observer.observe(bannerElement);
			}
		}
	});

	function onObserveBanner(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				bannerOffsetHeight = entry.target.scrollHeight;
			} else {
				bannerOffsetHeight = 0;
			}
		});
	}

	function toggleHeaderMenu() {
		showHeaderMenu = !showHeaderMenu;
	}

	beforeNavigate(({ from, to }) => {
		if (from?.url.pathname !== to?.url.pathname) {
			showHeaderMenu = false;
		}
	});

	function onClickExpandSearch() {
		superSearchWrapperComponent?.showExpandedSearch();
	}
</script>

<!-- beta banner -->
<nav
	aria-label="beta banner"
	class="beta-banner text-2xs/3.5 bg-warning-300 flex min-h-11 place-content-between items-center gap-3 px-3 py-1 font-medium sm:px-6 md:text-xs"
	bind:this={bannerElement}
>
	<span class="flex flex-1 items-center gap-2">
		<span
			class="text-3xs sm:text-2xs rounded-sm bg-black px-1.5 py-0.5 tracking-wide text-white uppercase"
		>
			Beta
		</span>
		<span class="sm:hidden">
			{page.data.t('banner.messageMobile')}
		</span>
		<span class="hidden sm:inline">
			{page.data.t('banner.messageDesktop')}
		</span>
	</span>
	<a
		href={page.params?.lang === 'en' ? '/en/about' : '/about'}
		class="hidden whitespace-nowrap underline decoration-dotted hover:decoration-solid focus:decoration-solid sm:inline"
	>
		{page.data.t('banner.feedback')}
	</a>
	<a
		href="https://libris.kb.se"
		class="whitespace-nowrap underline decoration-dotted hover:decoration-solid focus:decoration-solid"
	>
		{page.data.t('banner.old')}
	</a>
</nav>
<!-- navbar -->
<header
	class={[
		'app-bar bg-app-header top-0 border-b-neutral-200 sm:border-b',
		isFindRoute && 'z-20 sm:sticky'
	]}
>
	<div class="header-nav grid items-center gap-x-8 px-3 sm:min-h-18">
		<div class="home flex sm:pl-3">
			<a href={page.data.base} class="grow-0 no-underline">
				<span class="font-heading text-2xl font-[600] lg:text-3xl">Libris</span>
			</a>
		</div>
		<search class="search sm:px-4">
			<SuperSearchWrapper
				placeholder={page.data.t('header.searchPlaceholder')}
				--offset-top={`${bannerOffsetHeight}px`}
				bind:this={superSearchWrapperComponent}
			/>
		</search>
		<div class="actions flex items-center justify-end">
			{#if !isFindRoute}
				<button
					aria-label={page.data.t('search.search')}
					class="text-subtle p-4 sm:hidden"
					onclick={() => onClickExpandSearch()}
				>
					<BiSearch />
				</button>
			{/if}
			<div
				id="header-menu"
				class="text-3xs hidden items-center target:absolute target:left-0 target:block target:w-full 2xl:flex"
			>
				<HeaderMenu />
			</div>
			<div class="2xl:hidden">
				<a
					aria-label={page.data.t('header.openMenu')}
					class="text-subtle flex items-center p-4"
					href={`${page.url.pathname}?${page.url.search}#header-menu`}
					onclick={(e) => {
						e.preventDefault();
						toggleHeaderMenu();
					}}
				>
					<BiList width={20} height={20} aria-hidden="true" />
				</a>
				{#if showHeaderMenu}
					<Modal close={toggleHeaderMenu}>
						<HeaderMenu />
					</Modal>
				{/if}
			</div>
		</div>
	</div>
</header>

<style lang="postcss">
	@reference 'tailwindcss';

	.app-bar {
		@variant sm {
			height: var(--app-bar-height);
		}
	}

	.header-nav {
		grid-template-areas:
			'home . actions'
			'search search search';

		grid-template-columns: 1fr minmax(0, 8fr) 1fr;

		@variant sm {
			grid-template-areas: 'home search actions';
		}

		@variant lg {
			grid-template-columns: 1fr minmax(0, 4fr) 1fr;
		}

		@variant xl {
			grid-template-columns: 1fr minmax(0, 3fr) 1fr;
		}
	}

	.home {
		grid-area: home;
	}

	.search {
		grid-area: search;
	}

	.actions {
		grid-area: actions;
	}
</style>
