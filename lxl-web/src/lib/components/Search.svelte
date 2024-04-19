<script lang="ts">
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import getDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
	import getSortedSearchParams from '$lib/utils/getSortedSearchParams';

	export let placeholder: string;
	export let autofocus: boolean = false;

	$: showAdvanced = $page.url.searchParams.get('_x') === 'advanced';
	let q = showAdvanced
		? $page.url.searchParams.get('_q')?.trim()
		: $page.url.searchParams.get('_i')?.trim();

	let params = getSortedSearchParams(getDefaultSearchParams($page.url.searchParams));
	params.set('_offset', '0'); // Always reset offset on new search
	params.delete('_i'); // delete possibly old '_i' value on new search
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

<form class="w-full" action="find" on:submit={handleSubmit}>
	<!-- svelte-ignore a11y-autofocus -->
	<input
		id="main-search"
		class="h-12 w-full rounded-full text-secondary sm:h-14"
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
</form>
