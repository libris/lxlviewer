<script lang="ts">
	import { page } from '$app/state';
	import type { Facet, DisplayMapping } from '$lib/types/search';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import IconChevron from '~icons/bi/chevron-right';

	type Props = {
		facets?: Facet[];
		mapping?: DisplayMapping[];
		showHeader?: boolean;
	};

	const { facets = [], mapping, showHeader = true }: Props = $props();

	const filtersLength = $derived(
		mapping?.[0].children?.filter((m) => m['@id']?.includes('textQuery')).length ||
			(mapping?.[0]['@id'] && !mapping[0]['@id'].includes('textQuery') && 1) ||
			0
	);

	function getClearAllHref() {
		// TODO: Fix clear all links on AND filters
		const textQuery = mapping?.[0].children?.find((m) => m['@id']?.includes('textQuery'));
		return page.data.localizeHref(
			'/find?' + new URLSearchParams([['_q', textQuery?.displayStr || '*']]).toString()
		);
	}
</script>

{#snippet chevron()}
	<span
		aria-hidden="true"
		class={[
			'chevron pointer-events-none flex h-8 w-8 shrink-0 origin-center items-center justify-center transition-transform'
		]}
	>
		<IconChevron class="text-subtle size-3.5" />
	</span>
{/snippet}

<nav class="filters" data-testid="filters">
	{#if showHeader}
		<Toolbar>
			<h2 class="text-subtle text-xs tracking-widest uppercase">
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
	<!-- Negative tabindex is needed to prevent keyboard focusable scrollers (see https://developer.chrome.com/blog/keyboard-focusable-scrollers) -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="filters-list relative overflow-x-hidden overflow-y-auto overscroll-contain"
		tabindex={-1}
	>
		<!--
			The following warning is most certainly a false alarm according to https://github.com/sveltejs/svelte/issues/8416
			and https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/menu
		-->
		<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
		<menu
			role="menubar"
			class="outline-accent-400 min-h-full -outline-offset-2 focus:outline-2"
			aria-label={page.data.t('search.filtersMenubar')}
			onkeydown={(event) => console.log('event.key', event.key)}
			tabindex={0}
		>
			<!-- 
				Temporarily filter out librissearch:hasInstanceCategory as it causes duplicate keys (Reproduktion i originalstorlek)
				and we don't want to rely on value.view.id as it changes after navigating
			-->
			{#each facets.filter((facet) => facet.dimension !== 'librissearch:hasInstanceCategory') as facet (facet.dimension)}
				<details role="menuitem">
					<summary class="flex min-h-9 items-center font-medium -outline-offset-2">
						{@render chevron()}
						{facet.label}
					</summary>
					<menu role="menu">
						{#each facet.values as value (value.label + (value.discriminator || ''))}
							<div>{value.label}</div>
						{/each}
					</menu>
				</details>
			{/each}
			{#if !facets.length}
				<p role="status" aria-atomic="true" class="text-subtle p-3">
					{page.data.t('search.noFilters')}
				</p>
			{/if}
		</menu>
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
		padding-left: calc(var(--spacing) * 8);
	}

	details[open] > summary .chevron {
		transform: rotate(90deg);
	}
</style>
