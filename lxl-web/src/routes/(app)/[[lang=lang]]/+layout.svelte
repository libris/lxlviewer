<script lang="ts">
	import { browser } from '$app/environment';
	import { Locales } from '$lib/i18n/locales';
	import Search from '$lib/components/Search.svelte';
	import '../../../app.css';

	export let data;

	$: if (browser) {
		// set HTML lang - should maybe be done earlier, in a server hook?
		// https://github.com/sveltejs/kit/issues/3091#issuecomment-1112589090
		document.documentElement.lang = data.locale;
	}

	const locales = Object.keys(Locales);
</script>

<header class="mx-4 flex">
	<div class="flex-1">
		<a href="/">Libris</a>
		<Search />
	</div>
	<nav>
		<ul class="flex">
			{#each locales as locale}
				<li class="m-1">
					{#if locale === data.locale}
						<span class="font-bold">{locale}</span>
					{:else}
						<a href="/{locale}">{locale}</a>
					{/if}
				</li>
			{/each}
		</ul>
	</nav>
</header>
<slot />
