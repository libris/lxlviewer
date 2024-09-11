<script lang="ts">
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import getHiddenSearchParams from '$lib/utils/getHiddenSearchParams';
	import * as m from '$lib/paraglide/messages.js';
	import SearchInputWrapper from '$lib/components/SearchInputWrapper.svelte';
	import { languageTag } from '$lib/paraglide/runtime.js';
	import type { Qualifiers } from '$lib/types/qualifier';

	/** Tests to do
	 * - [] input value is updated after navigating between different find routes (e.g. using back)
	 * - [] input value is clearable
	 */

	let q = $state($page.url.searchParams.get('_q')?.trim() || '');
	let formElement: HTMLFormElement | undefined = $state();

	const hiddenSearchParams = getHiddenSearchParams($page.url.searchParams);

	afterNavigate(({ to }) => {
		/** Update input value after navigation */
		if (to?.url) {
			q = to.url.searchParams.get('_q') || '';
		}
	});

	function handleSubmit(event: SubmitEvent) {
		if (!q || !q.trim()) {
			event.preventDefault();
		} else {
			q = q.trim();
		}
	}

	const lazyLoadedComponent = Promise.all([import('./SuperSearch.svelte'), getValidQualifiers()]);

	async function getValidQualifiers() {
		const qualifiersRes = await fetch(`/api/${languageTag() || 'sv'}/qualifiers`);
		const qualifiers = (await qualifiersRes.json()) as Qualifiers;
		return qualifiers;
	}

	function clearSearch() {
		q = '';
		formElement?.querySelector('input')?.focus();
	}
</script>

{#snippet fallbackInput()}
	<input
		class="search-input"
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

<form action="find" bind:this={formElement} onsubmit={handleSubmit}>
	{#await lazyLoadedComponent}
		<SearchInputWrapper showClearSearch={!!q} onclearsearch={clearSearch}>
			{@render fallbackInput()}
		</SearchInputWrapper>
	{:then [{ default: SuperSearch }, validQualifiers]}
		<SuperSearch bind:value={q} placeholder={m.searchPlaceholder()} {validQualifiers} />
	{:catch}
		<SearchInputWrapper showClearSearch={!!q} onclearsearch={clearSearch}>
			{@render fallbackInput()}
		</SearchInputWrapper>
	{/await}
	{#each hiddenSearchParams as [name, value]}
		<input type="hidden" {name} {value} />
	{/each}
</form>

<style>
	form :global(.search-input) {
		border: none;
		background: none;
		padding: 0.875rem 1px;
		width: 100%;
		height: 100%;
		min-height: var(--height-input-lg);
		overflow: hidden;
		font-size: var(--font-size-sm);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
