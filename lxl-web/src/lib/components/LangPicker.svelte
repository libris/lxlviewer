<script lang="ts">
	import { page } from '$app/stores';
	import { Locales, defaultLocale } from '$lib/i18n/locales';

	function mapLocales(currentLocale: string) {
		return Object.keys(Locales).map((locale) => {
			// remove any existing lang param and add the new one (if needed)
			const arr = $page.url.pathname.split('/').filter((p) => !!p && p !== currentLocale);
			if (locale !== defaultLocale) {
				arr.unshift(locale);
			}
			const url = `/${arr.join('/')}${$page.url.search}`;

			return { value: locale, name: Locales[locale], url };
		});
	}

	$: localesObj = mapLocales($page.data.locale);
</script>

<nav>
	<ul class="flex">
		{#each localesObj as locale}
			<li class="m-1">
				{#if locale.value === $page.data.locale}
					<span class="font-bold">{locale.name}</span>
				{:else}
					<!-- server hook (html lang) needs full page reload -->
					<a href={locale.url} data-sveltekit-reload>{locale.name}</a>
				{/if}
			</li>
		{/each}
	</ul>
</nav>
