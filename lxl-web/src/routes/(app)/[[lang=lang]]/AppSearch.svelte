<script lang="ts">
	import { type SvelteComponent } from 'svelte';
	import { page } from '$app/state';
	import addDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
	import getSortedSearchParams from '$lib/utils/getSortedSearchParams';
	import IconSearch from '~icons/bi/search';

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

	export function showExpandedSearch() {
		superSearchWrapperComponent?.showExpandedSearch();
	}
</script>

{#snippet fallbackInput()}
	<div class="relative">
		<span class="text-subtle absolute flex h-full w-11 items-center justify-center">
			<IconSearch class="size-3.5 lg:size-4" aria-hidden="true" />
		</span>
		<input type="search" {id} {name} {placeholder} bind:this={fallbackInputElement} />
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
{#each Array.from(pageParams) as [name, value] (name)}
	{#if name !== '_q'}
		<input type="hidden" {name} {value} />
	{/if}
{/each}

<style lang="postcss">
	@reference 'tailwindcss';

	input[type='search'] {
		display: flex;
		width: 100%;
		height: var(--search-input-height);
		background: var(--color-input);
		box-shadow: 0 0 0 1px var(--color-primary-200);
		border-radius: var(--radius-md);
		font-size: var(--text-xs);
		padding-left: 44px;

		&:hover,
		&:focus {
			box-shadow: 0 0 0 1px var(--color-primary-500);
		}

		&:focus {
			outline: 4px solid var(--color-primary-200);
			outline-offset: 1px;
		}
	}
</style>
