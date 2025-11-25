<script lang="ts">
	import { page } from '$app/state';
	import type { Facet, DisplayMapping } from '$lib/types/search';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import TreeView, { type TreeItem, TreePath } from '$lib/components/treeview/TreeView.svelte';

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

	// const treeViewFacets = $derived(facets);

	function getClearAllHref() {
		// TODO: Fix clear all links on AND filters
		const textQuery = mapping?.[0].children?.find((m) => m['@id']?.includes('textQuery'));
		return page.data.localizeHref(
			'/find?' + new URLSearchParams([['_q', textQuery?.displayStr || '*']]).toString()
		);
	}

	const flatData: TreeItem[] = [
		{ path: new TreePath(['language']) },
		{ path: new TreePath(['language', 'swedish']) },
		{ path: new TreePath(['language', 'english']) },
		{ path: new TreePath(['language', 'spanish']) },
		{ path: new TreePath(['categories']) },
		{ path: new TreePath(['categories', 'litterature']) },
		{ path: new TreePath(['categories', 'litterature', 'skönlitteratur']) },
		{ path: new TreePath(['categories', 'litterature', 'poesi']) },
		{ path: new TreePath(['categories', 'music']) },
		{ path: new TreePath(['categories', 'film']) },
		{ path: new TreePath(['contributor']) },
		{ path: new TreePath(['contributor', 'Astrid Lindgren']) },
		{ path: new TreePath(['contributor', 'Hjalmar Söderberg']) }
	];
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
		<TreeView data={flatData} selectable="multiple" ariaLabelledby={filterHeadingId}></TreeView>
		<details>
			<summary tabindex="-1">JSON</summary>
			{JSON.stringify(facets)}
		</details>
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

	:global([role='group']) {
		padding-left: calc(var(--spacing) * 6);
	}
</style>
