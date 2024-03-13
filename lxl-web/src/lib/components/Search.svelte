<script lang="ts">
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import getDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
	import getSortedSearchParams from '$lib/utils/getSortedSearchParams';

	export let placeholder: string;
	export let autofocus: boolean = false;

	let q = $page.url.searchParams.get('q')?.trim();

	const searchParams = Array.from(
		getSortedSearchParams(getDefaultSearchParams($page.url.searchParams))
	);

	afterNavigate(({ to }) => {
		/** Update input value after navigation */
		if (to?.url) {
			q = new URL(to.url).searchParams.get('q')?.trim();
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
		name="q"
		{placeholder}
		aria-label="Sök"
		spellcheck="false"
		bind:value={q}
		{autofocus}
		data-testid="main-search"
	/>
	{#each searchParams as [name, value]}
		{#if name !== 'q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
</form>
