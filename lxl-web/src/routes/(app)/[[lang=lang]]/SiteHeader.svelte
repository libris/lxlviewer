<script>
	import Search from '$lib/components/Search.svelte';
	import LangPicker from '$lib/components/LangPicker.svelte';
	import logo from '$lib/assets/img/logo-brown-flare.svg';
	import { page } from '$app/stores';

	$: isLandingPage = $page.route.id === '/(app)/[[lang=lang]]';
</script>

{#if isLandingPage}
	<header class="flex w-full flex-col gap-8 bg-head py-10 pb-20">
		<nav class="flex justify-center sm:justify-end">
			<ol class="flex items-center gap-6 text-secondary">
				<li>Hjälp</li>
				<li>Inställningar</li>
				<li><LangPicker /></li>
			</ol>
		</nav>
		<div class="flex flex-col items-center">
			<div class="flex items-baseline gap-3 sm:gap-6">
				<img class="h-12 w-12 sm:h-24 sm:w-24" alt="Libris logo" src={logo} />
				<h1 class="text-3xl font-bold text-primary sm:text-[5.5rem]">Libris</h1>
			</div>
			<label for="main-search" class="mb-4 text-center text-secondary text-4-regular"
				>Hitta och låna i hela Sveriges bibliotekskatalog</label
			>
			<div class="w-full max-w-[720px]">
				<Search placeholder="Titel, författare, ämne, bokförlag m.m." autofocus />
			</div>
		</div>
	</header>
{:else}
	<header class="sticky top-0 z-10 bg-head py-4 sm:py-4">
		<div class="flex flex-nowrap items-center justify-between gap-4 px-4 pl-6 sm:gap-16">
			<a class="flex items-baseline gap-2 no-underline" href={$page.data.base}>
				<img class="h-8 w-8" alt="Libris logo" src={logo} />
				<span
					class="sr-only text-[2.1rem] font-extrabold leading-tight text-primary sm:not-sr-only sm:inline"
					>Libris</span
				>
			</a>
			<div class="max-w-[720px] flex-1">
				<Search placeholder="Sök i hela Sveriges bibliotekskatalog" />
			</div>
			<nav class="hidden md:flex">
				<ol class="flex items-center gap-6 text-secondary">
					<li><LangPicker /></li>
				</ol>
			</nav>
			<div class="block md:hidden">⚙️</div>
			<!-- TODO menu -->
		</div>
	</header>
{/if}
