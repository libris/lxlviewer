<script lang="ts">
	import { page } from '$app/stores';
	import { getModalContext } from '$lib/contexts/modal';
	import FacetGroup from './FacetGroup.svelte';
	import type { DisplayMapping, FacetGroup as TypedFacetGroup, MultiSelectFacet } from './search';
	import SearchMapping from './SearchMapping.svelte';
	import { shouldShowMapping } from './utils';

	export let facets: TypedFacetGroup[];
	export let mapping: DisplayMapping[];
	export let boolFilters: MultiSelectFacet[];

	const inModal = getModalContext();

	let searchPhrase = '';
</script>

<div class="flex flex-col gap-4">
	{#if inModal && shouldShowMapping(mapping)}
		<nav aria-label={$page.data.t('search.selectedFilters')}>
			<SearchMapping {mapping} />
		</nav>
	{/if}
	{#if facets?.length}
		<nav class="flex flex-col gap-4">
			<input
				bind:value={searchPhrase}
				placeholder={$page.data.t('search.findFilter')}
				title={$page.data.t('search.findFilter')}
				class="w-full"
				type="search"
			/>
			<ol>
				{#each facets as group (group.dimension)}
					<FacetGroup {group} locale={$page.data.locale} {searchPhrase} />
				{/each}
			</ol>
			<ul class="list-none rounded-md bg-pill/4 py-2" id="booFilters">
				{#each boolFilters as facet (facet.view['@id'])}
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
								<span>{facet.str}</span>
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}
</div>
