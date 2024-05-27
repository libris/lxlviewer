<script>
	import getPageTitle from '$lib/utils/getPageTitle';
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{getPageTitle()}</title>
</svelte:head>

<article class="container-fluid my-8 max-w-3xl">
	{#if $page.data.locale === 'en'}
		<h2 class="mb-2 text-5-cond-extrabold">
			Welcome to the first beta version of Libris' new search service
		</h2>
		<p class="mb-2">This beta version currently includes functionality for</p>
		<ul class="mb-2 list-inside list-disc">
			<li>Simple search</li>
			<li>Search results with the option to refine</li>
			<li>Detailed information about search results</li>
		</ul>
		<p class="mb-2">
			More features will be added continuosly. Please note that the beta version contains test data
			that may be incomplete or inaccurate.
		</p>
		<p class="mb-2">
			Your feedback is important to us; please leave it via <a
				href="https://survey.kb.se/librisbeta/en">this form</a
			>. Here you can find answers to
			<a href="http://kb.se/libris">frequently asked questions</a>.
		</p>
	{:else}
		<h2 class="mb-2 text-5-cond-extrabold">
			Välkommen till den första betaversionen av Libris nya söktjänst
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
			Dina synpunkter är viktiga för oss, lämna dem gärna via <a
				href="https://survey.kb.se/librisbeta">detta formulär</a
			>. Här hittar du svar på <a href="http://kb.se/libris">vanligt förekommande frågor</a>.
		</p>
	{/if}
</article>
