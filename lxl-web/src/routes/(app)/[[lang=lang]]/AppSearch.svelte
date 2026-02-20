<script lang="ts">
	import { type SvelteComponent } from 'svelte';
	import { page } from '$app/state';
	import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
	import getSortedSearchParams from '$lib/utils/getSortedSearchParams';
	import IconSearch from '~icons/bi/search';
	import type { ShowExpandedSearchOptions } from 'supersearch';

	type Props = {
		id?: string;
		name: string;
		placeholder: string;
		ariaLabelledBy?: string;
		ariaLabel?: string;
		ariaDescribedBy?: string;
	};

	let { id, name, placeholder, ariaLabelledBy, ariaLabel, ariaDescribedBy }: Props = $props();

	let fallbackInputElement: HTMLInputElement | undefined = $state();
	let superSearchWrapperComponent: SvelteComponent | undefined = $state();

	const pageParams = $derived.by(() => {
		let p = getSortedSearchParams(addDefaultSearchParams(page.url.searchParams));
		// Always reset these params on new search
		p.set('_offset', '0');
		p.delete('_i');
		p.delete('_o');
		p.delete('_p');
		return p;
	});

	$effect(() => {
		if (page.url.hash === `#${id}`) {
			fallbackInputElement?.focus();
		}
	});

	export function showExpandedSearch(options?: ShowExpandedSearchOptions) {
		superSearchWrapperComponent?.showExpandedSearch(options);
	}
</script>

{#snippet fallbackInput()}
	<div class="fallback-search relative">
		<span class="text-subtle absolute flex h-full w-11 items-center justify-center sm:hidden">
			<IconSearch class="size-4 lg:mt-px" aria-hidden="true" />
		</span>
		<input
			type="search"
			{id}
			{name}
			{placeholder}
			aria-labelledby={ariaLabelledBy}
			aria-label={ariaLabel}
			aria-describedby={ariaDescribedBy}
			bind:this={fallbackInputElement}
			class="placeholder:text-placeholder w-full pl-11 focus:outline-none sm:px-3 sm:@3xl:pl-4 @5xl:text-[0.9375rem]"
		/>
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
{/snippet}

{#await import('$lib/components/supersearch/SuperSearchWrapper.svelte')}
	{@render fallbackInput()}
{:then { default: SuperSearchWrapper }}
	<div class="contents" data-testid="supersearch">
		<SuperSearchWrapper
			{placeholder}
			{ariaLabelledBy}
			{ariaLabel}
			{ariaDescribedBy}
			bind:this={superSearchWrapperComponent}
		/>
	</div>
{:catch}
	{@render fallbackInput()}
{/await}
{#each Array.from(pageParams) as [name, value], i (name + i)}
	{#if name !== '_q'}
		<input type="hidden" {name} {value} />
	{/if}
{/each}

<style lang="postcss">
	@reference 'tailwindcss';
	@reference "../../../app.css";

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
</style>
