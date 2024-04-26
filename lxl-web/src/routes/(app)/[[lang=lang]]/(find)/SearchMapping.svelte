<script lang="ts">
	import { page } from '$app/stores';
	import DecoratedData from '$lib/components/DecoratedData.svelte';
	import { ShowLabelsOptions } from '$lib/types/DecoratedData';
	import type { DisplayMapping, SearchOperators } from './search';
	import BiXLg from '~icons/bi/x-lg';
	import BiPencil from '~icons/bi/pencil';
	import BiTrash from '~icons/bi/trash';
	export let mapping: DisplayMapping[];
	export let parentOperator: keyof typeof SearchOperators | undefined = undefined;
	export let depth = 0;

	$: showEditButton =
		$page.url.pathname === `${$page.data.base}find` &&
		$page.url.searchParams.get('_q') !== $page.url.searchParams.get('_i');
	$: editActive = $page.url.searchParams.get('_x') === 'advanced';
	$: toggleEditUrl = editActive
		? $page.url.href.replace('&_x=advanced', '')
		: `${$page.url.href}&_x=advanced`;

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
			case 'existence':
				return '∃';
			case 'notExistence':
				return '∄';
			default:
				return '';
		}
	}
</script>

<ul class="flex flex-wrap items-center gap-2">
	{#each mapping as m}
		<li
			class="mapping-item {m.children ? 'pill-group' : 'pill'} pill-{m.operator}"
			class:wildcard={m.operator === 'equals' && m.display === '*'}
			class:outer={depth === 0}
		>
			{#if 'children' in m}
				<svelte:self mapping={m.children} parentOperator={m.operator} depth={depth + 1} />
			{:else if m.operator === 'existence' || m.operator === 'notExistence'}
				{@const symbol = getRelationSymbol(m.operator)}
				<span class="pill-relation">{symbol}</span>
				<div class="pill-label inline-block text-2-regular first-letter:uppercase">{m.label}</div>
			{:else if 'label' in m && 'display' in m}
				{@const symbol = getRelationSymbol(m.operator)}
				<div class="pill-label inline-block text-2-regular first-letter:uppercase">{m.label}</div>
				<span class="pill-relation">{symbol}</span>
				<span class="pill-value">
					<DecoratedData data={m.display} showLabels={ShowLabelsOptions['Never']} />
				</span>
			{/if}
			{#if 'up' in m && (!m.children || depth > 0)}
				<span class="pill-remove inline-block align-sub">
					<a class="float-right pl-2 text-[inherit] hover:text-[inherit]" href={m.up?.['@id']}>
						<BiXLg class="" fill="currentColor" fill-opacity="0.8" />
					</a>
				</span>
			{/if}
		</li>
		{#if parentOperator}
			<li class="pill-between pill-between-{parentOperator}">{parentOperator}</li>
		{/if}
		{#if 'up' in m && m.children && depth === 0}
			<li class="pill-remove">
				<a class="ghost-btn" href={m.up?.['@id']}>
					<BiTrash class="text-icon" />
					<span>Rensa</span>
				</a>
			</li>
		{/if}
	{/each}
	{#if showEditButton && depth === 0}
		<li>
			<a
				class="ghost-btn"
				data-sveltekit-replacestate
				class:active={editActive}
				href={toggleEditUrl}
			>
				<BiPencil class="text-icon" />
				<span>Redigera</span>
			</a>
		</li>
	{/if}
</ul>

<style lang="postcss">
	.mapping-item {
		@apply rounded-md px-4 py-2 brightness-100 text-3-cond-bold;
		transition: filter 0.1s ease;
	}

	.mapping-item:has(> .pill-remove:hover) {
		@apply brightness-[.85];
	}

	.pill {
		@apply bg-positive-inv text-primary-inv;

		& .pill-label,
		.pill-relation {
			@apply text-secondary-inv;
		}
	}

	.pill-notEquals,
	.pill-notExistence {
		@apply bg-negative text-primary;

		& .pill-label,
		.pill-relation {
			@apply text-secondary;
		}
	}

	.pill-equals.wildcard {
		@apply hidden;
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

	/* TODO - move to button component/ghost */
	.ghost-btn {
		@apply flex items-center gap-2 rounded-md bg-main px-4 py-2 text-secondary no-underline outline outline-2 -outline-offset-2 outline-[#52331429] brightness-100 text-3-cond-bold;
		transition: filter 0.1s ease;

		&:hover,
		&.active {
			@apply brightness-95;
		}
	}
</style>
