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
			default:
				return '';
		}
	}
</script>

<ul class="search-mapping flex items-center gap-2 overflow-x-auto whitespace-nowrap">
	{#each mapping as m}
		<li
			class="mapping-item min-h-9 {m.children ? 'pill-group' : 'pill'} pill-{m.operator}"
			class:wildcard={m.display === '*'}
			class:outer={depth === 0}
		>
			{#if 'children' in m}
				<svelte:self mapping={m.children} parentOperator={m.operator} depth={depth + 1} />
			{:else if 'label' in m && 'display' in m}
				{@const symbol = getRelationSymbol(m.operator)}
				<span class="pill-label text-2-regular first-letter:uppercase">{m.label}</span>
				<span class="pill-relation">{symbol}</span>
				<span class="pill-value">
					<DecoratedData data={m.display} showLabels={ShowLabelsOptions['Never']} />
				</span>
			{/if}
			{#if 'up' in m && (!m.children || depth > 0)}
				<a
					class="pill-remove flex h-9 w-9 items-center justify-center text-[inherit] hover:text-[inherit]"
					href={m.up?.['@id']}
				>
					<BiXLg class="" fill="currentColor" fill-opacity="0.8" />
				</a>
			{/if}
		</li>
		{#if parentOperator}
			<li class="pill-between pill-between-{parentOperator}">{parentOperator}</li>
		{/if}
		{#if 'up' in m && m.children && depth === 0}
			<li class="pill-remove">
				<a class="ghost-btn" href={m.up?.['@id']}>
					<BiTrash class="text-icon-default" />
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
				<BiPencil class="text-icon-default" />
				<span>Redigera</span>
			</a>
		</li>
	{/if}
</ul>

<style lang="postcss">
	.search-mapping {
		& {
			::-webkit-scrollbar {
				display: none;
			}
		}
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.mapping-item {
		@apply inline-flex items-center gap-1 rounded-md pl-4 text-sm brightness-100 text-3-cond-bold;
		transition: filter 0.1s ease;
	}

	.mapping-item:has(> .pill-remove:hover) {
		@apply brightness-[.85];
	}

	.pill {
		@apply bg-positive-inv text-sm text-primary-inv;

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

	.pill-equals.wildcard {
		@apply hidden;
	}

	.pill-group {
		@apply flex items-center gap-2 bg-pill/8;

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
		@apply flex min-h-9 items-center gap-2 rounded-md bg-main px-2 text-secondary no-underline outline outline-2 -outline-offset-2 outline-[#52331429] brightness-100 text-3-cond-bold;
		transition: filter 0.1s ease;

		&:hover,
		&.active {
			@apply brightness-95;
		}
	}
</style>
