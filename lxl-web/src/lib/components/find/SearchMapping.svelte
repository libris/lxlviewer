<script lang="ts">
	import type { DisplayMapping, SearchOperators } from '$lib/types/search';

	import { page } from '$app/stores';
	import { getModalContext } from '$lib/contexts/modal';
	import BiXLg from '~icons/bi/x-lg';
	import BiPencil from '~icons/bi/pencil';
	import BiPencilFill from '~icons/bi/pencil-fill';
	import BiTrash from '~icons/bi/trash';

	export let mapping: DisplayMapping[];
	export let parentOperator: keyof typeof SearchOperators | undefined = undefined;
	export let depth = 0;

	const inModal = getModalContext();

	$: showEditButton =
		$page.url.pathname === `${$page.data.base}find` &&
		$page.url.searchParams.get('_q') !== $page.url.searchParams.get('_i');
	$: editActive = $page.url.searchParams.has('_x');
	$: toggleEditUrl = editActive
		? $page.url.href.replace(`&_x=${$page.url.searchParams.get('_x')}`, '')
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
	{#each mapping as m, index (`${m['@id']}-${index}`)}
		<li
			class="mapping-item {m.children ? 'pill-group' : 'pill'} pill-{m.operator}"
			class:wildcard={m.operator === 'equals' && m.display === '*'}
			class:outer={depth === 0}
			class:free-text={m?.['@id'] === 'https://id.kb.se/vocab/textQuery'}
		>
			{#if 'children' in m}
				<svelte:self mapping={m.children} parentOperator={m.operator} depth={depth + 1} />
			{:else if m.operator === 'existence' || m.operator === 'notExistence'}
				{@const symbol = getRelationSymbol(m.operator)}
				<span class="pill-relation">{symbol}</span>
				<div class="pill-label text-2-regular inline">{m.label}</div>
			{:else if 'label' in m && 'display' in m}
				{@const symbol = getRelationSymbol(m.operator)}
				<div class="pill-label text-2-regular inline">{m.label}</div>
				<span class="pill-relation">{symbol}</span>
				<span class="pill-value">
					{m.displayStr}
				</span>
			{/if}
			{#if 'up' in m && (!m.children || depth > 0)}
				<span class="pill-remove inline-block align-sub">
					<a
						class="float-right pl-2 text-[inherit] hover:text-[inherit]"
						href={m.up?.['@id']}
						aria-label={$page.data.t('search.removeFilter')}
					>
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
				<a class="button-ghost button-negative" href={m.up?.['@id']}>
					<BiTrash aria-hidden="true" />
					{$page.data.t('search.clearFilters')}
				</a>
			</li>
		{/if}
	{/each}
	{#if !inModal && showEditButton && depth === 0}
		<li>
			<a
				class="button-ghost"
				class:active={editActive}
				data-sveltekit-replacestate
				href={toggleEditUrl}
			>
				{#if editActive}
					<BiPencilFill aria-hidden="true" />
				{:else}
					<BiPencil aria-hidden="true" />
				{/if}
				{$page.data.t('search.editFilters')}
			</a>
		</li>
	{/if}
</ul>

<style lang="postcss">
	@reference "../../../app.css";

	.mapping-item {
		@apply text-3-cond-bold rounded-md px-4 py-2 brightness-100;
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

	.pill-equals {
		:global(.text-secondary) {
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
		@apply bg-primary/8 flex items-center gap-2 p-0 pr-4;

		&.outer {
			@apply bg-transparent;
		}
	}

	.pill-between,
	.pill-relation {
		@apply text-primary text-2-regular uppercase;
	}

	.pill-between-and,
	.pill-between:last-of-type {
		@apply hidden;
	}

	.free-text {
		& > .pill-label {
			display: none;
		}

		& > .pill-value::before,
		& > .pill-value::after {
			content: '"';
		}
	}
</style>
