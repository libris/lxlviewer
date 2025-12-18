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
	{#if items.length > 1}
		<div class="mb-4 flex space-x-2 align-middle noscript:hidden">
			<button class="btn btn-primary mx-2" onclick={prev}>
				<IconChevronLeft class="size-3" />
			</button>
			{#each { length: items.length }, i}
				<button
					aria-label={`element ${i}`}
					class="mx-2 my-2 h-3 w-3 cursor-pointer rounded-full"
					class:dot-selected={i === index}
					class:dot-unselected={i !== index}
					onclick={() => {
						index = i;
					}}
				>
					<span></span>
				</button>
			{/each}
			<button class="btn btn-primary mx-2" onclick={next}>
				<IconChevronRight class="size-3" />
			</button>
		</div>
	{/if}
	<div class="@container relative flex w-full items-center justify-center overflow-hidden">
		<div class="flex justify-center">
			{#key index}
				{@render render(items[index])}
			{/key}
		</div>
	</div>
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
