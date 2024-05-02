<script lang="ts">
	import { page } from '$app/stores';
	import { getModalContext } from '$lib/contexts/modal';
	import FacetGroup from './FacetGroup.svelte';
	import type { FacetGroup as TypedFacetGroup } from './search';
	import SearchMapping from './SearchMapping.svelte';

	export let facets: TypedFacetGroup[];

	const inModal = getModalContext();

	let searchPhrase = '';
</script>

<div class="flex flex-col gap-4">
	{#if facets?.length}
		{#if inModal}
			<nav class="px-4" aria-label="Valda filter">
				<SearchMapping mapping={$page.data.searchResult.mapping} />
			</nav>
		{/if}
		{#if facets?.length}
			<nav class="flex flex-col gap-4 px-4">
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
	{/if}
</div>
