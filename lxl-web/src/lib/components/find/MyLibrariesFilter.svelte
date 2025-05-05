<script lang="ts">
	import { page } from '$app/state';
	import type { FacetGroup, MultiSelectFacet } from '$lib/types/search';
	import popover from '$lib/actions/popover';
	import { MY_LIBRARIES_FILTER_ALIAS } from '$lib/constants/facets';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import BiCheckSquareFill from '~icons/bi/check-square-fill';
	import BiSquare from '~icons/bi/square';

	type MyLibrariesFilterProps = { facets: FacetGroup[] };
	const { facets }: MyLibrariesFilterProps = $props();

	const myLibrariesValues = $derived(Object.values(getUserSettings()?.myLibraries || {}));

	const boolFilters = $derived(
		facets.filter((f) => f.dimension === 'boolFilters')[0]?.facets
	) as MultiSelectFacet[];
	const myLibsFacetObj = $derived(
		boolFilters.filter((f) => f.alias === MY_LIBRARIES_FILTER_ALIAS)?.[0]
	);
	const isFilterActive = $derived((myLibrariesValues.length && myLibsFacetObj?.selected) || false);

	const applyFilterUrl = $derived.by(() => {
		const paramsCopy = new URLSearchParams(page.url.searchParams);
		let q = paramsCopy.get('_q');
		q = q === '*' ? '' : q;
		paramsCopy.set('_q', `${q?.trim()} ${MY_LIBRARIES_FILTER_ALIAS}`);
		return 'find?' + paramsCopy.toString();
	});

	const removeFilterUrl = $derived(myLibsFacetObj?.view?.['@id']);
</script>

{#snippet filterContent()}
	<div class="flex items-baseline gap-2 text-xs">
		<span class="sr-only">{isFilterActive ? page.data.t('search.activeFilter') : ''}</span>
		<div
			class={['text-subtle bg-page flex rounded-sm', !myLibrariesValues.length && 'text-subtle/50']}
			aria-hidden="true"
		>
			{#if isFilterActive}
				<BiCheckSquareFill class="text-accent" />
			{:else}
				<BiSquare />
			{/if}
		</div>
		<span>{page.data.t('search.limitToLibraries')}</span>
	</div>
{/snippet}

<div
	class="text-2xs bg-accent/10 border-neutral flex w-full gap-2 rounded-sm border-b p-3 md:flex-col md:gap-1"
>
	{#if myLibrariesValues.length}
		<a class="no-underline" href={isFilterActive ? removeFilterUrl : applyFilterUrl}>
			{@render filterContent()}
		</a>
	{:else}
		<div
			class="cursor-not-allowed"
			use:popover={{
				title: page.data.t('search.noAddedLibrariesText'),
				placeAsSibling: true
			}}
		>
			{@render filterContent()}
		</div>
	{/if}
	<a class="link-subtle self-end" href="/my-pages"
		>{myLibrariesValues.length
			? page.data.t('search.changeLibraries')
			: page.data.t('search.addLibraries')}</a
	>
</div>
