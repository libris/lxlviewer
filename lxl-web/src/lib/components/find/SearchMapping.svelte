<script lang="ts">
	import { getRelationSymbol } from '$lib/utils/getRelationSymbol';
	import { isWildcardQuery } from '$lib/utils/displayMappingToString';
	import SearchMapping from './SearchMapping.svelte';
	import type { DisplayMapping } from '$lib/types/search';
	import { page } from '$app/state';
	import BiXLg from '~icons/bi/x-lg';
	import BiTrash from '~icons/bi/trash';

	interface Props {
		mapping: DisplayMapping[];
		depth?: number;
	}

	let { mapping, depth = 0 }: Props = $props();
</script>

<ul
	class={[
		depth === 0 ? 'search-mapping flex-col-reverse gap-2' : 'flex-col',
		'flex items-start text-xs'
	]}
>
	{#each mapping as m, i (`outer-${i}-${depth}`)}
		{@const { children, operator, up, variable, displayStr, label, display } = m}
		{#if displayStr && !isWildcardQuery(m)}
			{@const isLinked = !!display?.['@id']}
			<li
				class={[
					'pill bg-neutral flex h-8 items-center rounded-sm',
					variable && `variable-${variable}`
				]}
			>
				{#if label}
					<span class="lxl-qualifier lxl-qualifier-key atomic h-full content-center">
						{label}
					</span>
				{/if}
				{#if operator && operator !== 'none'}
					<span class="lxl-qualifier lxl-qualifier-operator atomic h-full content-center pr-1.5"
						>{getRelationSymbol(m.operator)}</span
					>
				{/if}
				<span
					class={[
						'lxl-qualifier h-full content-center',
						operator === 'none' ? 'lxl-filter-alias atomic' : 'lxl-qualifier-value',
						isLinked && 'atomic'
					]}>{displayStr}</span
				>
				{#if up}
					<a
						class="lxl-qualifier lxl-qualifier-remove atomic h-8 transition-colors"
						href={page.data.localizeHref(m.up?.['@id'])}
						aria-label={page.data.t('search.removeFilter')}
					>
						<BiXLg fill="currentColor" />
					</a>
				{/if}
			</li>
		{:else if children}
			<li
				class={[
					'group flex flex-wrap items-center gap-1.5',
					variable ? `variable-${variable}` : 'group-inner'
				]}
			>
				{#each children as child, i (`${i}-${depth}`)}
					<SearchMapping depth={depth + 1} mapping={[child]} />
					{#if operator && i < children.length - 1}
						<span class="operator-{operator} text-2xs uppercase">{operator}</span>
					{/if}
				{/each}
				{#if up && variable}
					<a href={page.data.localizeHref(m.up?.['@id'])} class="btn btn-primary">
						<BiTrash aria-hidden="true" />
						{page.data.t('search.clearFilters')}
					</a>
				{/if}
			</li>
		{/if}
	{/each}
</ul>

<style lang="postcss">
	@reference 'tailwindcss';

	.search-mapping :global(.lxl-qualifier-value) {
		background-color: var(--color-accent-100);
	}

	.operator-and {
		display: none;
	}

	/* we can give _r pills a special styling if we want */
	.variable-_r .pill,
	.variable-_r.pill {
	}

	.group-inner::after {
		content: ')';
	}

	.group-inner::before {
		content: '(';
	}
</style>
