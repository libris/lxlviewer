<script lang="ts">
	import SearchResultItem from '$lib/components/SearchResultItem.svelte';
	import type { SearchResultItem as SearchResultItemType } from '$lib/types/search';

	type Props = { items: SearchResultItemType[]; type: 'horizontal' };

	let { items, type }: Props = $props();
</script>

{#snippet horizontalList()}
	<ul
		class="horizontal-list scrollbar-hidden @container flex gap-3 overflow-x-auto overscroll-x-contain px-3 sm:px-6 @3xl:px-0"
	>
		{#each items as item (item['@id'])}
			<!-- TODO: Rework width attributes for more exact values -->
			<li
				class="min-w-[33%] flex-0 overflow-x-hidden text-center text-xs @lg:min-w-[26%] @3xl:min-w-[21%] @5xl:min-w-[17%]"
			>
				<SearchResultItem data={item} />
			</li>
		{/each}
	</ul>
{/snippet}

{#if type === 'horizontal'}
	{@render horizontalList()}
{/if}

<style lang="postcss">
	.horizontal-list {
		& :global(.decorated-card-header-top) {
			margin-top: calc(var(--spacing) * 2);
		}
		& :global(.decorated-card-heading) {
			font-size: var(--text-sm);
			@apply line-clamp-3;
		}
		& :global(.decorated-card-body) {
			margin-block: calc(var(--spacing) * 1);
		}
		& :global(.decorated-card-body [data-property='contribution'] > *) {
			@apply truncate;
		}
		& :global(.agent-lifespan),
		& :global(.contribution-role) {
			display: none;
		}
	}
</style>
