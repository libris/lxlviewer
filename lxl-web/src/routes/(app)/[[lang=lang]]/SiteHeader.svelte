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

<header
	class="flex gap-4 bg-site-header p-4 sm:px-6 md:grid"
	class:md:find-layout={!isLandingPage}
	class:md:grid-cols-find={!isLandingPage}
>
	{#if !isLandingPage}
		<div class="flex items-center">
			<a
				href={$page.data.base}
				class="text-[1.4rem] font-extrabold leading-tight text-primary no-underline sm:text-[1.6rem] md:text-[2.1rem]"
				>Libris
			</a>
		</div>
	{/if}
	<div class="flex flex-1 items-center" class:flex-col={isLandingPage}>
		{#if !isLandingPage}
			<div class="max-w-content flex-1">
				<Search placeholder={$page.data.t('header.searchPlaceholder')} />
			</div>
		{/if}
		<div id="header-menu" class="ml-auto hidden min-h-14 items-center pl-8 md:flex">
			<HeaderMenu />
		</div>
		<div class="ml-auto flex min-h-14 items-center pl-4 md:hidden">
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
		{#if isLandingPage}
			<div class="flex w-full flex-col items-center px-12 pb-[4.5rem] pt-6">
				<h1 class="text-3xl font-extrabold text-primary sm:text-[5.5rem] sm:font-bold">Libris</h1>
				<label for="main-search" class="mb-4 text-center text-secondary text-4-regular"
					>{$page.data.t('home.subtitle')}</label
				>
				<div class="w-full max-w-3xl">
					<Search placeholder={$page.data.t('home.searchPlaceholder')} autofocus />
				</div>
			</div>
		{/if}
	</div>
</header>

<style>
	#header-menu:target {
		@apply /* TODO: fix better no-JS fallback styling */ absolute left-0 block w-full bg-main;
	}
</style>
