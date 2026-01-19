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
	<div class="horizontal-list relative">
		<ul
			aria-labelledby={ariaLabelledBy}
			class="scrollbar-hidden flex overflow-x-auto overscroll-x-contain"
			bind:this={ulElement}
			bind:clientWidth
			onscroll={updateDisabledScrollButtons}
		>
			{#each items as item (item['@id'])}
				<li class="overflow-x-hidden text-center">
					<SearchResultItem data={item} />
				</li>
			{/each}
		</ul>
		<button
			class="scroll-button left btn btn-scroll absolute left-0 z-10 ml-2 opacity-0 transition-all noscript:hidden
			"
			onclick={scrollLeft}
			disabled={disabledLeftScrollButton}
			aria-hidden="true"
			tabindex="-1"
		>
			<IconChevronLeft class="-ml-px size-5 @5xl:size-6 " />
		</button>
		<button
			class="scroll-button right btn btn-scroll absolute right-0 z-10 mr-2 opacity-0 transition-all noscript:hidden"
			onclick={scrollRight}
			disabled={disabledRightScrollButton}
			aria-hidden="true"
			tabindex="-1"
		>
			<IconChevronRight class="ml-px size-5 @5xl:size-6" />
		</button>
	</div>
{/snippet}

{#if type === 'horizontal'}
	{@render horizontalList()}
{/if}

<style lang="postcss">
	@reference "tailwindcss";

	.horizontal-list {
		@media (any-pointer: fine) and (scripting: enabled) {
			&:hover,
			&:focus-within {
				.scroll-button {
					opacity: 100%;
				}
			}
		}
		& :global(.agent-lifespan),
		& :global(.contribution-role) {
			display: none;
		}
	}

	.scroll-button {
		top: calc(50% - var(--spacing) * 11);
	}
</style>
