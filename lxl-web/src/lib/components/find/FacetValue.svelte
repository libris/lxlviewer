<script lang="ts">
	import { page } from '$app/state';

	import BiCheckSquareFill from '~icons/bi/check-square-fill';
	import BiSquare from '~icons/bi/square';
	import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';
	import type { Facet, MultiSelectFacet } from '$lib/types/search';

	interface Props {
		facet: Facet | MultiSelectFacet;
		isEmbedded?: boolean; // should we not draw our own borders
	}

	let { facet, isEmbedded = false }: Props = $props();
</script>

<a
	class={[
		`facet-link grid flex-1 grid-cols-[auto_auto] items-end justify-between gap-2 py-1.5 font-normal no-underline`,
		isEmbedded ? 'hover:bg-primary-100' : 'ml-4.5 border-l border-l-neutral-200 pr-3 pl-4'
	]}
	href={page.data.localizeHref(facet.view['@id'])}
	data-sveltekit-preload-data="false"
>
	<span class="truncate" title={facet.str}>
		{#if 'selected' in facet}
			<!-- checkboxes -->
			<span class="sr-only">{facet.selected ? page.data.t('search.activeFilter') : ''}</span>
			<div class="bg-page mr-1 inline-block rounded-sm text-xs" aria-hidden="true">
				{#if facet.selected}
					<BiCheckSquareFill class="text-accent" />
				{:else}
					<BiSquare class="text-subtle" />
				{/if}
			</div>
		{/if}
		<span>
			<DecoratedDataLite data={facet.object} />
			{#if facet.discriminator}
				<span class="text-subtle">({facet.discriminator})</span>
			{/if}
		</span>
	</span>
	{#if facet.totalItems > 0}
		<span class="badge" aria-label="{facet.totalItems} {page.data.t('search.hits')}"
			>{facet.totalItems.toLocaleString(page.data.locale)}</span
		>
	{/if}
</a>
