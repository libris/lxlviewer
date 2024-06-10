<script lang="ts">
	import { page } from '$app/stores';
	import { getModalContext } from '$lib/contexts/modal';
	import FacetGroup from './FacetGroup.svelte';
	import type { DisplayMapping, FacetGroup as TypedFacetGroup } from '$lib/types/search';
	import SearchMapping from './SearchMapping.svelte';
	import { shouldShowMapping } from '$lib/utils/search';

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
		</nav>
	{/if}
</div>
