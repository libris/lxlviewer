<script lang="ts">
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
	}

	let {
		id,
		value = $bindable(''),
		selection = $bindable(),
		placeholder,
		ariaLabel,
		ariaLabelledBy,
		autofocus
	}: Props = $props();

	let fallbackInputElement: HTMLInputElement | undefined = $state();

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
		return () => {
			// Use teardown function to save state before mounting SuperSearchWrapper.svelte (so selection and value is kept...)
			if (fallbackInputElement) {
				selection = getSelectionOnTeardown();
			}
		};
	});
</script>

<div class="fallback-search relative">
	<span class="text-subtle absolute flex h-full w-11 items-center justify-center sm:hidden">
		<IconSearch class="size-4 lg:mt-px" aria-hidden="true" />
	</span>
	<input
		id={`${id}-fallback`}
		type="search"
		name="_q"
		{placeholder}
		bind:value
		aria-labelledby={ariaLabelledBy}
		aria-label={ariaLabel}
		{autofocus}
		bind:this={fallbackInputElement}
		class="placeholder:text-placeholder w-full pl-11 text-base focus:outline-none sm:pl-3 lg:text-[0.9375rem] sm:@3xl:pl-4"
	/>
	<button
		type="reset"
		aria-label={page.data.t('search.clear')}
		title={page.data.t('search.clear')}
		class="action text-subtle hidden h-full w-full max-w-11 items-center justify-center -outline-offset-2 lg:max-w-12"
	>
		<IconClear aria-hidden="true" class="size-4.5 sm:size-4" />
	</button>

	<button
		type="submit"
		class={[
			'hover:bg-primary-50 hidden h-full w-full max-w-11 items-center justify-center rounded-r-md border-l border-l-neutral-300 sm:flex lg:max-w-12'
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
		font-size: var(--text-xs);
		@variant sm {
			font-size: var(--text-sm);
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
		&:hover {
			background: var(--color-accent-50);
		}

		&:focus {
			background: var(--color-accent-100);
		}
	}
</style>
