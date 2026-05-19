<script lang="ts">
	import { page } from '$app/state';
	import { getSearchContext } from '$lib/contexts/search';
	import IconSearch from '~icons/bi/search';
	import IconClear from '~icons/bi/x-circle';

	interface Props {
		placeholder: string;
		ariaLabelledBy?: string;
		ariaLabel?: string;
		autofocus?: boolean;
	}

	let { placeholder, ariaLabel, ariaLabelledBy, autofocus }: Props = $props();

	const searchContext = getSearchContext();
	let fallbackInputElement: HTMLInputElement | undefined = $state();

	let value = $derived(page.url.searchParams.get('_q'));

	$effect(() => {
		if (page.url.hash === `#search`) {
			fallbackInputElement?.focus();
		}
	});

	function getSelectionOnTeardown(): { anchor: number | null; head: number | null } | undefined {
		if (fallbackInputElement?.selectionStart || fallbackInputElement?.selectionEnd) {
			if (fallbackInputElement.selectionDirection === 'backward') {
				return {
					anchor: fallbackInputElement?.selectionEnd,
					head: fallbackInputElement?.selectionStart
				};
			}
			return {
				anchor: fallbackInputElement?.selectionStart,
				head: fallbackInputElement?.selectionEnd
			};
		}
	}

	$effect(() => {
		return () => {
			// Use teardown function to save state before mounting SuperSearchWrapper.svelte (so selection and value is kept...)
			if (fallbackInputElement) {
				searchContext.initialStateBeforeMount = {
					value: fallbackInputElement.value,
					selection: getSelectionOnTeardown()
				};
			}
		};
	});
</script>

<div class="fallback-search relative">
	<span class="text-subtle absolute flex h-full w-11 items-center justify-center sm:hidden">
		<IconSearch class="size-4 lg:mt-px" aria-hidden="true" />
	</span>
	<input
		id="search-fallback"
		type="search"
		name="_q"
		{placeholder}
		{value}
		aria-labelledby={ariaLabelledBy}
		aria-label={ariaLabel}
		{autofocus}
		bind:this={fallbackInputElement}
		class="placeholder:text-placeholder 3xl:placeholder:text-base w-full pl-12 text-base focus:outline-none sm:pl-3 lg:text-[0.9375rem] 2xl:text-base sm:@3xl:pl-4"
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
		class={['action hidden rounded-r-md border-l border-l-neutral-300 sm:flex 2xl:rounded-r-lg']}
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

		@variant lg {
			font-size: 0.9375rem;
		}

		@variant 2xl {
			font-size: var(--text-base);
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
