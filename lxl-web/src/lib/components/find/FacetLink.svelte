<script lang="ts">
	import { page } from '$app/state';
	import { JsonLd } from '$lib/types/xl';
	import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';
	import type { FacetValue } from '$lib/types/search';
	import IconClose from '~icons/bi/x-lg';

	interface Props {
		data: FacetValue;
		className?: string;
	}

	let { data, className }: Props = $props();
</script>

<a
	class={[
		`block px-4 py-1.5 text-sm hover:bg-primary-100 focus-within:bg-accent-50`,
		className,
		data.selected && 'selected'
	]}
	href={page.data.localizeHref(data.view[JsonLd.ID])}
	data-sveltekit-preload-data="false"
	data-sveltekit-keepfocus
	data-sveltekit-noscroll
>
	<span title={data.str} class="mr-1">
		<span class={[data.selected && !className && 'text-accent font-medium']}>
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
	{#if data.totalItems !== 0 && (!data.selected || className)}
		<span class="text-placeholder text-xs">{data.totalItems.toLocaleString(page.data.locale)}</span>
		<span class="sr-only">
			{data.totalItems === 1 ? page.data.t('search.hitsOne') : page.data.t('search.hits')}
		</span>
	{/if}
	{#if data.selected && !className}
		<span class="text-subtle ml-auto" aria-hidden="true">
			<IconClose class="inline" />
		</span>
	{/if}
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

	/* still used as no-js fallback */
	.with-checkbox::before,
	.with-radio::before {
		content: '';
		display: inline-block;
		mask-size: cover;
		mask-repeat: no-repeat;
		background: var(--color-neutral-500);
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		margin-right: calc(var(--spacing) * 1.5);
	}

	.with-checkbox:hover::before,
	.with-radio:hover::before {
		background: var(--color-neutral-700);
	}

	.with-checkbox::before {
		mask-image: url('$lib/assets/img/checkbox-unchecked.svg');
	}
	.with-radio::before {
		mask-image: url('$lib/assets/img/radio-unchecked.svg');
	}

	.with-checkbox.selected::before {
		mask-image: url('$lib/assets/img/checkbox-checked.svg');
	}

	.with-radio.selected::before {
		mask-image: url('$lib/assets/img/radio-checked.svg');
	}

	.with-checkbox.selected::before,
	.with-radio.selected::before {
		background: var(--color-accent);
	}

	.with-checkbox.selected:hover::before,
	.with-radio.selected:hover::before {
		background: var(--color-accent-700);
	}
</style>
