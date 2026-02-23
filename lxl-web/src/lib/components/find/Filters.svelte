<script lang="ts">
	import { page, navigating } from '$app/state';
	import { getModalContext } from '$lib/contexts/modal';
	import { displayMappingToString } from '$lib/utils/displayMappingToString';
	import type { DisplayMapping, Facet } from '$lib/types/search';
	import FacetGroup from '$lib/components/find/FacetGroup.svelte';
	import SearchMapping from './SearchMapping.svelte';
	import BiSearch from '~icons/bi/search';
	import { DEFAULT_FACETS_EXPANDED } from '$lib/constants/facets';

	type Props = {
		facets: Facet[];
		mapping?: DisplayMapping[];
	};

	const { facets, mapping }: Props = $props();

	function shouldShowMapping(m: DisplayMapping[]) {
		return !!displayMappingToString(m).trim();
	}

	const inModal = getModalContext();

	let searchPhrase = $state('');
</script>

<div class="flex flex-col gap-4">
	{#if mapping && inModal && shouldShowMapping(mapping)}
		<nav aria-label={page.data.t('search.selectedFilters')}>
			<SearchMapping {mapping} />
		</nav>
	{/if}
	{#if facets?.length}
		<nav class="facet-nav" aria-label={page.data.t('search.filters')} data-testid="facets">
			<div class="relative mx-3 mt-3">
				<input
					bind:value={searchPhrase}
					placeholder={page.data.t('search.findFilter')}
					aria-label={page.data.t('search.findFilter')}
					class="bg-input h-9 w-full rounded-sm border border-neutral-300 pr-2 pl-8 text-sm"
					type="search"
					name={page.data.t('search.findFilter')}
				/>
				<BiSearch class="text-subtle absolute top-0 left-2.5 h-9 text-sm" />
			</div>
			<ul
				aria-labelledby={'tab-filters'}
				class={[
					'text-sm',
					navigating.to &&
						navigating.from?.url.pathname === navigating.to?.url.pathname &&
						'pointer-events-none opacity-50'
				]}
			>
				{#each facets as facet, index (facet.dimension)}
					<li>
						<FacetGroup
							data={facet}
							level={1}
							{searchPhrase}
							isDefaultExpanded={index < DEFAULT_FACETS_EXPANDED}
						/>
					</li>
				{/each}
			</ul>
			<span role="status" class="no-hits-msg mt-4 px-4 text-sm" aria-atomic="true">
				{page.data.t('search.noFiltersFound')}
			</span>
		</nav>
	{/if}
</div>

<style lang="postcss">
	/* hide 'no hits' msg as long as there's results displaying */
	.facet-nav {
		&:global(:has(.has-hits) .no-hits-msg) {
			display: none;
		}
	}

	:global(dialog .facet-nav) {
		margin-right: calc(var(--spacing) * -4);
		margin-left: calc(var(--spacing) * -4);
	}
</style>
