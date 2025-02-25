<script lang="ts">
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/stores';
	import BiSearch from '~icons/bi/search';
	let searchPhrase = '';
</script>

<svelte:head>
	<title>{getPageTitle($page.data.t('header.myPages'))}</title>
</svelte:head>

<div class="container-fluid mb-12 mt-8 max-w-3xl page-padding">
	<h1 class="mb-6 pl-2 text-6-cond-extrabold">Mina sidor</h1>
	<h1 class="mb-2 pl-2 text-3-cond-bold">Bibliotek</h1>
	<div class="container-fluid max-w-3xl rounded-md bg-primary/4 page-padding">
		Hitta och lägg till favoritbibliotek
		<div class="relative">
			<BiSearch class="absolute left-2.5 top-6 text-sm text-icon" />
			<input
				bind:value={searchPhrase}
				placeholder={$page.data.t('myPages.findLibrary')}
				aria-label={$page.data.t('myPages.findLibrary')}
				class="mt-3 w-full pl-8"
				type="search"
			/>
			<!--			https://libris.kb.se/find.jsonld?q=kung&_lens=chips&_suggest=sv&_limit=7&@type=Library-->
			<!--			https://beta.libris-qa.kb.se/find?_i=&_q=typ:Library&_limit=20&_spell=true-->
		</div>
	</div>
</div>
