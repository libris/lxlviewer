<script lang="ts">
	import type { LocaleCode } from '$lib/i18n/locales';
	import { page } from '$app/stores';
	import { type FacetGroup } from '$lib/types/search';
	import BiChevronRight from '~icons/bi/chevron-right';
	import CheckSquareFill from '~icons/bi/check-square-fill';
	import Square from '~icons/bi/square';
	import FacetRange from './FacetRange.svelte';
	import DecoratedData from '../DecoratedData.svelte';
	import { ShowLabelsOptions } from '$lib/types/decoratedData';

	export let group: FacetGroup;
	export let locale: LocaleCode;
	export let searchPhrase = '';

	const defaultFacetsShown = 5;
	let facetsShown = defaultFacetsShown;

	$: numfacets = group.facets.length;
	$: hasHits = filteredFacets.length > 0;
	$: expanded = searchPhrase && hasHits;
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
	<details open={!!expanded}>
		<summary
			class="flex min-h-11 w-full cursor-pointer items-center gap-2 font-bold"
			data-testid="facet-toggle"
		>
			<span class="arrow transition-transform">
				<BiChevronRight class="text-icon" />
			</span>
			<span>{group.label}</span>
		</summary>
		<div class="mb-4 md:text-sm lg:text-base">
			{#if group.search && !(searchPhrase && hasHits)}
				<!-- facet range inputs; hide in filter search results -->
				<FacetRange search={group.search} />
			{/if}
			<ol
				class="flex max-h-[437px] flex-col gap-1 overflow-y-auto overflow-x-clip py-2 pl-6 pr-0.5"
				data-testid="facet-list"
			>
				{#each shownFacets as facet (facet.view['@id'])}
					<li>
						<a
							class="facet-link flex items-end justify-between gap-2 no-underline"
							href={facet.view['@id']}
						>
							<span class="flex items-baseline">
								{#if 'selected' in facet}
									<!-- checkboxes -->
									<span class="sr-only"
										>{facet.selected ? $page.data.t('search.activeFilter') : ''}</span
									>
									<div class="mr-2 flex h-[13px] w-[13px] rounded-sm bg-[white]" aria-hidden="true">
										{#if facet.selected}
											<CheckSquareFill height="13px" />
										{:else}
											<Square height="13px" />
										{/if}
									</div>
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
					class="ml-6 mt-4 underline"
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
	</details>
</li>

<style lang="postcss">
	details[open] .arrow {
		@apply rotate-90;
	}

	.facet-link:hover,
	.facet-link:focus {
		& .facet-total {
			@apply bg-pill/8;
		}
	}
</style>
