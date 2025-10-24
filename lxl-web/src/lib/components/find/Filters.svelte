<script lang="ts">
	import { page } from '$app/state';
	import { getModalContext } from '$lib/contexts/modal';
	import type { DisplayMapping, FacetGroup as TypedFacetGroup } from '$lib/types/search';
	import SearchMapping from './SearchMapping.svelte';
	import TreeView, { type TreeItem } from '$lib/components/TreeView.svelte';

	type filtersPropsType = {
		facets: TypedFacetGroup[];
		mapping?: DisplayMapping[];
	};

	interface FacetTreeItem extends TreeItem {
		str: string;
	}

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
</script>

{#snippet facetGroupSnippet(data, items)}
	<div class="flex min-h-8 items-center pl-2 text-sm font-medium">
		{data.label}
		{#if items}
			<span class="text-3xs text-subtle ml-auto">{items.length}</span>
		{/if}
	</div>
{/snippet}
{#snippet facetItemSnippet(data: FacetTreeItem)}
	<div class="text-subtle text-2xs flex min-h-8 items-center pl-4">{data.str}</div>
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
				groupSnippet={facetGroupSnippet}
				treeItemSnippet={facetItemSnippet}
				itemsPropertyKey="facets"
			/>
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
