<script lang="ts">
	import type { LocaleCode } from '$lib/i18n/locales';
	import { relativizeUrl } from '$lib/utils/http';
	import { type FacetGroup } from './search';
	import BiChevronRight from '~icons/bi/chevron-right';
	import BiChevronDown from '~icons/bi/chevron-down';
	import BiDiamond from '~icons/bi/diamond';

	export let group: FacetGroup;
	export let locale: LocaleCode;
	export let searchPhrase = '';

	const defaultFacetsShown = 5;
	let facetsShown = defaultFacetsShown;
	let manuallyExpanded = false;

	$: numfacets = group.facets.length;
	$: hasHits = filteredFacets.length > 0;
	$: expanded = (searchPhrase && hasHits) || (!searchPhrase && manuallyExpanded);
	$: filteredFacets = group.facets.filter((facet) =>
		facet.str
			.toLowerCase()
			.split(/\s|--/)
			.find((s) => s.startsWith(searchPhrase.toLowerCase()))
	);
	$: shownFacets = filteredFacets.filter((facet, index) => index < facetsShown);
	$: canShowMoreFacets = filteredFacets.length > facetsShown;
	$: canShowLessFacets = !canShowMoreFacets && filteredFacets.length > defaultFacetsShown;
</script>

<li class="my-4 border-b-[2px] border-primary pb-2" class:hidden={searchPhrase && !hasHits}>
	<button
		id={'toggle-' + group.dimension}
		type="button"
		on:click={() => {
			manuallyExpanded = !manuallyExpanded;
		}}
		aria-expanded={!!expanded}
		aria-controls={'group-' + group.dimension}
		class="w-full text-left font-bold"
		data-testid="facet-toggle"
	>
		<span class="flex items-center gap-2">
			<span>
				{#if searchPhrase}
					<!-- FIXME -->
					<BiDiamond class="text-icon-default" />
				{:else if expanded}
					<BiChevronDown class="text-icon-default" />
				{:else}
					<BiChevronRight class="text-icon-default" />
				{/if}
			</span>
			<span>
				{group.label}
			</span>
		</span></button
	>
	<div
		id={'group-' + group.dimension}
		aria-labelledby={'toggle-' + group.dimension}
		class:hidden={!expanded}
	>
		<ol class="mt-2" data-testid="facet-list">
			{#each shownFacets as facet (facet.view['@id'])}
				<li>
					<a class="flex justify-between no-underline" href={relativizeUrl(facet.view['@id'])}>
						<span class="flex items-baseline">
							{#if 'selected' in facet}
								<!-- howto A11y?! -->
								<span class="sr-only">{facet.selected ? 'Valt filter' : ''}</span>
								<span class="mr-1" aria-hidden="true">{facet.selected ? '☑' : '☐'}</span>
							{/if}
							<span>{facet.str}</span>
						</span>
						<span>({facet.totalItems.toLocaleString(locale)})</span>
					</a>
				</li>
			{/each}
		</ol>
		{#if canShowMoreFacets || canShowLessFacets}
			<button
				class="my-2"
				on:click={() =>
					canShowMoreFacets ? (facetsShown = numfacets) : (facetsShown = defaultFacetsShown)}
			>
				{canShowMoreFacets ? 'Visa fler' : 'Visa färre'}</button
			>
		{/if}
		{#if searchPhrase && filteredFacets.length === 0}
			<span role="status" aria-atomic="true">Inget resultat</span>
		{/if}
	</div>
</li>
