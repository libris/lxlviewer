<script lang="ts">
	import SearchResultItem from '$lib/components/SearchResultItem.svelte';
	import type { SearchResultItem as SearchResultItemType } from '$lib/types/search';
	import { onMount } from 'svelte';
	import IconChevronLeft from '~icons/bi/chevron-left';
	import IconChevronRight from '~icons/bi/chevron-right';

	type Props = { items: SearchResultItemType[]; type: 'horizontal'; ariaLabelledBy?: string };

	const SCROLL_AMOUNT = 0.85;
	let { items, type, ariaLabelledBy }: Props = $props();
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
	<div class="horizontal-list @container relative">
		<ul
			aria-labelledby={ariaLabelledBy}
			class="scrollbar-hidden flex overflow-x-auto overscroll-x-contain"
			bind:this={ulElement}
			bind:clientWidth
			onscroll={updateDisabledScrollButtons}
		>
			{#each items as item (item['@id'])}
				<li class="min-w-5xs gap-3 overflow-x-hidden text-center text-xs">
					<SearchResultItem data={item} />
				</li>
			{/each}
		</ul>
		<button
			class="scroll-button btn btn-icon absolute left-1 hidden shadow-lg disabled:opacity-50 disabled:shadow-none noscript:hidden"
			onclick={scrollLeft}
			disabled={disabledLeftScrollButton}
		>
			<IconChevronLeft class="size-5" />
		</button>
		<button
			class="scroll-button btn btn-icon absolute top-[calc(33cqw-44px)] right-1 hidden shadow-lg disabled:opacity-50 disabled:shadow-none @lg:top-[calc(26cqw-44px)] @3xl:top-[calc(21cqw-44px)] @5xl:top-[calc(17cqw-44px)] noscript:hidden"
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
		& :global(.agent-lifespan),
		& :global(.contribution-role) {
			display: none;
		}
	}
</style>
