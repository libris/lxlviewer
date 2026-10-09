<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import Facet from '$lib/components/find/Facet.svelte';
	import { DEFAULT_FACETS_EXPANDED } from '$lib/constants/facets';
	import { getModalContext } from '$lib/contexts/modal';
	import type { DisplayMapping, Facet as FacetType } from '$lib/types/search';
	import { displayMappingToString } from '$lib/utils/displayMappingToString';
	import BiSearch from '~icons/bi/search';
	import SearchMapping from './SearchMapping.svelte';

	type Props = {
		facets: Promise<FacetType[]>;
		mapping?: DisplayMapping[];
	};

	const { facets, mapping }: Props = $props();

	let facetData = $state<FacetType[] | null>(null);
	const initialFacets: FacetType[] | null = $derived(Array.isArray(facets) ? facets : null);
	let error: string | null = $state(null);
	let loading = $state(false);
	let requestId = 0;
	let enhanced = $state(false);

	$effect(() => {
		if (browser) {
			// used to enable facet link-fallbacks
			enhanced = true;
		}
	});

	$effect(() => {
		const id = ++requestId;

		if (!facets) return;

		if (Array.isArray(facets)) {
			facetData = facets;
			loading = false;
			return;
		}

		const timeout = setTimeout(() => {
			loading = true;
		}, 50);

		facets
			.then((data) => {
				if (id !== requestId) return;

				clearTimeout(timeout);
				facetData = data;
				loading = false;
			})
			.catch((e) => {
				error = e.message;
				loading = false;
			});

		return () => {
			clearTimeout(timeout);
		};
	});

	function shouldShowMapping(m: DisplayMapping[]) {
		return !!displayMappingToString(m).trim();
	}

	const inModal = getModalContext();

	let searchPhrase = $state('');
</script>

{#snippet facetSnippet(data: FacetType[], loading: boolean = false)}
	{#if data?.length}
		<nav
			class="facet-nav"
			aria-label={page.data.t('search.filters')}
			data-testid="facets"
			aria-busy={loading}
		>
			<div class="relative mx-3 mt-3">
				<input
					bind:value={searchPhrase}
					placeholder={page.data.t('search.findFilter')}
					aria-label={page.data.t('search.findFilter')}
					class="bg-input h-9 w-full rounded-sm border border-neutral-500 pr-2 pl-8 text-base sm:text-sm"
					type="search"
					name={page.data.t('search.findFilter')}
				/>
				<BiSearch class="text-subtle absolute top-0 left-2.5 h-9 text-sm pointer-events-none" />
			</div>
			<ul
				aria-labelledby="tab-filters"
				class={['text-sm', loading && 'pointer-events-none opacity-50']}
			>
				{#each data as facet, index (facet.dimension)}
					<li aria-label={facet.dimension}>
						<Facet
							data={facet}
							level={1}
							{searchPhrase}
							isDefaultExpanded={index < DEFAULT_FACETS_EXPANDED}
							{enhanced}
						/>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}
{/snippet}

{#snippet skeleton()}
	<div aria-busy="true" class="skeleton-container flex flex-col gap-2 overflow-hidden p-4">
		{#each new Array(10)}
			<div class="skeleton bg-neutral min-h-3 w-full"></div>
			<div class="skeleton bg-neutral min-h-2 w-3/4"></div>
			<div class="skeleton bg-neutral mb-2 min-h-2 w-5/6"></div>
		{/each}
	</div>
{/snippet}

<div class="flex flex-col gap-4">
	{#if mapping && inModal && shouldShowMapping(mapping)}
		<nav aria-label={page.data.t('search.selectedFilters')}>
			<SearchMapping {mapping} />
		</nav>
	{/if}
	{#if facetData ?? initialFacets}
		{@render facetSnippet(facetData ?? initialFacets!, loading)}
	{:else if error}
		<p class="text-severe-700">{error}</p>
	{:else}
		{@render skeleton()}
	{/if}
</div>

<style lang="postcss">
	:global(dialog .facet-nav) {
		margin-right: calc(var(--spacing) * -4);
		margin-left: calc(var(--spacing) * -4);
	}

	.skeleton-container {
		max-height: calc(
			100vh - var(--appbar-height) - var(--banner-height, 0) - var(--toolbar-height, 0)
		);
	}
</style>
