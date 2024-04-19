<script lang="ts">
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import type { DisplayMapping, SearchOperators } from './search';
	import BiXLg from '~icons/bi/x-lg';
	export let mapping: DisplayMapping[];
	export let parentOperator: keyof typeof SearchOperators | undefined = undefined;
	export let depth = 0;

	function getRelationSymbol(operator: keyof typeof SearchOperators): string {
		switch (operator) {
			case 'equals':
				return '';
			case 'notEquals':
				return '≠';
			case 'greaterThan':
				return '＞';
			case 'greaterThanOrEquals':
				return '⩾';
			case 'lessThan':
				return '＜';
			case 'lessThanOrEquals':
				return '⩽';
			default:
				return '';
		}
	}
</script>

<ul class="flex flex-wrap items-center gap-2">
	{#each mapping as m}
		<li
			class="mapping-item {m.children ? 'pill-group' : 'pill'} pill-{m.operator}"
			class:outer={depth === 0}
		>
			{#if 'children' in m}
				<svelte:self mapping={m.children} parentOperator={m.operator} depth={depth + 1} />
			{:else if 'label' in m && 'display' in m}
				{@const symbol = getRelationSymbol(m.operator)}
				<div class="pill-label inline-block text-2-regular first-letter:uppercase">{m.label}</div>
				<span class="pill-relation">{symbol}</span>
				<span class="pill-value">
					<DecoratedData data={m.display} showLabels={ShowLabelsOptions['Never']} />
				</span>
			{/if}
			{#if 'up' in m}
				<span class="pill-remove inline-block align-sub">
					<a class="float-right pl-2" href={m.up?.['@id']}>
						<BiXLg class="text-icon-inv-secondary" />
					</a>
				</span>
			{/if}
		</li>
		{#if parentOperator}
			<li class="pill-between pill-between-{parentOperator}">{parentOperator}</li>
		{/if}
	{/each}
</ul>

<style lang="postcss">
	.mapping-item {
		@apply rounded-md py-2 pl-3 pr-3 brightness-100 text-3-cond-bold;
		transition: filter 0.1s ease;
	}

	.mapping-item:has(> .pill-remove:hover) {
		@apply brightness-75;
	}

	.pill {
		@apply bg-positive-inv text-primary-inv;

		& .pill-label,
		.pill-relation {
			@apply text-secondary-inv;
		}
	}

	.pill-notEquals {
		@apply bg-negative text-primary;

		& .pill-label,
		.pill-relation {
			@apply text-secondary;
		}
	}

	.pill-group {
		@apply flex items-center gap-2 bg-pill/8 p-0 pr-4;

		&.outer {
			@apply bg-transparent;
		}
	}

	.pill-between,
	.pill-relation {
		@apply uppercase text-primary text-2-regular;
	}

	.pill-between-and,
	.pill-between:last-of-type {
		@apply hidden;
	}
	.pill-remove {
	}
</style>
