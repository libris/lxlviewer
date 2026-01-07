<script lang="ts">
	import { page } from '$app/state';

	import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';

	import type { FacetValue } from '$lib/types/search';

	import IconClose from '~icons/bi/x-lg';

	interface Props {
		data: FacetValue;
		parentDimension: string;
		variant?: 'radio' | 'checkbox';
	}

	let { data, parentDimension, variant }: Props = $props();

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
		parentDimension.split('/')[0] === 'librissearch:findCategory' &&
			variant === 'checkbox' &&
			'text-2xs'
	]}
	href={page.data.localizeHref(data.view['@id'])}
	data-sveltekit-preload-data="false"
>
	<span class="truncate" title={data.str}>
		<span class="truncate">
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
	{#if data.totalItems > 0}
		<span class="text-placeholder text-3xs ml-2">
			{data.totalItems.toLocaleString(page.data.locale)}
			<span class="sr-only">
				{data.totalItems === 1 ? page.data.t('search.hitsOne') : page.data.t('search.hits')}
			</span>
		</span>
	{/if}
	{#if data.selected && !variant}
		<span class="text-placeholder onhover mr-2 ml-auto hidden" aria-hidden="true">
			<IconClose />
		</span>
	{/if}
</a>

<style lang="postcss">
	@reference 'tailwindcss';

	a {
		padding-left: calc((var(--level, 0) * var(--spacing) * 5) + var(--spacing) * 3);
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

	.with-and::before {
		content: '';
		flex-shrink: 0;
		margin-right: calc(var(--spacing) * 2);
		border-radius: calc(infinity * 1px);
		background-color: var(--color-neutral-400);
		width: calc(var(--spacing) * 1.75);
		height: calc(var(--spacing) * 1.75);
		transform: scale(0.4);
		transform-origin: center;
		/*margin-left: calc(var(--spacing));*/
	}
	.with-and.selected::before {
		width: calc(var(--spacing) * 1.75);
		height: calc(var(--spacing) * 1.75);
		background-color: var(--color-accent-600);
		transform: scale(1);
	}

	.with-checkbox::before {
		content: '';
		background-size: cover;
		background-image: url('$lib/assets/img/checkbox-unchecked.svg');
		background-repeat: no-repeat;
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		margin-right: calc(var(--spacing) * 2);
	}
	.with-checkbox.selected::before {
		background-image: url('$lib/assets/img/checkbox-checked.svg');
	}

	.with-radio::before {
		content: '';
		background-size: cover;
		background-image: url('$lib/assets/img/radio-unchecked.svg');
		background-repeat: no-repeat;
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		margin-right: calc(var(--spacing) * 2);
	}
	.with-radio.selected::before {
		background-image: url('$lib/assets/img/radio-checked.svg');
	}

	.focusable {
		outline-offset: -2px;

		&:hover {
			background: var(--color-primary-100);

			.onhover {
				display: initial;
			}
		}
		&:focus-visible,
		&:has(:focus) {
			background: var(--color-accent-50);
			outline-color: var(--color-active);
			@apply outline-2;
		}
	}
</style>
