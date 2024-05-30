<script lang="ts">
	import { page } from '$app/stores';
	import type { Link } from '$lib/utils/xl';

	export let view: Link;

	let _i = $page.url.searchParams.get('_i')?.trim() || '';

	let url = new URL($page.url.origin + view['@id']);
	let searchParams = new URLSearchParams(url.search);
	searchParams.set('_sort', $page.url.searchParams.get('_sort')?.trim() || '');

	function handleSubmit(e: SubmitEvent) {
		if (!_i) {
			e.preventDefault();
		}
	}
</script>

<form action="" on:submit={handleSubmit} class="flex gap-2">
	<label for="search-related" class="sr-only">{$page.data.t('search.RelatedSearchLabel')}</label>
	<input
		id="search-related"
		type="search"
		placeholder={$page.data.t('search.RelatedSearchLabel')}
		bind:value={_i}
	/>
	<button disabled={!_i} class="button-primary" type="submit"
		>{$page.data.t('search.search')}</button
	>

	{#each searchParams as [name, value]}
		{#if name !== '_i' && name !== '_q'}
			<input type="hidden" {name} {value} />
		{/if}
	{/each}
	<input type="hidden" name="_i" value={_i} />
	<input type="hidden" name="_q" value={_i} />
</form>
