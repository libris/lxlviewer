<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';
	import BiList from '~icons/bi/list';
	import Search from '$lib/components/Search.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import HeaderMenu from './HeaderMenu.svelte';
	import SuperSearchWrapper from '$lib/components/SuperSearchWrapper.svelte';

	$: isLandingPage = $page.route.id === '/(app)/[[lang=lang]]';

	let useSuperSearch =
		env?.PUBLIC_USE_SUPERSEARCH === 'true' || $page.url.searchParams.get('_x') === 'supersearch';

	let showHeaderMenu = false;

	function toggleHeaderMenu() {
		showHeaderMenu = !showHeaderMenu;
	}
</script>

<header class="bg-site-header" class:is-landing={isLandingPage}>
	<nav class="header-nav grid min-h-20 items-center gap-x-8 px-4 py-0 sm:px-6">
		<div class="home">
			{#if !isLandingPage}
				<a href={$page.data.base} class="flex flex-col text-primary no-underline sm:flex-row">
					<span
						class="text-[1.4rem] font-extrabold leading-tight sm:text-[1.6rem] md:text-[2.1rem]"
					>
						Libris</span
					>
					<sup
						class="top-0 -rotate-6 self-baseline rounded-sm bg-positive-dark/16 px-2 uppercase text-2-cond-bold sm:rotate-0"
						>Beta</sup
					>
				</a>
			{/if}
		</div>
		<div class="search">
			{#if useSuperSearch}
				<SuperSearchWrapper />
			{:else}
				<Search placeholder={$page.data.t('header.searchPlaceholder')} />
			{/if}
		</div>
		<div class="actions flex min-h-20 items-center justify-end">
			<div id="header-menu" class="hidden items-center md:flex">
				<HeaderMenu />
			</div>
			<div class="md:hidden">
				<a
					aria-label={$page.data.t('header.openMenu')}
					class="button-ghost h-11 w-11 !p-0"
					href={`${$page.url.pathname}?${$page.url.search}#header-menu`}
					on:click|preventDefault={toggleHeaderMenu}
				>
					<BiList width={20} height={20} aria-hidden="true" />
				</a>
				{#if showHeaderMenu}
					<Modal close={toggleHeaderMenu} position="top">
						<HeaderMenu />
					</Modal>
				{/if}
			</div>
		</div>
		{#if isLandingPage}
			<div class="landing flex flex-col items-center gap-2 pb-3">
				<h1 class="flex text-3xl font-extrabold text-primary sm:text-[5.5rem] sm:font-bold">
					Libris
					<sup
						class="self-center rounded-sm bg-positive-dark/16 px-2 uppercase text-2-cond-bold sm:text-3-cond-bold"
						>Beta</sup
					>
				</h1>
				<!-- <div class="w-full max-w-3xl">
					<Search placeholder={$page.data.t('home.searchPlaceholder')} autofocus />
				</div> -->
			</div>
		{/if}
	</nav>
</header>

<style lang="postcss">
	.header-nav {
		@apply grid-cols-header md:grid-cols-header-md;
		grid-template-areas: 'home search actions';
	}

	.is-landing .header-nav {
		@apply pb-16 md:grid-cols-header-landing-md;
		grid-template-areas:
			'home . actions'
			'. landing .'
			'search search search';

		@media screen and (min-width: theme('screens.sm')) {
			grid-template-areas:
				'home . actions'
				'. landing .'
				'. search .';
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

	.landing {
		grid-area: landing;
	}

	.is-landing .search {
		@apply w-full max-w-3xl justify-self-center;
	}

	#header-menu:target {
		@apply /* TODO: fix better no-JS fallback styling */ absolute left-0 block w-full bg-main;
	}
</style>
