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

	let expandedItems = $derived(['librissearch:findCategory']); // use snapshots or page.state to remember state when navigating away from a find route...

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
			class="outline-active min-h-full -outline-offset-2 focus:outline-2"
			aria-label={page.data.t('search.filtersMenubar')}
			onkeydown={(event) => console.log('event.key', event.key)}
			tabindex={0}
		>
			<!-- 
				Temporarily filter out librissearch:hasInstanceCategory as it causes duplicate keys (Reproduktion i originalstorlek)
				and we don't want to rely on value.view.id as it changes after navigating
			-->
			{#each facets.filter((facet) => facet.dimension !== 'librissearch:hasInstanceCategory') as facet (facet.dimension)}
				<details
					role="menuitem"
					open={expandedItems.includes(facet.dimension)}
					ontoggle={(event: Event & { currentTarget: HTMLDetailsElement }) => {
						if (event.currentTarget.open) {
							expandedItems = [...expandedItems, facet.dimension];
						} else {
							expandedItems = expandedItems.filter((item) => item !== facet.dimension);
						}
					}}
				>
					<summary
						class="focusable text-subtle flex min-h-9 cursor-pointer items-center text-[0.9375rem] font-medium"
					>
						{@render chevron()}
						<span class="truncate">{facet.label}</span>
					</summary>
					<menu role="menu" style="--level:1">
						{#each facet.values?.slice(0, 5) as value (value.label + (value.discriminator || ''))}
							<a
								role="menuitem"
								class="focusable flex min-h-9 items-center text-sm"
								href={value.view['@id']}
								data-sveltekit-keepfocus
								data-sveltekit-preload-data="false"
							>
								<div class="flex items-baseline overflow-hidden">
									<span class="truncate">{value.label}</span>
									<span class="text-placeholder text-3xs ml-2">
										{value.totalItems.toLocaleString(page.data.locale)}
										<span class="sr-only"
											>{value.totalItems === 1
												? page.data.t('search.hitsOne')
												: page.data.t('search.hits')}</span
										>
									</span>
								</div>
							</a>
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
			background: var(--color-neutral-300);
			mask-image: url('$lib/assets/img/treeview-indent.svg');
			mask-repeat: repeat-y;
			mask-position: center right;
			pointer-events: none;
		}
	}

	[role='menu'] [role='menuitem'] {
		padding-left: calc(var(--level, 0) * var(--spacing) * 8);
		padding-right: calc(var(--spacing) * 3);
	}

	.focusable {
		outline-offset: -2px;

		&:hover {
			background: var(--color-primary-100);
		}
		&:focus-visible {
			background: var(--color-accent-50);
			outline-color: var(--color-active);
			@apply outline-2;
		}
	}
</style>
