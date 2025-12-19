<script lang="ts">
	import { page, navigating } from '$app/state';
	import { getModalContext } from '$lib/contexts/modal';
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

<div class="flex flex-col gap-4 pb-4">
	{#if mapping && inModal && shouldShowMapping()}
		<nav aria-label={page.data.t('search.selectedFilters')}>
			<SearchMapping {mapping} />
		</nav>
	{/if}
	{#if facets?.length}
		<nav class="facet-nav" aria-label={page.data.t('search.filters')} data-testid="facets">
			<div class="relative mt-3 mb-1.5 px-3">
				<input
					bind:value={searchPhrase}
					placeholder={page.data.t('search.findFilter')}
					aria-label={page.data.t('search.findFilter')}
					class="bg-input h-9 w-full rounded-sm border border-neutral-300 pr-2 pl-8 text-xs"
					type="search"
				/>
				<BiSearch class="text-subtle absolute top-0 left-6 h-9" />
			</div>
			<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
			<menu
				role="menubar"
				aria-labelledby={'tab-filters'}
				class={[
					'text-sm',
					navigating.to &&
						navigating.from?.url.pathname === navigating.to?.url.pathname &&
						'pointer-events-none opacity-50'
				]}
			>
				{#each facets as facet, index (facet.dimension)}
					<FacetGroup
						data={facet}
						level={1}
						{searchPhrase}
						isDefaultExpanded={index < DEFAULT_FACETS_EXPANDED}
					/>
				{/each}
			</menu>
			<span role="status" class="no-hits-msg px-4 text-sm" aria-atomic="true">
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
