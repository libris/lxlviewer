<script lang="ts">
	import { page } from '$app/stores';
	import Search from '$lib/components/Search.svelte';
	import BiList from '~icons/bi/list';
	import Modal from '$lib/components/Modal.svelte';
	import HeaderMenu from './HeaderMenu.svelte';

	$: isLandingPage = $page.route.id === '/(app)/[[lang=lang]]';

	let showHeaderMenu = false;

	function toggleHeaderMenu() {
		showHeaderMenu = !showHeaderMenu;
	}
</script>

<header class="bg-head pb-4 pt-4 sm:py-6">
	<div class="flex flex-nowrap items-center justify-start gap-0 md:min-h-14 md:gap-8 xl:gap-0">
		{#if !isLandingPage}
			<a class="px-0 no-underline sm:px-4 xl:w-80" href={$page.data.base}>
				<span
					class="sr-only text-[2.1rem] font-extrabold leading-tight text-primary sm:not-sr-only sm:inline"
					>Libris</span
				>
			</a>
			<div class="max-w-content flex-1 px-4">
				<Search placeholder={$page.data.t('header.searchPlaceholder')} />
			</div>
		{/if}
		<div id="header-menu" class="ml-auto hidden px-4 md:flex">
			<HeaderMenu />
		</div>
		<div class="ml-auto block px-4 md:hidden">
			<a
				aria-label={$page.data.t('header.openMenu')}
				class="h-12 ghost-btn"
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
		<div class="flex flex-col items-center px-12 pb-[4.5rem] pt-6">
			<h1 class="text-3xl font-extrabold text-primary sm:text-[5.5rem] sm:font-bold">Libris</h1>
			<label for="main-search" class="mb-4 text-center text-secondary text-4-regular"
				>{$page.data.t('home.subtitle')}</label
			>
			<div class="w-full max-w-3xl">
				<Search placeholder={$page.data.t('home.searchPlaceholder')} autofocus />
			</div>
		</div>
	{/if}
</header>

<style>
	#header-menu:target {
		@apply /* TODO: fix better no-JS fallback styling */ absolute left-0 block w-full bg-main;
	}
</style>
