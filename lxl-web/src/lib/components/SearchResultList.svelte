<script lang="ts">
	import { page } from '$app/state';
	import SearchResultItem from '$lib/components/SearchResultItem.svelte';
	import type { SearchResultItem as SearchResultItemType } from '$lib/types/search';
	import { onMount, type Snippet } from 'svelte';
	import IconChevronLeft from '~icons/bi/chevron-left';
	import IconChevronRight from '~icons/bi/chevron-right';

	type Props = {
		items: SearchResultItemType[];
		type: 'horizontal';
		ariaLabelledBy?: string;
		ariaLive?: 'polite' | 'off' | 'assertive';
		ariaBusy?: boolean;
		withGradient?: boolean;
		placeholderItems?: number;
		placeholderSnippet?: Snippet;
		lazyImages?: boolean;
		fadeInImages?: boolean;
		listElement?: HTMLUListElement | undefined;
		suppressProperty?: string[];
	};

	let {
		items,
		type,
		ariaLabelledBy,
		ariaLive,
		ariaBusy,
		withGradient,
		placeholderItems = 0,
		placeholderSnippet,
		lazyImages = false,
		fadeInImages = false,
		listElement = $bindable(),
		suppressProperty = undefined
	}: Props = $props();

	const SCROLL_AMOUNT = 0.85;

	let disabledLeftScrollButton = $state(true);
	let disabledRightScrollButton = $state(false);
	let lazyImagesAfterIndex: number | undefined = $state();

	$effect(() => {
		if (lazyImages && type === 'horizontal' && !placeholderItems) {
			lazyImagesAfterIndex = getLazyImagesAfterIndex();
		}
	});

	function getLazyImagesAfterIndex() {
		const listWidth = listElement?.offsetWidth || 0;
		if (listWidth < 576) return 2; /* ... @xl = 48rem (768px) */
		if (listWidth < 768) return 3; /* ... @3xl = 48rem (768px) */
		if (listWidth < 1024) return 4; /* ... @5xl = 64rem (1024px) */
		if (listWidth < 1280) return 5; /* ... @7xl = 80rem (1280px) */
		if (listWidth < 1920) return 6; /* ... 120rem (1920px) */
		if (listWidth < 2240) return 7; /* ... 140rem (2240px) */
		if (listWidth < 2560) return 8; /* ... 160rem (2560px) */
		if (listWidth < 2880) return 9; /* ... 180rem (2880px) */
		return 10;
	}

	function getPreferredScrollBehaviour() {
		return window.matchMedia(`(prefers-reduced-motion: reduce)`).matches ? 'instant' : 'smooth';
	}

	function scrollLeft() {
		listElement?.scrollBy({
			left: listElement.clientWidth * -SCROLL_AMOUNT,
			behavior: getPreferredScrollBehaviour()
		});
	}

	function scrollRight() {
		listElement?.scrollBy({
			left: listElement.clientWidth * SCROLL_AMOUNT,
			behavior: getPreferredScrollBehaviour()
		});
	}

	function updateDisabledScrollButtons() {
		if (listElement) {
			if (listElement.scrollLeft <= 0) {
				disabledLeftScrollButton = true;
			} else {
				disabledLeftScrollButton = false;
			}
			if (listElement.scrollLeft >= listElement.scrollWidth - listElement.clientWidth) {
				disabledRightScrollButton = true;
			} else {
				disabledRightScrollButton = false;
			}
		}
	}

	onMount(() => updateDisabledScrollButtons());
</script>

