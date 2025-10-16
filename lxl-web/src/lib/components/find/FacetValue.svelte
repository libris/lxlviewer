<script lang="ts">
	import { page } from '$app/state';

	import BiCheckSquareFill from '~icons/bi/check-square-fill';
	import BiSquare from '~icons/bi/square';
	import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';
	import type { Facet, MultiSelectFacet } from '$lib/types/search';
	import type { LocaleCode } from '$lib/i18n/locales';

	interface Props {
		facet: Facet | MultiSelectFacet;
		locale: LocaleCode;
		isEmbedded?: boolean; // should we not draw our own borders
	}

	let { facet, locale, isEmbedded = false }: Props = $props();
	const pad_margin = isEmbedded
		? 'class="hover:bg-primary-100'
		: ' ml-4.5 pr-3 pl-4 border-l border-l-neutral-200';
</script>

<a
	class={`facet-link grid flex-1 grid-cols-[auto_auto] items-end justify-between gap-2 py-1.5 font-normal no-underline ${pad_margin}`}
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
			>{facet.totalItems.toLocaleString(locale)}</span
		>
	{/if}
</a>
