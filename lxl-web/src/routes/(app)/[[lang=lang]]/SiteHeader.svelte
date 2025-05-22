<script lang="ts">
	import type { SvelteComponent } from 'svelte';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';
	import Modal from '$lib/components/Modal.svelte';
	import HeaderMenu from './HeaderMenu.svelte';
	import SuperSearchWrapper from '$lib/components/supersearch/SuperSearchWrapper.svelte';
	import BiList from '~icons/bi/list';
	import BiSearch from '~icons/bi/search';

	let showHeaderMenu = $state(false);
	let bannerOffsetHeight: number | undefined = $state();
	let superSearchWrapperComponent: SvelteComponent;

	function toggleHeaderMenu() {
		showHeaderMenu = !showHeaderMenu;
	}

	beforeNavigate(({ from, to }) => {
		if (from?.url.pathname !== to?.url.pathname) {
			showHeaderMenu = false;
		}
	});

	function onClickExpandSearch() {
		superSearchWrapperComponent.showExpandedSearch();
	}
</script>

<header class="bg-app-header">
	<div
		class="text-2xs/3.5 bg-warning-300 flex min-h-11 place-content-between items-center gap-8 px-3 py-1 font-medium sm:px-6 md:text-xs"
		bind:offsetHeight={bannerOffsetHeight}
	>
		<span class="flex items-center gap-2">
			<span class="text-2xs rounded-sm bg-black px-1.5 py-0.5 tracking-wide text-white uppercase">
				Beta
			</span>
			<span class="sm:hidden">
				{page.data.t('header.betaMessageMobile')}
			</span>
			<span class="hidden sm:inline">
				{page.data.t('header.betaMessageDesktop')}
			</span>
		</span>
		<a
			href={page.params?.lang === 'en'
				? 'https://survey.kb.se/librisbeta/en'
				: 'https://survey.kb.se/librisbeta'}
			class="whitespace-nowrap underline decoration-dotted hover:decoration-solid focus:decoration-solid"
		>
			{page.data.t('header.betaLink')}
			{#if page.data.t('header.betaLinkLong')}
				<span class="sr-only lg:not-sr-only">{`${page.data.t('header.betaLinkLong')}`}</span>
			{/if}
		</a>
	</div>
	<nav class="header-nav header-layout min-h-18 items-center py-0">
		<div class="home lg:pl-4">
			<a href={page.data.base} class="flex no-underline">
				<span class="font-heading text-2xl font-[600] lg:text-3xl">Libris</span>
			</a>
		</div>
		<div class="search sm:px-4">
			<SuperSearchWrapper
				placeholder={page.data.t('header.searchPlaceholder')}
				--offset-top={`${bannerOffsetHeight}px`}
				bind:this={superSearchWrapperComponent}
			/>
		</div>
		<div class="actions flex items-center justify-end lg:pr-4">
			<button
				aria-label={page.data.t('search.search')}
				class="text-subtle p-4 sm:hidden"
				onclick={() => onClickExpandSearch()}
			>
				<BiSearch />
			</button>
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
	</nav>
</header>

<style lang="postcss">
	@reference "../../../app.css";

	.header-nav {
		grid-template-areas: 'home search actions';
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
