<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import getHiddenSearchParams from '$lib/utils/getHiddenSearchParams';
	import IconSearch from '~icons/bi/search';
	import IconClear from '~icons/bi/x-lg';
	import * as m from '$lib/paraglide/messages.js';

	/** Tests to do
	 * - [] input value is updated after navigating between different find routes (e.g. using back)
	 * - [] input value is clearable
	 */

	let mounted = $state(false);
	let q = $state($page.url.searchParams.get('_q')?.trim() || '');

	const hiddenSearchParams = getHiddenSearchParams($page.url.searchParams);

	onMount(() => {
		mounted = true;
	});

	afterNavigate(({ to }) => {
		/** Update input value after navigation */
		if (to?.url) {
			q =
				to.url.searchParams
					.get('_q')
					?.trim()
					.replace(/(\r\n|\n|\r)/gm, ' ') // replace line breaks with spaces
					.replace(/\s+/g, ' ') || ''; // replace multiple whitespaces with one space
		}
	});

	function handleSubmit(event: SubmitEvent) {
		if (!q || !q.trim()) {
			event.preventDefault();
		} else {
			q = q.trim();
		}
	}

	function clearSearch(event: MouseEvent) {
		event.preventDefault();
		q = '';
	}
</script>

{#snippet fallbackInput()}
	<input
		type="search"
		name="_q"
		bind:value={q}
		placeholder={m.searchPlaceholder()}
		aria-label={m.search()}
		autocomplete="off"
		autocapitalize="off"
		spellcheck="false"
		maxlength={2048}
	/>
{/snippet}

<form class="search" action="find" onsubmit={handleSubmit}>
	<div class="search-icon">
		<IconSearch />
	</div>
	{#await import('./SuperSearch.svelte')}
		{@render fallbackInput()}
	{:then { default: SuperSearch }}
		<SuperSearch bind:value={q} placeholder={m.searchPlaceholder()} ariaLabel={m.search()} />
	{:catch}
		{@render fallbackInput()}
	{/await}
	{#each hiddenSearchParams as [name, value]}
		<input type="hidden" {name} {value} />
	{/each}
	{#if q}
		{#if mounted}
			<button class="clear-action" aria-label={m.clearSearch()} onclick={clearSearch}>
				<IconClear />
			</button>
		{:else}
			<a href="/" class="clear-action" aria-label={m.clearSearch()} onclick={clearSearch}>
				<IconClear />
			</a>
		{/if}
	{/if}
</form>

<style>
	form {
		position: relative;
	}

	form :global(input),
	form :global(textarea),
	form :global(.multiline::after) {
		box-shadow: var(--box-shadow-border-all);
		border: none;
		border-radius: 8px;
		background: #fff;
		padding: 0.875rem var(--height-input-base);
		width: 100%;
		min-height: var(--height-input-lg);
		resize: none;
		font-size: var(--font-size-sm);
	}

	form :global(input),
	form :global(:not(.multiline) textarea) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.search-icon {
		display: flex;
		position: absolute;
		justify-content: center;
		align-items: center;
		z-index: 100;
		width: var(--height-input-base);
		height: var(--height-input-lg);
		pointer-events: none;
		color: var(--color-subtle);
	}

	.clear-action {
		display: flex;
		position: absolute;
		top: 0;
		right: 0;
		justify-content: center;
		align-items: center;
		z-index: 100;
		cursor: pointer;
		border: none;
		width: var(--height-input-base);
		height: var(--height-input-lg);
		color: var(--color-subtle);

		&:hover,
		&:focus {
			color: var(--color-base);
		}
	}
</style>
