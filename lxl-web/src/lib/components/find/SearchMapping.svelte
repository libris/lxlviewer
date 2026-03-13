<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { JsonLd } from '$lib/types/xl';
	import type { DisplayMapping } from '$lib/types/search';
	import { MAPPING_IGNORE_VARIABLE } from '$lib/constants/mapping';
	import { getRelationSymbol } from '$lib/utils/getRelationSymbol';
	import SearchMapping from './SearchMapping.svelte';
	import QualifierPill from '../supersearch/QualifierPill.svelte';
	import IconClose from '~icons/bi/x-lg';
	import BiTrash from '~icons/bi/trash';

	interface Props {
		mapping: DisplayMapping[];
		depth?: number;
	}

	let { mapping, depth = 0 }: Props = $props();
</script>

<ul
	class={[
		'max-w-full leading-7.5',
		depth === 0 ? 'search-mapping flex-col-reverse gap-2' : 'flex-col',
		'flex items-start text-xs'
	]}
>
	{#each mapping as m, i (`outer-${i}-${depth}`)}
		{#if !MAPPING_IGNORE_VARIABLE.some((v) => v === m.variable)}
			{@const { children, operator, up, variable, displayStr, label, isRedundantKeyLabel } = m}
			{#if displayStr || label}
				<li class={['lxl-qualifier inline-block', variable && `variable-${variable}`]}>
					{#if m._key}
						<span class="atomic truncate">
							<QualifierPill
								key={m._key}
								keyLabel={label}
								operator={getRelationSymbol(m.operator)}
								value={m._value}
								valueLabel={displayStr || m._value}
								removeLink={up?.['@id']}
								type={m.display?.[JsonLd.TYPE]}
								id={m.display[JsonLd.ID]}
								{isRedundantKeyLabel}
							/>
						</span>
					{:else}
						<!-- free text search -->
						<span class="flex h-full items-center gap-1 pl-1.5">
							<span>{displayStr}</span>
							<a
								href={resolve(page.data.localizeHref(up?.['@id']))}
								class="lxl-qualifier-remove"
								aria-label={`${page.data.t('search.removeFilter')} ${displayStr}`}
							>
								<IconClose aria-hidden="true" />
							</a>
						</span>
					{/if}
				</li>
			{:else if children && variable !== 'defaultSiteFilters'}
				<li
					class={[
						'group flex max-w-full flex-wrap items-center gap-1.5',
						`group-${operator}`,
						`${operator === 'not' && 'lxl-not-term'}`,
						variable
							? `variable-${variable}`
							: `${children.length > 1 ? 'group-inner text-sm' : ''}`
					]}
				>
					{#each children as child, i (`${i}-${depth}`)}
						{@const _child = Array.isArray(child) ? child : [child]}
						{#if operator}
							<span class="operator-{operator} text-sm uppercase">{operator}</span>
						{/if}
						<SearchMapping depth={depth + 1} mapping={_child} />
					{/each}
					{#if up && variable}
						<a
							href={m.up?.['@id']}
							class="btn btn-ghost h-7 rounded-sm text-sm"
							aria-label={page.data.t('search.clearAllFilters')}
						>
							<BiTrash aria-hidden="true" />
							{page.data.t('search.clear')}
						</a>
					{/if}
				</li>
			{/if}
		{/if}
	{/each}
</ul>

<style lang="postcss">
	@reference 'tailwindcss';

	.operator-and {
		display: none;
	}

	.group-or .operator-or:first-of-type {
		display: none;
	}

	/* we can give _r pills a special styling if we want */
	.variable-_r .lxl-qualifier,
	.variable-_r.lxl-qualifier {
	}

	.group-inner::after {
		content: ')';
	}

	.group-inner::before {
		content: '(';
	}
</style>
