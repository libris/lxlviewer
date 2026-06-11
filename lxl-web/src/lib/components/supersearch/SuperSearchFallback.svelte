<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/state';
	import IconSearch from '~icons/bi/search';
	import IconClear from '~icons/bi/x-circle';

	interface Props {
		id: string;
		value: string;
		selection?: { anchor: number; head: number } | undefined;
		placeholder: string;
		ariaLabelledBy?: string;
		ariaLabel?: string;
		autofocus?: boolean;
		ondestroy?: () => void;
	}

	let {
		id,
		value = $bindable(''),
		selection = $bindable(),
		placeholder,
		ariaLabel,
		ariaLabelledBy,
		autofocus,
		ondestroy
	}: Props = $props();

	let fallbackInputElement: HTMLInputElement | undefined = $state();
	let activeElement: Element | null = $state(null);

	$effect(() => {
		if (page.url.hash === `#search`) {
			fallbackInputElement?.focus();
		}
	});

	function getSelectionOnTeardown(): { anchor: number; head: number } | undefined {
		if (typeof fallbackInputElement?.selectionStart === 'number') {
			if (fallbackInputElement.selectionDirection === 'backward') {
				return {
					anchor: fallbackInputElement?.selectionEnd || fallbackInputElement.selectionStart,
					head: fallbackInputElement.selectionStart
				};
			}
			return {
				anchor: fallbackInputElement.selectionStart,
				head: fallbackInputElement?.selectionEnd || fallbackInputElement.selectionStart
			};
		}
	}

	$effect(() => {
		activeElement = document.activeElement;

		return () => {
			// Use teardown function to save state before mounting SuperSearchWrapper.svelte (so selection and value is kept...)
			if (fallbackInputElement && activeElement === fallbackInputElement) {
				selection = getSelectionOnTeardown();
			}
		};
	});

	onDestroy(() => ondestroy?.());
</script>

<div class="fallback-search relative">
	<input
		id={`${id}-search-fallback`}
		type="search"
		name="_q"
		{placeholder}
		bind:value
		aria-labelledby={ariaLabelledBy}
		aria-label={ariaLabel}
		{autofocus}
		bind:this={fallbackInputElement}
		class="placeholder:text-placeholder w-full pl-3 text-base focus:outline-none lg:pl-4 2xl:pl-4"
	/>
	<button
		type="reset"
		aria-label={page.data.t('search.clear')}
		title={page.data.t('search.clear')}
		class="action text-subtle hidden"
	>
		<IconClear aria-hidden="true" class="size-4.5 sm:size-4" />
	</button>

	<button
		type="submit"
		class={[
			'action text-subtle hidden rounded-r-md border-l border-l-neutral-300 sm:flex 2xl:rounded-r-lg'
		]}
		aria-label={page.data.t('supersearch.search')}
	>
		<IconSearch aria-hidden="true" class={['flex size-4.5']} />
	</button>
</div>

<style lang="postcss">
	@reference 'tailwindcss';

	.fallback-search {
		display: flex;
		width: 100%;
		height: var(--search-input-height);
		background: var(--color-input);
		box-shadow: 0 0 0 1px var(--color-primary-400);
		border-radius: var(--radius-md);

		@variant sm {
			border-radius: var(--radius-lg);
		}

		&:not(:has([type='submit']:focus)) {
			&:has(:focus) {
				box-shadow: 0 0 0 2px var(--color-accent-500);
				outline: 4px solid var(--color-accent-100);
				outline-offset: 2px;
			}
		}
	}

	input:not(:placeholder-shown) + [type='reset'] {
		display: flex;
	}

	.action {
		height: var(--search-input-height);
		@apply aspect-square items-center justify-center -outline-offset-2;

		&:hover {
			background: var(--color-accent-50);
		}

		&:focus {
			background: var(--color-accent-100);
		}
	}
</style>
