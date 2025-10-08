<script lang="ts">
	import SearchMapping from './SearchMapping.svelte';
	import type { DisplayMapping, SearchOperators } from '$lib/types/search';
	import { page } from '$app/state';
	import BiXLg from '~icons/bi/x-lg';
	import BiTrash from '~icons/bi/trash';
	import { getRelationSymbol } from '$lib/utils/getRelationSymbol';

	interface Props {
		mapping: DisplayMapping[];
		parentOperator?: keyof typeof SearchOperators | undefined;
		depth?: number;
		variable?: string;
	}

	let { mapping, parentOperator = undefined, depth = 0, variable }: Props = $props();
</script>

<ul class="flex {depth === 0 ? 'flex-col-reverse' : 'flex-row'} text-2xs items-start gap-2">
	{#each mapping as m, index (`${m['@id']}-${index}`)}
		<li
			class="{m.children ? 'pill-group' : `pill pill-${variable || m.variable}`} pill-{m.operator}"
			class:wildcard={m.operator === 'equals' && m.display === '*'}
			class:outer={depth === 0}
			class:free-text={m?.['@id'] === 'https://id.kb.se/vocab/textQuery'}
		>
			{#if 'children' in m}
				<SearchMapping
					mapping={m.children}
					parentOperator={m.operator}
					depth={depth + 1}
					variable={m.variable || variable}
				/>
			{:else if m.operator === 'existence' || m.operator === 'notExistence'}
				{@const symbol = getRelationSymbol(m.operator)}
				<span class="pill-label pr-1">{symbol} {m.label}</span>
			{:else if 'label' in m && 'display' in m}
				{@const symbol = getRelationSymbol(m.operator)}
				<span class="pill-label pr-1">{m.label}{symbol}</span>
				<span class="pill-value truncate">
					{m.displayStr}
				</span>
			{/if}
			{#if 'up' in m && (!m.children || depth > 0)}
				<span class="pill-remove">
					<a
						href={page.data.localizeHref(m.up?.['@id'])}
						aria-label={page.data.t('search.removeFilter')}
					>
						<BiXLg class="" fill="currentColor" fill-opacity="0.8" />
					</a>
				</span>
			{/if}
			{#if 'up' in m && m.children && depth === 0}
				<span class="pill-remove">
					<a href={page.data.localizeHref(m.up?.['@id'])} class="btn btn-primary">
						<BiTrash aria-hidden="true" />
						{page.data.t('search.clearFilters')}
					</a>
				</span>
			{/if}
		</li>
		{#if parentOperator}
			<li class="pill pill-between pill-between-{parentOperator} text-xs">
				<span>{parentOperator}</span>
			</li>
		{/if}
	{/each}
</ul>

<style lang="postcss">
	@reference 'tailwindcss';

	.pill {
		display: flex;
		align-items: center;
		border-radius: var(--radius-sm);
		padding: calc(var(--spacing) * 1.5);
		gap: calc(var(--spacing) * 0.5);
		transition: background-color 0.2s ease;
	}

	.pill-_q {
		background-color: var(--color-accent-100);
		& .pill-remove:hover {
			background-color: var(--color-accent-200);
		}
	}

	.pill-_r {
		background-color: var(--color-primary-100);
		border: 1px solid var(--color-primary-200);
		& .pill-remove:hover {
			background-color: var(--color-primary-200);
		}
	}

	.pill-group:has(:global(> .pill-remove:hover)) {
		outline: 1px solid var(--color-neutral-300);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	.pill-equals.wildcard {
		display: none;
	}

	.pill-group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: calc(var(--spacing) * 2);

		&.outer {
			background-color: transparent;
		}
	}

	.pill-between,
	.pill-relation {
		text-transform: uppercase;
	}

	.pill-between-and,
	.pill-between:last-of-type {
		display: none;
	}

	.free-text {
		& > .pill-label,
		.pill-relation {
			display: none;
		}

		& > .pill-value::before,
		& > .pill-value::after {
			content: '"';
		}
	}
</style>
