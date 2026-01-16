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
	};

	let { id, name, placeholder }: Props = $props();

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
			<IconSearch class="size-4 lg:mt-[1px]" aria-hidden="true" />
		</span>
		<input type="search" {id} {name} {placeholder} bind:this={fallbackInputElement} />
		<button
			type="submit"
			class={[
				'hover:bg-primary-50 hidden size-11 items-center justify-center border-l border-l-neutral-300 sm:flex lg:size-12'
			]}
			aria-label={page.data.t('supersearch.search')}
		>
			<IconSearch aria-hidden="true" class={['flex size-4.5 ']} />
		</button>
	</div>
{/snippet}

{#await import('$lib/components/supersearch/SuperSearchWrapper.svelte')}
	{@render fallbackInput()}
{:then { default: SuperSearchWrapper }}
	<div class="contents" data-testid="supersearch">
		<SuperSearchWrapper {placeholder} bind:this={superSearchWrapperComponent} />
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

	.fallback-search {
		display: flex;
		width: 100%;
		height: var(--search-input-height);
		background: var(--color-input);
		box-shadow: 0 0 0 1px var(--color-primary-400);
		border-radius: var(--radius-md);
		font-size: var(--text-xs);

		&:hover,
		&:has(:focus) {
			box-shadow: 0 0 0 1px var(--color-primary-500);
		}

		&:has(:focus) {
			outline: 4px solid var(--color-primary-500);
			outline-offset: 1px;
		}

		& input[type='search'] {
			width: 100%;
			padding-left: calc(var(--spacing) * 11);

			@variant sm {
				padding-left: calc(var(--spacing) * 3);
			}

			@variant 2xl {
				font-size: var(--text-sm);
				padding-left: calc(var(--spacing) * 4);
			}

			&:focus {
				outline: none;
			}
			&::placeholder {
				color: var(--color-placeholder);
			}
		}
	}
</style>
