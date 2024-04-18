<script>
	import Search from '$lib/components/Search.svelte';
	import LangPicker from '$lib/components/LangPicker.svelte';
	import { page } from '$app/stores';

	$: isLandingPage = $page.route.id === '/(app)/[[lang=lang]]';
</script>

{#if isLandingPage}
	<header class="container-fluid flex flex-col gap-8 bg-head py-10 pb-20">
		<nav class="flex justify-center sm:justify-end">
			<ol class="flex items-center gap-6 text-secondary">
				<li>Hjälp</li>
				<li>Inställningar</li>
				<li><LangPicker /></li>
			</ol>
		</nav>
		<div class="flex flex-col items-center">
			<div class="flex items-baseline gap-3 sm:gap-6">
				<h1 class="text-3xl font-bold text-primary sm:text-[5.5rem]">Libris</h1>
			</div>
			<label for="main-search" class="mb-4 text-center text-secondary text-4-regular"
				>Hitta och låna i hela Sveriges bibliotekskatalog</label
			>
			<div class="w-full max-w-3xl">
				<Search placeholder="Titel, författare, ämne, bokförlag m.m." autofocus />
			</div>
		</div>
	</header>
{:else}
	<header class="bg-head pb-4 pt-4 sm:py-6">
		<div class="container-fluid flex flex-nowrap items-center justify-between gap-4 sm:gap-16">
			<a class="flex items-baseline gap-2 no-underline" href={$page.data.base}>
				<span
					class="sr-only text-[2.1rem] font-extrabold leading-tight text-primary sm:not-sr-only sm:inline"
					>Libris</span
				>
			</a>
			<div class="max-w-content flex-1">
				<Search placeholder="Sök i hela Sveriges bibliotekskatalog" />
			</div>
			<nav class="hidden md:flex">
				<ol class="flex items-center gap-6 text-secondary">
					<li>Hjälp</li>
					<li>Inställningar</li>
					<li><LangPicker /></li>
				</ol>
			</nav>
			<div class="block md:hidden">⚙️</div>
			<!-- TODO menu -->
		</div>
	</header>
{/if}
