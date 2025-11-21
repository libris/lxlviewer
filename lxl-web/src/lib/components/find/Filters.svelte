<script lang="ts">
	import { page } from '$app/state';
	import type { Facet, DisplayMapping } from '$lib/types/search';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import TreeView from '$lib/components/treeview/TreeView.svelte';
	import FacetItem from './FacetItem.svelte';
	import type {
		TreeItemSnippetParams,
		GetKeyParams,
		GetSelectedParams,
		GetGroupItemsParams
	} from '$lib/types/treeview';

	type Props = {
		facets?: Facet[];
		mapping?: DisplayMapping[];
		showHeader?: boolean;
	};

	const { facets, mapping, showHeader = true }: Props = $props();

	const uid = $props.id();
	const filterHeadingId = $derived(`${uid}-filters-heading`);
	const filtersLength = $derived(
		mapping?.[0].children?.filter((m) => m['@id']?.includes('textQuery')).length ||
			(mapping?.[0]['@id'] && !mapping[0]['@id'].includes('textQuery') && 1) ||
			0
	);

	const treeViewFacets = $derived(
		facets?.filter(
			(slice) => slice.dimension !== 'hasInstanceCategory' // temporarily filter out hasInstanceCategory as it has problems with duplicate keys
		)
	);

	$inspect(treeViewFacets);

	function getClearAllHref() {
		// TODO: Fix clear all links on AND filters
		const textQuery = mapping?.[0].children?.find((m) => m['@id']?.includes('textQuery'));
		return page.data.localizeHref(
			'/find?' + new URLSearchParams([['_q', textQuery?.displayStr || '*']]).toString()
		);
	}

	function getFacetChildren({ data }: GetGroupItemsParams) {
		const nestedValues = data.facets?.find((facet) => Object.hasOwn(facet, 'values'))?.values;
		if (nestedValues) {
			return nestedValues;
		}
		return data.values;
	}

	function getFacetKey({ data }: GetKeyParams) {
		return [data.dimension, data.label?.str || data.label, data.label?.discriminator]
			.filter(Boolean)
			.join('/');
	}

	function getSelected({ data, level }: GetSelectedParams) {
		if (level > 1) {
			if (data.selected) {
				return true;
			}
			return false;
		}
	}
</script>

<nav class="filters" data-testid="filters">
	{#if showHeader}
		<Toolbar>
			<h2 id={filterHeadingId} class="text-subtle text-xs tracking-widest uppercase">
				{page.data.t('search.filters')}
			</h2>
			{#snippet trailingActions()}
				{#if filtersLength}
					<a href={getClearAllHref()} class="btn btn-ghost text-link">
						{page.data.t('search.clearAll')}
					</a>
				{/if}
			{/snippet}
		</Toolbar>
	{/if}
	<div class="filters-list mr-1.5 overflow-x-hidden overflow-y-auto overscroll-contain">
		{#if treeViewFacets?.length}
			<TreeView
				ariaLabelledby={filterHeadingId}
				items={treeViewFacets}
				getKey={getFacetKey}
				{getSelected}
				getGroupItems={getFacetChildren}
			>
				{#snippet treeItemSnippet({ data, level }: TreeItemSnippetParams)}
					<FacetItem {data} {level} />
				{/snippet}
			</TreeView>
		{:else}
			<p role="status" aria-atomic="true" class="text-subtle my-3 px-3 text-sm">
				{page.data.t('search.noFilters')}
			</p>
		{/if}
	</div>
</nav>

<style lang="postcss">
	:global(dialog .filters) {
		margin-right: calc(var(--spacing) * -4);
		margin-left: calc(var(--spacing) * -4);
	}

	.filters-list {
		height: calc(var(--leading-pane-height) - var(--toolbar-height) * 2);
		scrollbar-width: thin;
		scrollbar-gutter: stable;
	}
</style>
