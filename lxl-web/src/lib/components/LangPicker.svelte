<script lang="ts">
	import { page } from '$app/stores';
	import { Locales, defaultLocale } from '$lib/i18n/locales';

	function mapLocales(currentLocale: string) {
		return Object.keys(Locales)
			.map((locale) => {
				// remove any existing lang param and add the new one (if needed)
				const arr = $page.url.pathname.split('/').filter((p) => !!p && p !== currentLocale);
				if (locale !== defaultLocale) {
					arr.unshift(locale);
				}
				const url = `/${arr.join('/')}${$page.url.search}`;

				return { value: locale, name: Locales[locale], url };
			})
			.filter((locale) => locale.value !== currentLocale);
	}

	$: localesObj = mapLocales($page.data.locale);
	let expanded = false;
</script>

<nav class="relative" aria-label="Språk">
	<button
		type="button"
		aria-current="page"
		on:click={() => (expanded = !expanded)}
		aria-expanded={!!expanded}
		aria-controls="lang-picker-menu"
	>
		{Locales[$page.data.locale]} ⌄</button
	>
	<ul
		id="lang-picker-menu"
		class="bg-white absolute right-0 my-3 rounded-sm p-3"
		class:hidden={!expanded}
	>
		{#each localesObj as locale}
			<li>
				<!-- server hook (html lang) needs full page reload -->
				<a href={locale.url} hreflang={locale.value} data-sveltekit-reload>{locale.name}</a>
			</li>
		{/each}
	</ul>
</nav>
