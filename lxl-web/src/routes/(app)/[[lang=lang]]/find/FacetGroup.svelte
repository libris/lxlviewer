<script lang="ts">
	import type { LocaleCode } from '$lib/i18n/locales';
	import { type FacetGroup } from './search';

	export let group: FacetGroup;
	export let locale: LocaleCode;

	const numfacets = group.facets.length;
	const defaultLimit = 5;
	let facetsShown = defaultLimit;
	let expanded = false;
	let searchPhrase = '';

	$: filteredFacets = group.facets.filter((facet) =>
		facet.str.toLowerCase().startsWith(searchPhrase.toLowerCase())
	);
	$: shownFacets = filteredFacets.filter((facet, index) => index < facetsShown);
	$: canShowMoreFacets = filteredFacets.length > facetsShown;
	$: canShowLessFacets = !canShowMoreFacets && filteredFacets.length > defaultLimit;
</script>

<div class="mb-2 border-b-[1px] pb-2 text-2-regular">
	<button
		on:click={() => (expanded = !expanded)}
		aria-expanded={!!expanded}
		aria-controls={'group-' + group.dimension}
		class="text-2-cond-bold"
	>
		{expanded ? '⌃' : '⌄'} {group.label}</button
	>
	<div id={'group-' + group.dimension} class:hidden={!expanded}>
		<input bind:value={searchPhrase} class="my-2" placeholder="Sök {group.label.toLowerCase()}" />
		<ul class="">
			{#each shownFacets as facet (facet.view['@id'])}
				<li class="flex justify-between">
					<a class="text-2-regular" href={facet.view['@id']}>
						{facet.str}
					</a>
					<span>({facet.totalItems.toLocaleString(locale)})</span>
				</li>
			{/each}
		</ul>
		{#if canShowMoreFacets || canShowLessFacets}
			<button
				class="my-2"
				on:click={() =>
					canShowMoreFacets ? (facetsShown = numfacets) : (facetsShown = defaultLimit)}
			>
				{canShowMoreFacets ? 'Visa fler' : 'Visa färre'}</button
			>
		{/if}
		{#if searchPhrase && filteredFacets.length === 0}
			<span>Inget resultat</span>
		{/if}
	</div>
</div>
