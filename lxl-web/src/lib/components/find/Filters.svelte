<script lang="ts">
	import { page, navigating } from '$app/state';
	import type { Facet } from '$lib/types/search';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import FacetGroup from '$lib/components/facet/FacetGroup.svelte';

	type Props = {
		facets?: Facet[];
		showHeader?: boolean;
	};

	const { facets = [], mapping, showHeader = true }: Props = $props();

	const filtersLength = $derived(
		mapping?.[0].children?.filter((m) => m['@id']?.includes('textQuery')).length ||
			(mapping?.[0]['@id'] && !mapping[0]['@id'].includes('textQuery') && 1) ||
			0
	);

	// let expandedItems = $derived(['librissearch:findCategory', 'language']); // use snapshots or page.state to remember state when navigating away from a find route...

	function getClearAllHref() {
		// TODO: Fix clear all links on AND filters
		const textQuery = mapping?.[0].children?.find((m) => m['@id']?.includes('textQuery'));
		return page.data.localizeHref(
			'/find?' + new URLSearchParams([['_q', textQuery?.displayStr || '*']]).toString()
		);
	}
</script>

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
		class={[
			'filters-list relative overflow-x-hidden overflow-y-auto overscroll-contain',
			navigating.to && navigating.from?.url.pathname === navigating.to?.url.pathname && 'opacity-50'
		]}
		tabindex={-1}
	>
		<!--
			The following warning is most certainly a false alarm according to https://github.com/sveltejs/svelte/issues/8416
			and https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/menu
		-->
		<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
		<!-- 
			<menu
			role="menubar"
			class="outline-active min-h-full -outline-offset-2 focus:outline-2"
			aria-label={page.data.t('search.filtersMenubar')}
			onkeydown={(event) => console.log('event.key', event.key)}
			tabindex={0}
		-->
		<menu role="menubar">
			<!-- 
				Temporarily filter out librissearch:hasInstanceCategory as it causes duplicate keys (Reproduktion i originalstorlek)
				and we don't want to rely on value.view.id as it changes after navigating
			-->
			{#each facets.filter((facet) => facet.dimension !== 'librissearch:hasInstanceCategory') as facet (facet.dimension)}
				<FacetGroup data={facet} level={1} />
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
	@reference 'tailwindcss'

	:global(dialog .filters) {
		margin-right: calc(var(--spacing) * -4);
		margin-left: calc(var(--spacing) * -4);
	}

	.filters-list {
		height: calc(var(--leading-pane-height) - var(--toolbar-height) * 2);
		scrollbar-width: thin;
		scrollbar-gutter: stable;
	}

	details {
		&[open] > summary,
		& > summary:hover {
			color: var(--color-body);
		}

		&[open] .chevron {
			transform: rotate(90deg);
		}
	}

	[role='menu'] {
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: calc(var(--spacing, 1) * var(--level) * 4);
			height: 100%;
			background: none;
			mask-image: url('$lib/assets/img/treeview-indent.svg');
			mask-repeat: repeat-y;
			mask-position: center right;
			pointer-events: none;
		}

		&:hover::after,
		&:has(:focus-within)::after {
			background: var(--color-neutral-300);
		}
	}

	[role='menu'] {
		&:has(.limit.show-less input[type='radio']:checked) {
			& [role='menuitem'],
			[role='menuitemcheckbox'],
			[role='menuitemradio'] {
				display: none;

				&:nth-child(-n + 5) {
					display: flex;
				}
			}
		}
		&:has(.limit.show-more input[type='radio']:checked) [role='menuitem'] {
			display: flex;
		}

		.limit:has(:checked) {
			display: none;
		}
	}

	.focusable {
		outline-offset: -2px;

		&:hover {
			background: var(--color-primary-100);
		}
		&:focus-visible,
		&:has(:focus) {
			background: var(--color-accent-50);
			outline-color: var(--color-active);
			@apply outline-2;
		}
	}

	[role='menuitemcheckbox'][aria-checked='true']::before {
		content: '';
		background-image: url('$lib/assets/img/checkbox-checked.svg');
		background-size: cover;
		background-repeat: no-repeat;
		content: '';
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}

	[role='menuitemcheckbox'][aria-checked='false']::before {
		mask-image: url('$lib/assets/img/checkbox-unchecked.svg');
		background: var(--color-neutral-500);
		mask-size: cover;
		background-size: cover;
		background-repeat: no-repeat;
		content: '';
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}
</style>
