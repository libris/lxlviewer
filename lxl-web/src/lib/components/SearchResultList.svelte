<script lang="ts">
	import SearchResultItem from '$lib/components/SearchResultItem.svelte';
	import type { SearchResultItem as SearchResultItemType } from '$lib/types/search';
	import { onMount } from 'svelte';
	import IconChevronLeft from '~icons/bi/chevron-left';
	import IconChevronRight from '~icons/bi/chevron-right';

	type Props = { items: SearchResultItemType[]; type: 'horizontal' };

	const SCROLL_AMOUNT = 0.85;
	let { items, type }: Props = $props();
	let ulElement: HTMLUListElement | undefined;
	let clientWidth: number | undefined = $state();
	let disabledLeftScrollButton = $state(true);
	let disabledRightScrollButton = $state(false);

	function getPreferredScrollBehaviour() {
		return window.matchMedia(`(prefers-reduced-motion: reduce)`).matches ? 'instant' : 'smooth';
	}
	function scrollLeft() {
		ulElement?.scrollBy({
			left: ulElement.clientWidth * -SCROLL_AMOUNT,
			behavior: getPreferredScrollBehaviour()
		});
	}

	function scrollRight() {
		ulElement?.scrollBy({
			left: ulElement.clientWidth * SCROLL_AMOUNT,
			behavior: getPreferredScrollBehaviour()
		});
	}

	function updateDisabledScrollButtons() {
		if (ulElement) {
			if (ulElement.scrollLeft <= 0) {
				disabledLeftScrollButton = true;
			} else {
				disabledLeftScrollButton = false;
			}
			if (ulElement.scrollLeft >= ulElement.scrollWidth - ulElement.clientWidth) {
				disabledRightScrollButton = true;
			} else {
				disabledRightScrollButton = false;
			}
		}
	}

	onMount(() => updateDisabledScrollButtons());
</script>

{#snippet horizontalList()}
	<div class="horizontal-list relative">
		<ul
			class="scrollbar-hidden @container flex gap-3 overflow-x-auto overscroll-x-contain px-3 sm:px-6 @3xl:px-0"
			bind:this={ulElement}
			bind:clientWidth
			onscroll={updateDisabledScrollButtons}
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
		<button
			class="scroll-button btn btn-icon absolute top-[calc(50%-22px)] left-2 hidden shadow-lg disabled:opacity-50 disabled:shadow-none noscript:hidden"
			onclick={scrollLeft}
			disabled={disabledLeftScrollButton}
		>
			<IconChevronLeft class="size-5" />
		</button>
		<button
			class="scroll-button btn btn-icon absolute top-[calc(50%-22px)] right-2 hidden shadow-lg disabled:opacity-50 disabled:shadow-none noscript:hidden"
			onclick={scrollRight}
			disabled={disabledRightScrollButton}
		>
			<IconChevronRight class="size-5" />
		</button>
	</div>
{/snippet}

{#if type === 'horizontal'}
	{@render horizontalList()}
{/if}

<style lang="postcss">
	.horizontal-list {
		@media (any-pointer: fine) and (scripting: enabled) {
			&:hover,
			&:focus-within {
				.scroll-button {
					display: flex;
				}
			}
		}
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
