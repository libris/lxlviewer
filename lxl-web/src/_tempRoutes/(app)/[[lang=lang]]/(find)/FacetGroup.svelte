<script lang="ts">
	import type { LocaleCode } from '$lib/i18n/locales';
	import { page } from '$app/stores';
	import { type FacetGroup } from './search';
	import BiChevronRight from '~icons/bi/chevron-right';
	import BiChevronDown from '~icons/bi/chevron-down';
	import FacetRange from './FacetRange.svelte';

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

<li class="border-b border-primary/16 first:border-t" class:hidden={searchPhrase && !hasHits}>
	<button
		id={'toggle-' + group.dimension}
		type="button"
		on:click={() => {
			manuallyExpanded = !manuallyExpanded;
		}}
		aria-expanded={!!expanded}
		aria-controls={'group-' + group.dimension}
		class="min-h-11 w-full text-left font-bold"
		data-testid="facet-toggle"
	>
		<span class="flex items-center gap-2">
			<span>
				{#if searchPhrase}
					<!-- Currently groups can't be minimized while searching -->
					<BiChevronDown class="text-icon" />
				{:else if expanded}
					<BiChevronDown class="text-icon" />
				{:else}
					<BiChevronRight class="text-icon" />
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
		class="mb-4 md:text-sm lg:text-base"
	>
		{#if group.search && !(searchPhrase && hasHits)}
			<!-- facet range inputs; hide in filter search results -->
			<FacetRange search={group.search} />
		{/if}
		<ol class="max-h-437px mt-2 overflow-y-auto" data-testid="facet-list">
			{#each shownFacets as facet (facet.view['@id'])}
				<li class="pl-6">
					<a class="flex items-center justify-between no-underline" href={facet.view['@id']}>
						<span class="flex items-baseline">
							{#if 'selected' in facet}
								<!-- howto A11y?! -->
								<span class="sr-only"
									>{facet.selected ? $page.data.t('search.activeFilters') : ''}</span
								>
								<span class="mr-1" aria-hidden="true">{facet.selected ? '☑' : '☐'}</span>
							{/if}
							<span>{facet.str}</span>
						</span>
						<span class="text-sm text-secondary md:text-xs lg:text-sm"
							>({facet.totalItems.toLocaleString(locale)})</span
						>
					</a>
				</li>
			{/each}
		</ol>
		{#if canShowMoreFacets || canShowLessFacets}
			<button
				class="mt-4 pl-6"
				on:click={() =>
					canShowMoreFacets ? (facetsShown = numfacets) : (facetsShown = defaultFacetsShown)}
			>
				{canShowMoreFacets
					? $page.data.t('search.showMore')
					: $page.data.t('search.showFewer')}</button
			>
		{/if}
		{#if searchPhrase && filteredFacets.length === 0}
			<span role="status" aria-atomic="true">{$page.data.t('search.noResults')}</span>
		{/if}
	</div>
</li>

<style lang="postcss">
	.max-h-437px {
		max-height: 437px;
	}
</style>
