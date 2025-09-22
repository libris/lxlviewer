<script lang="ts">
	import { page } from '$app/state';
	import AppMenu from '$lib/components/AppMenu.svelte';
</script>

<nav id="menu" class="mx-auto w-full max-w-3xl">
	<h1 class="font-heading my-6 px-3 text-xl lg:text-3xl">{page.data.t('appMenu.findOnWebsite')}</h1>
	<AppMenu showSkipToContent={false} />
</nav>
