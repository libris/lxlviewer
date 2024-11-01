<script lang="ts">
	import { page } from '$app/stores';
	import getHiddenSearchParams from '$lib/utils/getHiddenSearchParams';
	import * as m from '$lib/paraglide/messages.js';
	import SearchInputWrapper from '$lib/components/SearchInputWrapper.svelte';
	import { languageTag } from '$lib/paraglide/runtime.js';
	import type { QualifierTypeResponse } from '../../routes/api/[[lang=lang]]/qualifier-type/+server';
	/** Tests to do
	 * - [] input value is updated after navigating between different find routes (e.g. using back)
	 * - [] input value is clearable
	 */

	let q = $state($page.url.searchParams.get('_q') || '');
	let formElement: HTMLFormElement | undefined = $state();

	const hiddenSearchParams = getHiddenSearchParams($page.url.searchParams);

	const lazyLoadSuperSearch = Promise.all([
		import('./SuperSearch.svelte'),
		getValidQualifierTypes()
	]);

	async function getValidQualifierTypes() {
		const qualifierTypeRes = await fetch(`/api/${languageTag() || 'sv'}/qualifier-type`);
		const qualifiers = (await qualifierTypeRes.json()) as QualifierTypeResponse;
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

<form action="find" bind:this={formElement}>
	{#await lazyLoadSuperSearch}
		<SearchInputWrapper showClearSearch={!!q} onclearsearch={clearSearch}>
			{@render fallbackInput()}
		</SearchInputWrapper>
	{:then [{ default: SuperSearch }, validQualifierTypes]}
		<SuperSearch bind:value={q} placeholder={m.searchPlaceholder()} {validQualifierTypes} />
	{:catch}
		<SearchInputWrapper showClearSearch={!!q} onclearsearch={clearSearch}>
			{@render fallbackInput()}
		</SearchInputWrapper>
	{/await}
	{#each hiddenSearchParams as [name, value]}
		<input type="hidden" {name} {value} />
	{/each}
</form>
