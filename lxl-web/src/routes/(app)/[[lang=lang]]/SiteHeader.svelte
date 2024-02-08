<script>
	import Search from '$lib/components/Search.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import { page } from '$app/stores';
</script>

<header class="bg-head pb-4 pt-11 sm:py-6">
	<div class="container-fluid flex max-w-screen-xl flex-nowrap items-center gap-4 sm:gap-16">
		<a class="flex items-baseline gap-2 no-underline" href={$page.data.base}>
			<figure class="h-10 w-10"><Logo /></figure>
			<span
				class="sr-only text-[2.1rem] font-extrabold leading-none text-primary sm:not-sr-only sm:inline"
				>{$page.data.settings.serviceName}</span
			>
		</a>
		<div class="flex-1">
			<Search placeholder="Sök i hela Sveriges bibliotekskatalog" />
		</div>
		<div class="hidden md:flex">
			<SiteNav />
		</div>
		<div class="block md:hidden">⚙️</div>
		<!-- TODO menu -->
	</div>
</header>
