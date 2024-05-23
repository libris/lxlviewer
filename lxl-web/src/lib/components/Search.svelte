<script lang="ts">
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import getDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
	import getSortedSearchParams from '$lib/utils/getSortedSearchParams';
	import BiSearch from '~icons/bi/search';

	export let placeholder: string;
	export let autofocus: boolean = false;

	$: showAdvanced = $page.url.searchParams.get('_x') === 'advanced';
	let q = showAdvanced
		? $page.url.searchParams.get('_q')?.trim()
		: $page.url.searchParams.get('_i')?.trim();

	let params = getSortedSearchParams(getDefaultSearchParams($page.url.searchParams));
	// Always reset these params on new search
	params.set('_offset', '0');
	params.delete('_i');
	params.delete('_o');
	params.delete('_p');
	const searchParams = Array.from(params);

	afterNavigate(({ to }) => {
		/** Update input value after navigation */
		if (to?.url) {
			let param = showAdvanced ? '_q' : '_i';
			q = new URL(to.url).searchParams.get(param)?.trim();
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

<form class="relative w-full" action="find" on:submit={handleSubmit}>
	<!-- svelte-ignore a11y-autofocus -->
	<input
		id="main-search"
		class="h-12 w-full rounded-full pr-12 text-secondary shadow-accent-dark/32 focus:shadow-search-focus focus:outline
			focus:outline-8 focus:outline-accent-dark/16 sm:h-14
			sm:pr-28"
		type="search"
		name="_q"
		{placeholder}
		aria-label="Sök"
		spellcheck="false"
		bind:value={q}
		{autofocus}
		data-testid="main-search"
	/>
	{#each searchParams as [name, value]}
		{#if name !== '_q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}

	<input type="hidden" name="_i" value={q} />
	{#if $page.url.searchParams.get('_x') === 'advanced'}
		<!-- keep 'edit' state on new search -->
		<input type="hidden" name="_x" value="advanced" />
	{/if}

	<button
		type="submit"
		class="button-primary absolute right-1 top-1 rounded-full px-3 sm:right-2 sm:top-2 sm:px-4"
	>
		<BiSearch fill="currentColor" aria-hidden="true" />
		<span class="sr-only sm:not-sr-only">{$page.data.t('search.search')}</span>
	</button>
</form>
