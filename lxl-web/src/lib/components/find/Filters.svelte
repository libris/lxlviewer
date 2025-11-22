<script lang="ts">
	import { page } from '$app/state';
	import type { Facet, DisplayMapping } from '$lib/types/search';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import TreeView from '$lib/components/treeview/TreeView.svelte';
	// import FacetItem from './FacetItem.svelte';
	import type { TreeItem } from '$lib/types/treeview';

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
			(slice) => slice.dimension !== 'hasInstanceType' && slice.dimension !== 'hasInstanceCategory' // temporarily filter out hasInstanceCategory as it has problems with duplicate keys
		)
	);

	$inspect(treeViewFacets);

	const testItems: TreeItem[] = [
		{
			key: 'key 1',
			data: 'Item 1',
			id: 'aaaa',
			items: [
				{
					key: 'childkey1',
					data: 'data'
				}
			]
		},
		{
			key: 'key 2',
			data: 'Item 2',
			id: 'bbbb',
			items: [
				{
					key: 'childkey1',
					data: 'data'
				}
			]
		},
		{
			key: 'key 3',
			data: 'Item 3',
			items: [
				{
					key: 'childkey1',
					data: 'data'
				},
				{
					key: 'childkey12',
					data: 'data'
				}
			]
		}
	];

	function getClearAllHref() {
		// TODO: Fix clear all links on AND filters
		const textQuery = mapping?.[0].children?.find((m) => m['@id']?.includes('textQuery'));
		return page.data.localizeHref(
			'/find?' + new URLSearchParams([['_q', textQuery?.displayStr || '*']]).toString()
		);
	}
</script>

{#snippet testSnippet()}
	<p>Hej</p>
{/snippet}

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
		<TreeView items={testItems} treeItemSnippet={testSnippet} animated />
		<!--
		{#if treeViewFacets?.length}
			<TreeView ariaLabelledby={filterHeadingId} items={treeViewFacets}>
				{#snippet treeItemSnippet({ data, level }: TreeItemSnippetParams)}
					<FacetItem {data} {level} />
				{/snippet}
			</TreeView>
		{:else}
			<p role="status" aria-atomic="true" class="text-subtle my-3 px-3 text-sm">
				{page.data.t('search.noFilters')}
			</p>
		{/if}
		-->
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
