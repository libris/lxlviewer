<script lang="ts">
	import { page } from '$app/state';
	import { getModalContext } from '$lib/contexts/modal';
	import type { DisplayMapping, FacetGroup as TypedFacetGroup } from '$lib/types/search';
	import SearchMapping from './SearchMapping.svelte';
	import TreeView, {
		type TreeItemSnippetParams,
		type GetChildItemsFnParams
	} from '$lib/components/TreeView.svelte';

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

	function getFacetChildItems({ data }: GetChildItemsFnParams) {
		const childItemsKey =
			(Object.hasOwn(data, 'facetGroups') && 'facetGroups') ||
			(Object.hasOwn(data, 'facets') && 'facets') ||
			'items';

		return data?.[childItemsKey];
	}
</script>

{#snippet facetItemSnippet({ data }: TreeItemSnippetParams)}
	<span class="truncate">{data.label || data.str}</span>
	{#if data.totalItems}
		<span class="badge ml-auto">{data?.totalItems.toLocaleString(page.data.locale)}</span>
	{/if}
{/snippet}

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
			<TreeView
				ariaLabelledby="panel-filters"
				items={facets}
				treeItemSnippet={facetItemSnippet}
				getChildItems={getFacetChildItems}
			/>
		</nav>
	{/if}
	<details class="text-2xs">
		<summary>JSON</summary>
		<pre>{JSON.stringify(facets, null, 2)}</pre>
	</details>
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