{#snippet fallbackPlaceholderSnippet()}
	<div class="skeleton aspect-square"></div>
{/snippet}
{#snippet horizontalList()}
	<div class={['horizontal-list relative w-full', withGradient && 'with-gradient']}>
		<ul
			aria-labelledby={ariaLabelledBy}
			class="scrollbar-hidden flex overflow-x-auto overscroll-x-contain"
			bind:this={listElement}
			onscroll={updateDisabledScrollButtons}
			aria-live={ariaLive}
			aria-busy={ariaBusy}
		>
			{#each items as item, index (item['@id'])}
				<li class="@container overflow-x-hidden">
					<SearchResultItem
						data={item}
						lazyImage={typeof lazyImagesAfterIndex === 'number' && index > lazyImagesAfterIndex}
						fadeInImage={fadeInImages}
						highPriorityImage={typeof lazyImagesAfterIndex === 'number' &&
							index <= lazyImagesAfterIndex}
						{suppressProperty}
					/>
				</li>
			{/each}
			{#each { length: placeholderItems }}
				<li class="@container overflow-x-hidden text-center">
					{#if placeholderSnippet}
						{@render placeholderSnippet()}
					{:else}
						{@render fallbackPlaceholderSnippet()}
					{/if}
				</li>
			{/each}
		</ul>
		<button
			class="scroll-button left btn btn-scroll absolute left-0 z-30 ml-2 opacity-0 transition-all noscript:hidden
			"
			onclick={scrollLeft}
			disabled={disabledLeftScrollButton}
			aria-label={page.data.t('horizontalList.goBackward')}
			tabindex="-1"
		>
			<IconChevronLeft class="-ml-px size-5 @5xl:size-6 " />
		</button>
		<button
			class="scroll-button right btn btn-scroll absolute right-0 z-30 mr-2 opacity-0 transition-all noscript:hidden"
			onclick={scrollRight}
			disabled={disabledRightScrollButton}
			aria-label={page.data.t('horizontalList.goForward')}
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
		--card-scale: 1;
		@media (any-pointer: fine) and (scripting: enabled) {
			&:hover,
			&:focus-within {
				.scroll-button {
					opacity: 100%;
				}
			}

			& :global(.resource-link .resource-image) {
				overflow: hidden;

				& :global(> *) {
					@apply transition-all;
				}
			}

			& :global(.resource-link:hover .resource-image) {
				& :global(> *) {
					@apply scale-105;
				}
				& :global(img) {
					filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.175));
				}
			}
		}
		& :global(.person-extra),
		& :global(.contribution-role) {
			display: none;
		}

		& > ul {
			gap: calc(var(--spacing) * 3);

			@variant @sm {
				gap: calc(var(--spacing) * 6);
			}
			& > :global(li) {
				/* Remember to update getLazyImagesAfterIndex if these values are changed... */
				--cards: 2.5;
				--gap-count: 3;
				--edge-offset: 0px;

				min-width: max(
					9rem,
					calc(
						(100cqw - var(--spacing) * 6 * var(--gap-count) - var(--edge-offset)) /
							(var(--cards) / var(--card-scale))
					)
				);

				@variant @xl {
					--cards: 3.5;
					--gap-count: 4;
				}
				@variant @3xl {
					--cards: 4.5;
					--gap-count: 5;
				}
				@variant @5xl {
					--cards: 5.5;
					--gap-count: 5;
					--edge-offset: 80px;
				}
				@variant @7xl {
					--cards: 4.5;
					--gap-count: 4;
					--edge-offset: 80px;
				}

				@container (width >= 80rem) {
					--cards: 5.5;
					--gap-count: 5;
					--edge-offset: 80px;
				}
				@container (width >= 100rem) {
					--cards: 6.5;
					--gap-count: 6;
					--edge-offset: 80px;
				}
				@container (width >= 120rem) {
					--cards: 7.5;
					--gap-count: 7;
					--edge-offset: 80px;
				}
				@container (width >= 140rem) {
					--cards: 8.5;
					--gap-count: 8;
					--edge-offset: 80px;
				}
				@container (width >= 160rem) {
					--cards: 9.5;
					--gap-count: 9;
					--edge-offset: 80px;
				}
				@container (width >= 180rem) {
					--cards: 10;
					--gap-count: 9;
					--edge-offset: 160px;
				}
			}
		}
		&.with-gradient {
			@variant @5xl {
				&::before,
				&::after {
					content: '';
					top: 0;
					width: 5rem;
					height: 100%;
					position: absolute;
					@apply z-20;
				}

				&::before {
					left: 0;
					background: linear-gradient(to right, rgba(255, 255, 255, 0.875), rgba(255, 255, 255, 0));
				}

				&::after {
					right: 0;
					background: linear-gradient(to left, rgba(255, 255, 255, 0.875), rgba(255, 255, 255, 0));
				}
			}
		}
	}

	.scroll-button {
		top: calc(var(--spacing) * 22);
	}
</style>
