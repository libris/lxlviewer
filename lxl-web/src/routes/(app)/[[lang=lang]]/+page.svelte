<script>
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{getPageTitle()}</title>
</svelte:head>

<div class="container-fluid my-8 max-w-3xl">
	<div class="rounded-md p-4">
		{#if $page.data.locale === 'en'}
			<p>TODO English</p>
		{:else}
			<h2 class="mb-2 text-5-cond-extrabold">
				Välkommen till den första betaversionen av Libris nya söktjänst.
			</h2>
			<p class="mb-2">Denna betaversion innehåller än så länge möjligheter till</p>
			<ul class="mb-2 list-inside list-disc">
				<li>Enkel sökning</li>
				<li>Träfflista med möjlighet till avgränsning</li>
				<li>Detaljerad information om träffarna</li>
			</ul>
			<p class="mb-2">
				Flera funktioner kommer att läggas till allt eftersom de blir färdiga. Observera att
				betaversionen innehåller testdata som kan innehålla ofullständigheter och felaktigheter.
			</p>
			<p class="mb-2">
				Dina synpunkter är viktiga för oss, lämna dem gärna via <a href="/">denna enkät</a>. Här
				hittar du svar på <a href="/">vanligt förekommande frågor.</a>
			</p>
		{/if}
	</div>
</div>
