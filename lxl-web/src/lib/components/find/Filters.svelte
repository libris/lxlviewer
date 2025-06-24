<script lang="ts">
	import { page } from '$app/state';
	import { getModalContext } from '$lib/contexts/modal';
	import type { DisplayMapping, FacetGroup as TypedFacetGroup } from '$lib/types/search';
	import FacetGroup from './FacetGroup.svelte';
	// import MyLibrariesFilter from './MyLibrariesFilter.svelte';
	import SearchMapping from './SearchMapping.svelte';
	import BiSearch from '~icons/bi/search';
	import { DEFAULT_FACETS_EXPANDED } from '$lib/constants/facets';

	type filtersPropsType = {
		facets: TypedFacetGroup[];
		mapping?: DisplayMapping[];
	};

	const { facets, mapping }: filtersPropsType = $props();

	function shouldShowMapping() {
		if (
			mapping &&
			mapping.length === 1 &&
			mapping[0].display === '*' &&
			mapping[0].operator === 'equals'
		) {
			return false; // hide if only wildcard search
		}
		return true;
	}

	const inModal = getModalContext();

	let searchPhrase = $state('');
</script>

<div class="flex flex-col gap-4">
	{#if mapping && inModal && shouldShowMapping()}
		<nav aria-label={page.data.t('search.selectedFilters')}>
			<SearchMapping {mapping} />
		</nav>
	{/if}
	{#if facets?.length}
		<nav
			class="facet-nav relative flex flex-col gap-2 text-sm"
			aria-label={page.data.t('search.filters')}
			data-testid="facets"
		>
			<div class="px-3">
				<input
					bind:value={searchPhrase}
					placeholder={page.data.t('search.findFilter')}
					aria-label={page.data.t('search.findFilter')}
					class="bg-input h-9 w-full rounded-sm border border-neutral-300 pr-2 pl-8 text-xs"
					type="search"
				/>
				<BiSearch class="text-subtle absolute top-0 left-6 h-9" />
			</div>
			<!-- {#if page.route.id === '/(app)/[[lang=lang]]/find'}
				<div class="px-3">
					<MyLibrariesFilter {facets} />
				</div>
			{/if} -->
			<ol>
				{#each facets as group, i (group.dimension)}
					<FacetGroup
						{group}
						locale={page.data.locale}
						{searchPhrase}
						isDefaultExpanded={i < DEFAULT_FACETS_EXPANDED}
					/>
				{/each}
			</ol>
			<span role="status" class="no-hits-msg px-4 text-xs" aria-atomic="true"
				>{page.data.t('search.noResults')}</span
			>
		</nav>
	{/if}
</div>

<style lang="postcss">
	/* hide 'no hits' msg as long as there's results displaying */
	:global(.facet-nav:has(.has-hits) .no-hits-msg) {
		display: none;
	}

	:global(dialog .facet-nav) {
		margin-right: calc(var(--spacing) * -4);
		margin-left: calc(var(--spacing) * -4);
	}
</style>
