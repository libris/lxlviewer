<script lang="ts">
	import { getRelationSymbol } from '$lib/utils/getRelationSymbol';
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
	class={['flex flex-col items-start text-xs', depth === 0 ? 'flex-col-reverse gap-2' : 'flex-col']}
>
	{#each mapping as m, i (`outer-${i}-${depth}`)}
		{@const { children, operator, up, variable, displayStr, label } = m}
		{#if displayStr}
			<li
				class={[
					'pill bg-neutral flex h-8 items-center rounded-sm',
					variable && `variable-${variable}`
				]}
			>
				{#if label}
					<span class="lxl-qualifier-key">{label}</span>
				{/if}
				{#if operator && operator !== 'none'}
					<span class="lxl-qualifier-operator">{getRelationSymbol(m.operator)}</span>
				{/if}
				<span class={[operator === 'none' ? 'lxl-filter-alias' : 'lxl-qualifier-value']}
					>{displayStr}</span
				>
				{#if up}
					<a
						class="lxl-qualifier-remove h-8 transition-colors"
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

	.operator-and {
		display: none;
	}

	.variable-_q .pill,
	.variable-_q.pill {
		background-color: var(--color-accent-100);
	}

	.variable-_r .pill,
	.variable-_r.pill {
		background-color: var(--color-primary-200);
		border: 1px solid var(--color-primary-300);
	}

	.group-inner::after {
		content: ')';
	}

	.group-inner::before {
		content: '(';
	}

	/* .pill-equals.wildcard {
		display: none;
	} */
</style>
