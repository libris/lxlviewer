<script lang="ts">
	import { page } from '$app/stores';
	import { Locales } from '$lib/i18n/locales';

	const locales = Object.keys(Locales);
</script>

<nav>
	<ul class="flex">
		{#each locales as locale}
			<li class="m-1">
				{#if locale === $page.data.locale}
					<span class="font-bold">{locale}</span>
				{:else}
					<a href="/{locale}" data-sveltekit-reload>{locale}</a>
				{/if}
			</li>
		{/each}
	</ul>
</nav>
