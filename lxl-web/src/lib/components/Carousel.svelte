<script lang="ts">
	import type { Snippet } from 'svelte';
	// FIXME this is just a really basic implementation

	import IconChevronLeft from '~icons/bi/chevron-left';
	import IconChevronRight from '~icons/bi/chevron-right';

	interface Props {
		items: never[];
		render: Snippet<[never]>;
	}

	let { items, render }: Props = $props();

	let index = $derived(items.length & 0);

	function prev() {
		index = (index - 1 + items.length) % items.length;
	}

	function next() {
		index = (index + 1) % items.length;
	}
</script>

<div class="carousel flex w-full flex-col items-center">
	<div class="relative flex w-full items-center justify-center overflow-hidden">
		{#if items.length > 1}
			<button
				class="scroll-button btn btn-icon absolute top-[calc(33cqw-44px)] left-1 hidden shadow-lg disabled:opacity-50 disabled:shadow-none @lg:top-[calc(26cqw-44px)] @3xl:top-[calc(21cqw-44px)] @5xl:top-[calc(17cqw-44px)] noscript:hidden"
				onclick={prev}
			>
				<IconChevronLeft class="size-5" />
			</button>
		{/if}

		<div class="flex w-full justify-center">
			{#key index}
				{@render render(items[index])}
			{/key}
		</div>

		{#if items.length > 1}
			<button
				class="scroll-button btn btn-icon absolute top-[calc(25cqw-44px)] right-1 hidden shadow-lg disabled:opacity-50 disabled:shadow-none @lg:top-[calc(26cqw-44px)] @3xl:top-[calc(21cqw-44px)] @5xl:top-[calc(17cqw-44px)] noscript:hidden"
				onclick={next}
			>
				<IconChevronRight class="size-5" />
			</button>
		{/if}
	</div>

	{#if items.length > 1}
		<div class="mt-4 flex space-x-2">
			{#each { length: items.length }, i}
				<button
					aria-label={`element ${i}`}
					class="h-2 w-2 cursor-pointer rounded-full"
					class:dot-selected={i === index}
					class:dot-unselected={i !== index}
					onclick={() => {
						index = i;
					}}
				></button>
			{/each}
		</div>
	{/if}
</div>

<style lang="postcss">
	.carousel {
		@media (any-pointer: fine) and (scripting: enabled) {
			&:hover,
			&:focus-within {
				.scroll-button {
					display: flex;
				}
			}
		}
	}
	.dot-unselected {
		background-color: var(--color-neutral-300);
	}
	.dot-selected {
		background-color: var(--color-neutral-500);
	}
</style>
