<script lang="ts">
	import { page } from '$app/stores';
	import getDefaultSearchParams from '$lib/utils/addDefaultSearchParams';
	import getSortedSearchParams from '$lib/utils/getSortedSearchParams';
	import { afterNavigate } from '$app/navigation';

	let q = $page.url.searchParams.get('q')?.trim();

	afterNavigate(({ to }) => {
		/** Update input value after navigation */
		if (to?.url) {
			q = new URL(to.url).searchParams.get('q')?.trim();
		}
	});

	const searchParams = Array.from(
		getSortedSearchParams(getDefaultSearchParams($page.url.searchParams))
	);

	export let autofocus = false;
	export let tabindex: number | undefined = undefined;

	function handleSubmit(event: SubmitEvent) {
		if (!q || !q.trim()) {
			event.preventDefault();
		} else {
			q = q.trim();
		}
	}
</script>

<form class="search" action="/search" on:submit={handleSubmit}>
	<!-- svelte-ignore a11y-autofocus -->
	<input
		type="search"
		name="q"
		placeholder="Sök på författare, titel, ämne eller fria sökord"
		aria-label="Sök"
		spellcheck="false"
		bind:value={q}
		{autofocus}
		{tabindex}
	/>
	{#each searchParams as [name, value]}
		{#if name !== 'q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
</form>

<style lang="scss">
	.search {
		display: flex;
		align-items: center;
		width: 100%;
	}
	input {
		width: 100%;
		min-height: var(--height-input);
		border: none;
		border-radius: 48px;
		padding: 0 1rem;
		font-size: inherit;
		box-shadow: 0 1px 1px rgba(112 112 112 / 0.12), 0 1px 5px rgba(112 112 112 / 0.375);
	}
</style>
