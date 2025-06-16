<script lang="ts">
    import { page } from '$app/state';

    import BiCheckSquareFill from '~icons/bi/check-square-fill';
    import BiSquare from '~icons/bi/square';
    import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';
    import type { Facet, MultiSelectFacet } from '$lib/types/search';
    import type { LocaleCode } from '$lib/i18n/locales';

    export let facet: Facet | MultiSelectFacet;
    export let locale: LocaleCode;
	export let padStyle = "border-l border-l-neutral-200 pl-4 ml-4.5"
</script>

<a
        class="facet-link grid grid-cols-[auto_auto] items-end justify-between gap-2 py-1.5 pr-3 font-normal no-underline {padStyle}"
        href={facet.view['@id']}
>
	<span class="truncate" title={facet.str}>
		{#if 'selected' in facet}
			<!-- checkboxes -->
			<span class="sr-only"
			>{facet.selected ? page.data.t('search.activeFilter') : ''}</span
			>
			<div class="mr-1 inline-block text-xs" aria-hidden="true">
				{#if facet.selected}
					<BiCheckSquareFill class="text-accent"/>
				{:else}
					<BiSquare class="text-subtle"/>
				{/if}
			</div>
		{/if}
		<span>
			<DecoratedDataLite data={facet.object}/>
			{#if facet.discriminator}
				<span class="text-subtle">({facet.discriminator})</span>
			{/if}
		</span>
	</span>
    {#if facet.totalItems > 0}
		<span class="badge" aria-label="{facet.totalItems} {page.data.t('search.hits')}">{facet.totalItems.toLocaleString(locale)}</span>
    {/if}
</a>