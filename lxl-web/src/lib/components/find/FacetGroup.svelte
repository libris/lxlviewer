<script lang="ts">
	import type { LocaleCode } from '$lib/i18n/locales';
	import { page } from '$app/stores';
	import { type FacetGroup } from '$lib/types/search';
	import BiChevronRight from '~icons/bi/chevron-right';
	import FacetRange from './FacetRange.svelte';
	import DecoratedData from '../DecoratedData.svelte';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';

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
			<!-- Currently groups can't be minimized while searching -->
			<span class:rotate-90={searchPhrase || expanded} class="transition-transform">
				<BiChevronRight class="text-icon" />
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
		<ol class="mt-2 max-h-[437px] overflow-y-auto overflow-x-clip" data-testid="facet-list">
			{#each shownFacets as facet (facet.view['@id'])}
				<li class="mb-[0.3rem]">
					<a
						class="facet-link flex items-end justify-between gap-2 pl-6 no-underline"
						href={facet.view['@id']}
					>
						<span class="flex items-baseline">
							{#if 'selected' in facet}
								<!-- howto A11y?! -->
								<span class="sr-only"
									>{facet.selected ? $page.data.t('search.activeFilters') : ''}</span
								>
								<span class="mr-1" aria-hidden="true">{facet.selected ? '☑' : '☐'}</span>
							{/if}
							<span>
								<DecoratedData data={facet.object} showLabels={ShowLabelsOptions.Never} />
								<span class="ml-0.5 text-xs text-primary/40">{facet.discriminator}</span>
							</span>
						</span>
						{#if facet.totalItems > 0}
							<span
								class="facet-total mb-px rounded-sm bg-pill/4 px-1 text-sm text-secondary md:text-xs lg:text-sm"
								aria-label="{facet.totalItems} {$page.data.t('search.hits')}"
								>{facet.totalItems.toLocaleString(locale)}</span
							>
						{/if}
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
				{canShowMoreFacets ? $page.data.t('search.showMore') : $page.data.t('search.showFewer')}
			</button>
		{/if}
		{#if searchPhrase && filteredFacets.length === 0}
			<span role="status" aria-atomic="true">{$page.data.t('search.noResults')}</span>
		{/if}
	</div>
</li>

<style lang="postcss">
	.facet-link:hover,
	.facet-link:focus {
		& .facet-total {
			@apply bg-pill/8;
		}
	}
</style>
