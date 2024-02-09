<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';
</script>

<header class="container-fluid flex flex-col gap-8 py-10">
	<div class="flex justify-center sm:justify-end">
		<SiteNav />
	</div>
	<div class="flex flex-col items-center gap-6">
		<div class="flex items-baseline gap-3 sm:gap-6">
			<figure class="h-12 w-12 sm:h-24 sm:w-24"><Logo /></figure>
			<h1 class="text-3xl font-bold leading-none text-primary sm:text-[5.5rem]">Libris</h1>
		</div>
		<label for="main-search" class="text-center text-[1.25rem] text-secondary"
			>Hitta och låna i hela Sveriges bibliotekskatalog</label
		>
		<div class="w-full max-w-3xl">
			<Search placeholder="Titel, författare, ämne, bokförlag m.m." />
		</div>
	</div>
</header>
