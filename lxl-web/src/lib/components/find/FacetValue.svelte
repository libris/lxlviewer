<script lang="ts">
	import { page } from '$app/state';

	import BiCheckSquareFill from '~icons/bi/check-square-fill';
	import BiSquare from '~icons/bi/square';
	import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';

	import type { FacetValue } from '$lib/types/search';

	interface Props {
		data: FacetValue;
		parentDimension: string;
	}

	let { data, parentDimension }: Props = $props();
</script>

<a
	role="menuitem"
	class={[
		`flex min-h-8 items-center no-underline`,
		parentDimension?.split('/').slice(-1)?.toString() === 'librissearch:identifyCategory' &&
			'identify-category'
	]}
	href={page.data.localizeHref(data.view['@id'])}
	data-sveltekit-preload-data="false"
>
	<span class="truncate" title={data.str}>
		{#if 'selected' in data}
			<!-- checkboxes -->
			<span class="sr-only">{data.selected ? page.data.t('search.activeFilter') : ''}</span>
			<div class="bg-page mr-1 inline-block rounded-sm text-xs" aria-hidden="true">
				{#if data.selected}
					<BiCheckSquareFill class="text-accent" />
				{:else}
					<BiSquare class="text-subtle" />
				{/if}
			</div>
		{/if}
		<span class="truncate">
			{#if typeof data.label === 'string'}
				{data.label}
			{:else}
				<DecoratedDataLite data={data.label} />
			{/if}
			{#if data.discriminator}
				<span class="text-subtle">({data.discriminator})</span>
			{/if}
		</span>
	</span>
	{#if data.totalItems > 0}
		<span class="text-placeholder text-3xs ml-2">
			{data.totalItems.toLocaleString(page.data.locale)}
			<span class="sr-only">
				{data.totalItems === 1 ? page.data.t('search.hitsOne') : page.data.t('search.hits')}
			</span>
		</span>
	{/if}
</a>

<style lang="postcss">
	@reference 'tailwindcss';

	[role='menuitem'] {
		padding-left: calc((var(--level, 0) * var(--spacing) * 5) + var(--spacing) * 3);
		padding-right: calc(var(--spacing) * 3);
	}

	/** A rather hacky way to style nested identify categories... */
	[role='menuitem'].identify-category:not(:first-child) {
		padding-left: calc((var(--level, 0) * var(--spacing) * 8) + var(--spacing) * 3);
		@apply text-xs;
	}
</style>
