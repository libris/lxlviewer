<script lang="ts">
	import { page } from '$app/state';
	import { MY_LIBRARIES_FILTER_ALIAS } from '$lib/constants/facets';
	import type { FacetValue as FacetValueType } from '$lib/types/search';
	import Facet from './Facet.svelte';
	import FacetLink from './FacetLink.svelte';
	import BiPencil from '~icons/bi/pencil';

	type Props = {
		items: FacetValueType[];
		level: number;
		searchPhrase: string;
		permanentlyExpanded: boolean;
		parentLabel: string;
		enhanced: boolean;
	};
	const { items, level, searchPhrase, permanentlyExpanded, parentLabel, enhanced }: Props =
		$props();
</script>

<ul data-testid={level === 1 && !permanentlyExpanded ? 'facet-list' : undefined}>
	{#each items as value, index (parentLabel + value.label + index)}
		{const label = value?.str}
		{#if value.facets}
			{@const childLabel = `${page.data.t('search.allInFacet')} ` + label.toLowerCase()}
			<li>
				<Facet
					data={{
						...value.facets[0],
						values: [
							...(level === 1
								? [
										{
											// FIXME
											label: childLabel,
											str: childLabel,
											totalItems: value.totalItems,
											selected: value.selected,
											view: value.view,
											all: true,
											facets: value.facets.length > 1 ? value.facets.slice(1) : undefined
										}
									]
								: []),
							...value.facets[0].values
						]
					}}
					level={level + 1}
					{searchPhrase}
					parent={value}
					isDefaultExpanded={false}
					{enhanced}
				/>
			</li>
		{:else if value.alias === MY_LIBRARIES_FILTER_ALIAS}
			{#if page.data.features.favouriteLibraries}
				<li
					class={[
						'flex',
						permanentlyExpanded && '[&>a:first-child]:w-full [&>a:first-child]:pl-4!'
					]}
				>
					<FacetLink data={value} />
					<a
						href={page.data.localizeHref('/my-pages')}
						class="btn btn-primary mr-2 size-8 border-0"
						aria-label={page.data.t('search.changeLibraries')}
					>
						<BiPencil class="text-neutral-500" aria-hidden="true" />
					</a>
				</li>
			{/if}
		{:else}
			<li class={[permanentlyExpanded && '[&>a]:pl-4!']}>
				<FacetLink data={value} />
			</li>
		{/if}
	{/each}
</ul>

<style>
</style>
