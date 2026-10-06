<script lang="ts">
	import { page } from '$app/state';
	import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';
	import type { FacetValue } from '$lib/types/search';
	import IconClose from '~icons/bi/x-lg';

	interface Props {
		data: FacetValue;
	}

	let { data }: Props = $props();
</script>

<a
	class={[
		`block px-4 py-1.5 text-sm hover:bg-primary-100 focus-within:bg-accent-50`,
		data.selected && 'selected'
	]}
	href={page.data.localizeHref(data.view['@id'])}
	data-sveltekit-preload-data="false"
	data-sveltekit-keepfocus
	data-sveltekit-noscroll
>
	<span title={data.str} class="mr-1">
		<span class={[data.selected && 'text-accent font-medium']}>
			{#if typeof data.label === 'string'}
				{data.label}
			{:else}
				<DecoratedDataLite data={data.label} />
			{/if}
			{#if data.discriminator}
				<span class="text-subtle text-2xs">({data.discriminator})</span>
			{/if}
		</span>
		{#if data.selected}
			<span class="sr-only">({page.data.t('search.activeFilter')})</span>
		{/if}
	</span>
	{#if data.totalItems !== 0 && !data.selected}
		<span class="text-placeholder text-xs">{data.totalItems.toLocaleString(page.data.locale)}</span>
		<span class="sr-only">
			{data.totalItems === 1 ? page.data.t('search.hitsOne') : page.data.t('search.hits')}
		</span>
	{/if}
	{#if data.selected}
		{console.log(data)}
		<span class="text-subtle ml-auto" aria-hidden="true">
			<IconClose class="inline" />
		</span>
	{/if}
	<!-- <span class="sr-only">
		{page.data.t('search.clickTo')}
		{#if data.selected}
			{page.data.t('search.removeFilter')}
		{:else}
			{page.data.t('search.addFilter')}
		{/if}
	</span> -->
</a>

<style lang="postcss">
	@reference 'tailwindcss';

	a {
		padding-left: calc(((var(--level, 0) - 1) * var(--spacing) * 5.5) + var(--spacing) * 4);
		padding-right: calc(var(--spacing) * 3);
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
</style>
