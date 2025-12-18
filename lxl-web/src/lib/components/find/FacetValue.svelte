<script lang="ts">
	import { page } from '$app/state';

	import DecoratedDataLite from '$lib/components/DecoratedDataLite.svelte';

	import type { FacetOperator, FacetValue } from '$lib/types/search';

	interface Props {
		data: FacetValue;
		operator?: FacetOperator;
		all?: boolean;
	}

	let { data, operator, all }: Props = $props();
</script>

<a
	role={operator === 'OR' ? 'menuitemcheckbox' : 'menuitem'}
	class={[
		`focusable flex min-h-8 items-center no-underline`,
		operator === 'OR' && 'with-checkbox',
		(operator === 'AND' || all) && 'with-radio'
	]}
	href={page.data.localizeHref(data.view['@id'])}
	aria-checked={data.selected}
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

	[role='menuitem'],
	[role='menuitemcheckbox'] {
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

	.with-checkbox::before {
		content: '';
		background-size: cover;
		background-image: url('$lib/assets/img/checkbox-unchecked.svg');
		background-repeat: no-repeat;
		content: '';
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		margin-right: calc(var(--spacing) * 2);
	}
	.with-checkbox[aria-checked='true']::before {
		background-image: url('$lib/assets/img/checkbox-checked.svg');
	}

	.with-radio::before {
		content: '';
		background-size: cover;
		background-image: url('$lib/assets/img/radio-unchecked.svg');
		background-repeat: no-repeat;
		content: '';
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		margin-right: calc(var(--spacing) * 2);
	}
	.with-radio[aria-checked='true']::before {
		background-image: url('$lib/assets/img/radio-checked.svg');
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
