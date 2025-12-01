<script lang="ts">
	import { page } from '$app/state';
	import type { Facet, DisplayMapping } from '$lib/types/search';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import MenuBar from '../treemenubar/TreeMenuBar.svelte';
	import { type TreeMenuItem } from '$lib/types/treemenubar';

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

	let menuBar: MenuBar | undefined = $state();
	// const treeViewFacets = $derived(facets);

	function getClearAllHref() {
		// TODO: Fix clear all links on AND filters
		const textQuery = mapping?.[0].children?.find((m) => m['@id']?.includes('textQuery'));
		return page.data.localizeHref(
			'/find?' + new URLSearchParams([['_q', textQuery?.displayStr || '*']]).toString()
		);
	}

	const flatData: TreeMenuItem[] = [
		{ path: ['categories'], searchString: 'categories' },
		{ path: ['categories', 'litterature'], searchString: 'litterature' },
		{ path: ['categories', 'litterature', 'skönlitteratur'], searchString: 'skönlitteratur' },
		{ path: ['categories', 'litterature', 'skönlitteratur', 'A'], searchString: 'a' },
		{ path: ['categories', 'litterature', 'skönlitteratur', 'B'], searchString: 'b' },

		{ path: ['categories', 'litterature', 'poesi'], searchString: 'poesi' },
		{ path: ['categories', 'litterature', 'poesi', 'C'], searchString: 'c' },
		{ path: ['categories', 'litterature', 'poesi', 'D'], searchString: 'd' },
		{ path: ['categories', 'music'], searchString: 'music' },
		{ path: ['categories', 'film'], searchString: 'film' },
		{ path: ['language'], searchString: 'language' },
		{ path: ['language', 'swedish'], searchString: 'swedish' },
		{ path: ['language', 'english'], searchString: 'english' },
		{ path: ['language', 'spanish'], searchString: 'spanish' },
		{ path: ['contributor'], searchString: 'contributor' },
		{ path: ['contributor', 'Astrid Lindgren'], searchString: 'astrid Lindgren' },
		{ path: ['contributor', 'Hjalmar Söderberg'], searchString: 'hjalmar söderberg' }
	];

	function handleFiltersListKeyDown(event: KeyboardEvent) {
		menuBar?.handleKeyDown(null, event);
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
	<div class="filters-list relative overflow-x-hidden overflow-y-auto overscroll-contain">
		<a
			id={`${uid}-filters-list`}
			href={`#${uid}-filters-list`}
			class="outline-accent-400 absolute h-full w-full cursor-default -outline-offset-2 focus:outline-2"
			draggable="false"
			onclick={(event) => event.preventDefault()}
			onkeydown={handleFiltersListKeyDown}
		>
			<span class="sr-only">{page.data.t('search.filterList')}</span>
		</a>
		<div class="absolute h-fit w-full">
			<MenuBar bind:this={menuBar} data={flatData} ariaLabelledby={filterHeadingId} />
			<details class="text-5xs text-subtle">
				<summary tabindex="-1">JSON</summary>
				<pre>{JSON.stringify(facets)}</pre>
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

	:global(summary + menu) {
		padding-left: calc(var(--spacing) * 6);
	}
</style>
