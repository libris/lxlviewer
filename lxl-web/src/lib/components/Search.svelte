<script lang="ts">
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import getHiddenSearchParams from '$lib/utils/getHiddenSearchParams';
	import IconSearch from '~icons/bi/search';
	import * as m from '$lib/paraglide/messages.js';

	/** Tests to do
	 * - [] input value is updated after navigating between different find routes (e.g. using back)
	 */

	let q = $page.url.searchParams.get('_q')?.trim() || '';

	const hiddenSearchParams = getHiddenSearchParams($page.url.searchParams);

	afterNavigate(({ to }) => {
		/** Update input value after navigation */
		if (to?.url) {
			q = to.url.searchParams.get('_q')?.trim() || '';
		}
	});

	function handleSubmit(event: SubmitEvent) {
		if (!q || !q.trim()) {
			event.preventDefault();
		} else {
			q = q.trim();
		}
	}
</script>

{#snippet fallbackSearch()}
	<input
		class="app-search"
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

<form class="search" action="find" on:submit={handleSubmit}>
	<div class="search-icon">
		<IconSearch />
	</div>
	{#await import('./SuperSearch.svelte')}
		{@render fallbackSearch()}
	{:then { default: SuperSearch }}
		<SuperSearch bind:value={q} placeholder={m.searchPlaceholder()} ariaLabel={m.search()} />
	{:catch}
		{@render fallbackSearch()}
	{/await}
	{#each hiddenSearchParams as [name, value]}
		<input type="hidden" {name} {value} />
	{/each}
</form>

<style>
	form :global(input),
	form :global(textarea) {
		box-shadow: var(--box-shadow-border-all);
		border: none;
		border-radius: 8px;
		background: #fff;
		padding-right: var(--padding-base);
		padding-left: var(--height-input-base);
		width: 100%;
		min-height: var(--height-input-lg);
		overflow: hidden;
		font-size: var(--font-size-sm);
		text-overflow: ellipsis;
	}

	.search-icon {
		display: flex;
		position: absolute;
		justify-content: center;
		align-items: center;
		z-index: 1;
		width: var(--height-input-base);
		height: var(--height-input-lg);
		pointer-events: none;
	}
</style>
