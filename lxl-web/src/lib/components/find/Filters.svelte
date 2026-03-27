<script lang="ts">
	import { navigating, page } from '$app/state';
	import FacetGroup from '$lib/components/find/FacetGroup.svelte';
	import { DEFAULT_FACETS_EXPANDED } from '$lib/constants/facets';
	import { getModalContext } from '$lib/contexts/modal';
	import type { DisplayMapping, Facet } from '$lib/types/search';
	import { displayMappingToString } from '$lib/utils/displayMappingToString';
	import BiSearch from '~icons/bi/search';
	import SearchMapping from './SearchMapping.svelte';

	type Props = {
		facets: Promise<Facet[]> | null;
		mapping?: DisplayMapping[];
	};

	const { facets, mapping }: Props = $props();
	let data = $state<Facet[] | null>(null);
	let loading = $state(true);
	let error = $state<unknown>(null);

	let current = 0;

	$effect(() => {
		if (!facets) {
			if (!data) loading = true;
			return;
		}

		const id = ++current;
		loading = true;
		error = null;

		Promise.resolve(facets)
			.then((resolved) => {
				if (id === current) {
					data = resolved;
				}
			})
			.catch((e) => {
				if (id === current) {
					error = e;
				}
			})
			.finally(() => {
				if (id === current) {
					loading = false;
				}
			});
	});

	function shouldShowMapping(m: DisplayMapping[]) {
		return !!displayMappingToString(m).trim();
	}

	const inModal = getModalContext();

	let searchPhrase = $state('');
</script>

<div class="flex flex-col gap-4">
	{#if mapping && inModal && shouldShowMapping(mapping)}
		<nav aria-label={page.data.t('search.selectedFilters')}>
			<SearchMapping {mapping} />
		</nav>
	{/if}
	{#if data}
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
						class="bg-input h-9 w-full rounded-sm border border-neutral-300 pr-2 pl-8 text-base sm:text-sm"
						type="search"
						name={page.data.t('search.findFilter')}
					/>
					<BiSearch class="text-subtle absolute top-0 left-2.5 h-9 text-sm" />
				</div>
				<ul
					aria-labelledby={'tab-filters'}
					class={[
						'text-sm',
						((navigating.to && navigating.from?.url.pathname === navigating.to?.url.pathname) ||
							loading) &&
							'pointer-events-none opacity-50'
					]}
				>
					{#each data as facet, index (facet.dimension)}
						<li>
							<FacetGroup
								data={facet}
								level={1}
								{searchPhrase}
								isDefaultExpanded={index < DEFAULT_FACETS_EXPANDED}
							/>
						</li>
					{/each}
				</ul>
			</nav>
		{/if}
	{:else if loading}
		<div aria-busy="true" class="skeleton-container flex flex-col gap-2 overflow-hidden p-4">
			{#each new Array(10)}
				<div class="skeleton bg-neutral min-h-3 w-full"></div>
				<div class="skeleton bg-neutral min-h-2 w-3/4"></div>
				<div class="skeleton bg-neutral mb-2 min-h-2 w-5/6"></div>
			{/each}
		</div>
	{:else if error}
		<p>{error}</p>
	{/if}
</div>

<style lang="postcss">
	:global(dialog .facet-nav) {
		margin-right: calc(var(--spacing) * -4);
		margin-left: calc(var(--spacing) * -4);
	}

	.skeleton-container {
		max-height: calc(
			100vh - var(--app-bar-height) - var(--banner-height, 0) - var(--toolbar-height, 0)
		);
	}
</style>
