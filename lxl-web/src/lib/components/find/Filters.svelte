<script lang="ts">
	import { page } from '$app/stores';
	import { getModalContext } from '$lib/contexts/modal';
	import FacetGroup from './FacetGroup.svelte';
	import type { DisplayMapping, FacetGroup as TypedFacetGroup } from '$lib/types/search';
	import SearchMapping from './SearchMapping.svelte';
	import { shouldShowMapping } from '$lib/utils/search';
	import BiSearch from '~icons/bi/search';

	export let facets: TypedFacetGroup[];
	export let mapping: DisplayMapping[];

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
		<nav
			class="facet-nav relative flex flex-col gap-4"
			aria-label={$page.data.t('search.filters')}
			data-testid="facets"
		>
			<input
				bind:value={searchPhrase}
				placeholder={$page.data.t('search.findFilter')}
				aria-label={$page.data.t('search.findFilter')}
				class="w-full pl-8"
				type="search"
			/>
			<BiSearch class="absolute left-2.5 top-3 text-sm text-icon" />
			<ol>
				{#each facets as group (group.dimension)}
					<FacetGroup {group} locale={$page.data.locale} {searchPhrase} />
				{/each}
			</ol>
			<span role="status" class="no-hits-msg px-2" aria-atomic="true"
				>{$page.data.t('search.noResults')}</span
			>
		</nav>
	{/if}
</div>

<style>
	/* hide 'no hits' msg as long as there's results displaying */
	:global(.facet-nav:has(.has-hits) .no-hits-msg) {
		@apply hidden;
	}
</style>
