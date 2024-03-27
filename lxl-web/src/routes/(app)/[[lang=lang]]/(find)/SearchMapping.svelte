<script lang="ts">
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import type { DisplayMapping, SearchOperators } from './search';
	export let mapping: DisplayMapping[];
	export let parentOperator: keyof typeof SearchOperators;

	function getRelationSymbol(operator: keyof typeof SearchOperators): string {
		switch (operator) {
			case 'equals':
				return '';
			case 'notEquals':
				return 'not';
			case 'greaterThan':
				return '>';
			case 'greaterThanOrEquals':
				return '>=';
			case 'lessThan':
				return '<';
			case 'lessThanOrEquals':
				return '<=';
			default:
				return '';
		}
	}
</script>

<ul class="flex flex-wrap items-center gap-2">
	{#each mapping as m}
		<li class="pill {m.children ? 'pill-group' : ''} pill-{m.operator}">
			{#if 'children' in m}
				<svelte:self mapping={m.children} parentOperator={m.operator} />
			{:else if 'label' in m && 'display' in m}
				{@const symbol = getRelationSymbol(m.operator)}
				<span class="pill-label capitalize text-2-regular">{m.label}</span>
				<span class="pill-relation">{symbol}</span>
				<span class="pill-value">
					<DecoratedData data={m.display} showLabels={ShowLabelsOptions['Never']} />
				</span>
			{/if}
			{#if 'up' in m}
				<a class="pill-remove pl-2 no-underline" href={m.up?.['@id']}>x</a>
			{/if}
		</li>
		{#if parentOperator}
			<li class="pill-between">{parentOperator}</li>
		{/if}
	{/each}
</ul>

<style lang="postcss">
	.pill {
		@apply rounded-md px-4 py-2 brightness-100 text-3-cond-bold;
		transition: filter 0.1s ease;
	}

	.pill:has(> .pill-remove:hover) {
		@apply brightness-75;
	}

	.pill-group {
		@apply flex items-center gap-2 bg-pill/4 p-0 pr-4;
	}

	.pill-equals {
		@apply bg-positive-inv text-primary-inv;

		& .pill-label {
			@apply text-secondary-inv;
		}
	}

	.pill-notEquals {
		@apply bg-negative text-primary;
	}

	.pill-between,
	.pill-relation {
		@apply uppercase text-primary text-1-regular;
	}

	.pill-and > ul .pill-between {
		@apply hidden;
	}

	ul > .pill-between:last-of-type {
		@apply hidden;
	}

	.pill-remove {
		color: inherit;
	}
</style>