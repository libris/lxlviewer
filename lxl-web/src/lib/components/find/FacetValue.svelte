<script lang="ts">
	import { page } from '$app/state';

	import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';

	import type { FacetValue } from '$lib/types/search';

	import IconClose from '~icons/bi/x-lg';

	interface Props {
		data: FacetValue;
		variant?: 'radio' | 'checkbox';
		permanent?: boolean;
	}

	let { data, variant, permanent }: Props = $props();

	/*
	const role = $derived.by(() => {
		if (variant === 'radio') return 'menuitemradio';
		if (variant === 'checkbox') return 'menuitemcheckbox';
		return 'menuitem';
	});
	*/
</script>

<a
	class={[
		`focusable flex min-h-8 items-center text-xs no-underline`,
		data.selected && 'selected',
		variant === 'checkbox' && 'with-checkbox',
		variant === 'radio' && 'with-radio',
		!variant && 'with-and',
		permanent && 'pl-4!'
	]}
	href={page.data.localizeHref(data.view['@id'])}
	data-sveltekit-preload-data="false"
>
	<span class="truncate" title={data.str}>
		<span class={['truncate', data.selected && 'text-accent font-medium']}>
			{#if typeof data.label === 'string'}
				{data.label}
			{:else}
				<DecoratedDataLite data={data.label} />
			{/if}
			{#if data.discriminator}
				<span class="text-subtle text-3xs">({data.discriminator})</span>
			{/if}
		</span>
	</span>
	{#if data.totalItems !== 0 && !(data.selected && !variant)}
		<span class="text-placeholder text-2xs ml-2">
			<span class="text-3xs">
				{data.totalItems.toLocaleString(page.data.locale)}
			</span>
			<span class="sr-only">
				{data.totalItems === 1 ? page.data.t('search.hitsOne') : page.data.t('search.hits')}
			</span>
		</span>
	{/if}
	{#if data.selected && !variant}
		<span class="text-subtle ml-auto" aria-hidden="true">
			<IconClose />
		</span>
	{/if}
</a>

<style lang="postcss">
	@reference 'tailwindcss';

	a {
		padding-left: calc(((var(--level, 0) - 1) * var(--spacing) * 5.5) + var(--spacing) * 4);
		padding-right: calc(var(--spacing) * 3);
	}

	/** A rather hacky way to style nested identify categories... */
	/*
	[role='menuitem'].identify-category:not(:first-child),
	[role='menuitemcheckbox'].identify-category:not(:first-child) {
		padding-left: calc((var(--level, 0) * var(--spacing) * 8) + var(--spacing) * 3);
		@apply text-xs;
	}
	*/

	/*
    a[aria-checked='true'] {
        font-weight: var(--font-weight-semibold);
    }
     */

	.with-checkbox::before,
	.with-radio::before {
		content: '';
		mask-size: cover;
		mask-repeat: no-repeat;
		background: var(--color-neutral-400);
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		margin-right: calc(var(--spacing) * 2);
	}

	.with-checkbox:hover::before,
	.with-radio:hover::before {
		background: var(--color-neutral-500);
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
