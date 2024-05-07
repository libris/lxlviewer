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
	<div
		class="container-fluid flex flex-nowrap items-center justify-start gap-0 sm:gap-16 md:min-h-14"
	>
		{#if !isLandingPage}
			<a class="no-underline" href={$page.data.base}>
				<span
					class="sr-only text-[2.1rem] font-extrabold leading-tight text-primary sm:not-sr-only sm:inline"
					>Libris</span
				>
			</a>
			<div class="max-w-content flex-1">
				<Search placeholder="Sök i hela Sveriges bibliotekskatalog" />
			</div>
		{/if}
		<div class="hidden md:flex">
			<HeaderMenu />
		</div>
		<div class="block pl-4 sm:p-0 md:hidden">
			<a
				class="h-12 ghost-btn"
				href={`${$page.url.pathname}?${$page.url.search}#header-menu`}
				on:click|preventDefault={toggleHeaderMenu}
			>
				<BiList width={20} height={20} />
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
				>Hitta i hela Sveriges bibliotekskatalog</label
			>
			<div class="w-full max-w-3xl">
				<Search placeholder="Titel, författare, ämne, bokförlag m.m." autofocus />
			</div>
		</div>
	{/if}
</header>
