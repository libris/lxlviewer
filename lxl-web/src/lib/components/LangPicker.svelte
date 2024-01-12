<script lang="ts">
	import { page } from '$app/stores';
	import { Locales } from '$lib/i18n/locales';
	import { browser } from '$app/environment';

	const locales = Object.keys(Locales);

	$: if (browser) {
		// set HTML lang - should maybe be done earlier, in a server hook?
		// https://github.com/sveltejs/kit/issues/3091#issuecomment-1112589090
		document.documentElement.lang = $page.data.locale;
	}
</script>

<nav>
	<ul class="flex">
		{#each locales as locale}
			<li class="m-1">
				{#if locale === $page.data.locale}
					<span class="font-bold">{locale}</span>
				{:else}
					<a href="/{locale}">{locale}</a>
				{/if}
			</li>
		{/each}
	</ul>
</nav>
