<script lang="ts">
	import { page, navigating } from '$app/state';
	import type { FacetValue } from '$lib/types/search';
	import IconRemove from '~icons/bi/x-lg';

	type Props = {
		data: FacetValue;
		operator: 'AND' | 'OR';
	};

	const { data, operator }: Props = $props();
</script>

<a
	role={operator === 'OR' ? 'menuitemcheckbox' : 'menuitem'}
	class={[
		'focusable text-subtle hover:text-body focus-visible:text-body flex min-h-8 w-full items-center gap-2 text-sm',
		navigating.to && 'cursor-default',
		operator === 'OR' && 'with-checkbox',
		data.dimension === 'librissearch:findCategory' && 'with-radio'
	]}
	href={data.view['@id']}
	data-sveltekit-keepfocus
	data-sveltekit-preload-data="false"
	aria-checked={data.selected}
	onclick={(event: MouseEvent) => {
		if (navigating.to) event?.preventDefault();
	}}
>
	<div class={['flex items-baseline overflow-hidden']}>
		<span class={['truncate', data.selected && 'text-link font-medium']}>
			{data.label}
		</span>
		{#if !(operator === 'AND' && data.selected)}
			<span class="text-placeholder text-3xs ml-2">
				{data.totalItems.toLocaleString(page.data.locale)}
				<span class="sr-only"
					>{data.totalItems === 1
						? page.data.t('search.hitsOne')
						: page.data.t('search.hits')}</span
				>
			</span>
		{/if}
	</div>
	{#if operator === 'AND' && typeof data.selected === 'boolean' && data.selected}
		<span class="text-subtle"><IconRemove /></span>
	{/if}
</a>

<style lang="postcss">
	@reference 'tailwindcss'

	:global(dialog .filters) {
		margin-right: calc(var(--spacing) * -4);
		margin-left: calc(var(--spacing) * -4);
	}

	details {
		&[open] > summary,
		& > summary:hover {
			color: var(--color-body);
		}

		&[open] .chevron {
			transform: rotate(90deg);
		}
	}

	[role='menu'] {
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: calc(var(--spacing, 1) * var(--level) * 4);
			height: 100%;
			background: none;
			mask-image: url('$lib/assets/img/treeview-indent.svg');
			mask-repeat: repeat-y;
			mask-position: center right;
			pointer-events: none;
		}

		&:hover::after,
		&:has(:focus-within)::after {
			background: var(--color-neutral-300);
		}
	}

	[role='menu'] {
		&:has(.limit.show-less input[type='radio']:checked) {
			& [role='menuitem'],
			[role='menuitemcheckbox'],
			[role='menuitemradio'] {
				display: none;

				&:nth-child(-n + 5) {
					display: flex;
				}
			}
		}
		&:has(.limit.show-more input[type='radio']:checked) [role='menuitem'] {
			display: flex;
		}

		.limit:has(:checked) {
			display: none;
		}
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

	.with-checkbox[aria-checked='true']::before {
		content: '';
		background-image: url('$lib/assets/img/checkbox-checked.svg');
		background-size: cover;
		background-repeat: no-repeat;
		content: '';
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}

	.with-checkbox[aria-checked='false']::before {
		mask-image: url('$lib/assets/img/checkbox-unchecked.svg');
		background: var(--color-neutral-500);
		mask-size: cover;
		background-size: cover;
		background-repeat: no-repeat;
		content: '';
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}

	.with-radio[aria-checked='true']::before {
		content: '';
		background: none;
		background-image: url('$lib/assets/img/radio-checked.svg');
		background-size: cover;
		background-repeat: no-repeat;
		mask-image: none;
		content: '';
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}

	.with-radio::before {
		content: '';
		mask-image: url('$lib/assets/img/radio-unchecked.svg');
		background: var(--color-neutral-500);
		mask-size: cover;
		background-size: cover;
		background-repeat: no-repeat;
		content: '';
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}

	[role='menuitem'],
	[role='menuitemcheckbox'] {
		padding-left: calc(var(--level, 0) * var(--spacing) * 8);
		padding-right: calc(var(--spacing) * 3);
	}
</style>
