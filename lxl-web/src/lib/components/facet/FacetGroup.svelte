<script lang="ts">
	import { page, navigating } from '$app/state';
	import type { Facet } from '$lib/types/search';
	import IconChevron from '~icons/bi/chevron-right';
	import FacetGroup from './FacetGroup.svelte';

	import FacetValue from './FacetValue.svelte';

	type Props = {
		data: Facet;
		level: number;
	};

	const { data, level }: Props = $props();
	const expandedItems = [];
	const selectedValues = $derived(data.values?.filter((value) => value.selected));

	const SHOW_MORE_LIMIT = 5;
</script>

{#snippet limitToggles(name: string)}
	{#snippet _toggle(limited: boolean)}
		<li role="presentation" class={['limit', limited ? 'show-less' : 'show-more']}>
			<label
				class="focusable flex min-h-8 w-full cursor-pointer items-center text-xs font-medium after:content-['…']"
			>
				<!-- svelte-ignore a11y_role_has_required_aria_props -->
				<!-- aria-checked isnn't needed if input type="radio" is used, see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/menuitemradio_role#description -->
				<input
					type="radio"
					{name}
					role="menuitemradio"
					class="cursor-pointer appearance-none focus:outline-0"
					checked={limited}
					value={limited ? 'show-less' : 'show-more'}
					onkeydown={(event: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
						if (navigating.to) {
							event.preventDefault();
						} else {
							if (event.key === 'Enter') {
								event.currentTarget.checked = true;
							}
						}
					}}
				/>
				{#if limited}
					{page.data.t('search.showFewer')}
				{:else}
					{page.data.t('search.showMore')}
				{/if}
			</label>
		</li>
	{/snippet}
	{@render _toggle(false)}
	{@render _toggle(true)}
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<details
	role="menuitem"
	style={`--level:${level}`}
	open={expandedItems?.includes(data.dimension) || !!selectedValues?.length}
	ontoggle={(event: Event & { currentTarget: HTMLDetailsElement }) => {
		if (event.currentTarget.open) {
			//expandedItems.push(facet.dimension);
		} else {
			//expandedItems.splice(expandedItems.findIndex((item) => item === facet.dimension));
		}
	}}
>
	<summary
		class="focusable text-subtle bg-aside flex min-h-8 cursor-pointer items-center text-sm font-medium"
	>
		<span
			aria-hidden="true"
			class={[
				'chevron pointer-events-none flex h-8 w-8 shrink-0 origin-center items-center justify-center transition-transform'
			]}
		>
			<IconChevron class="text-subtle size-3.5" />
		</span>
		<span class={['truncate']}>{data.label}</span>
		{#if selectedValues?.length}
			{@const message = `${selectedValues.length} ${
				selectedValues.length === 1
					? page.data.t('search.selectedFiltersOne').toLowerCase()
					: page.data.t('search.selectedFilters').toLowerCase()
			}`}
			<span
				class="bg-link mx-1.5 size-1.75 shrink-0 rounded-full"
				title={message}
				aria-label={message}
			>
			</span>
		{/if}
		{#if data.totalItems}
			<span class="text-placeholder text-3xs ml-2">
				{data.totalItems.toLocaleString(page.data.locale)}
				<span class="sr-only"
					>{data.totalItems === 1
						? page.data.t('search.hitsOne')
						: page.data.t('search.hits')}</span
				>
			</span>
		{/if}
	</summary>
	<menu role="menu">
		{#each data.values as item (item.label + (item.discriminator || '') + item.totalItems)}
			{#if item.dimension === 'librissearch:findCategory' && item.values}
				<FacetGroup data={item} level={level + 1} />
			{:else}
				<FacetValue data={item} operator={data.operator} />
			{/if}
		{/each}
		{#if data.maxItems > SHOW_MORE_LIMIT && data.values && data.values.length > SHOW_MORE_LIMIT && data.label}
			{@render limitToggles(data.label.toString())}
		{/if}
	</menu>
</details>

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

		&[open] > summary .chevron {
			transform: rotate(90deg);
		}
	}

	/*
	[role='menu'] {
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: calc(var(--spacing, 1) * var(--level) * 4);
			height: 100%;
			mask-image: url('$lib/assets/img/treeview-indent.svg');
			mask-repeat: repeat;
			mask-position: center right;
			pointer-events: none;
			background: var(--color-neutral-300);
		}
	}
		*/

	[role='menu'] {
		&:has(.limit.show-less input[type='radio']:checked) {
			& :global([role='menuitem']),
			:global([role='menuitemcheckbox']),
			:global([role='menuitemradio']),
			:global([role='menu']) {
				&:nth-child(n + 6) {
					display: none;
				}
			}
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

	summary {
		padding-left: calc((var(--level, 0) - 1) * var(--spacing) * 8);
		top: calc((var(--level, 0) - 1) * var(--spacing) * 8);
	}

	label {
		padding-left: calc(var(--level, 0) * var(--spacing) * 8);
	}
</style>
